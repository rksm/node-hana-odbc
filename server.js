var util = require("util"),
    odbc = require("odbc"),
    async = require("async"),
    db = new odbc.Database();

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function Session(config) {
    this.dsn = config.dsn;
    this.db = config.db || new odbc.Database();

    this.connectionEstablished = false;
    this.connectInProgress = false;
    this.afterConnectionCallbacks = [];
    this.afterSchemaSelectCallbacks = [];
    this.currentSchema = null;
}

Session.prototype.connect = function(callback) {
    var session = this;
    session.afterConnectionCallbacks.push(callback);
    if (session.connectInProgress) return;
    session.connectInProgress = true;
    this.db.open(this.dsn, function() {
        session.connectionEstablished = true;
        session.connectInProgress = false;
        while (session.afterConnectionCallbacks.length > 0) {
            session.afterConnectionCallbacks.shift().call(session);
        }
    });
}

Session.prototype.selectSchema = function(schema, callback) {
    var session = this;
    session.afterSchemaSelectCallbacks.push(callback);
    this.db.query("set schema " + schema, function(err, rows, moreResultSets) {
        session.currentSchema = schema;
        while (session.afterSchemaSelectCallbacks.length > 0) {
            session.afterSchemaSelectCallbacks.shift().call(session);
        }
    });
}

Session.prototype.query = function(schema, sqlStatement, callback) {
    if (!this.connectionEstablished) {
        this.connect(this.query.bind(this, schema, sqlStatement, callback));
        return;
    }

    if (this.currentSchema !== schema) {
        this.selectSchema(schema, this.query.bind(this, schema, sqlStatement, callback));
        return;
    }
    this.db.query(sqlStatement, function(err, rows, moreResultSets) {
        callback(err, {rows: rows, hasMoreResultSets: moreResultSets});
    });
}

var sessionTable = {};

var hanaInterface = {

    getSession: function(config) {
        if (!config.sessionKey) return new Session(config);
        return sessionTable[config.sessionKey] ?
            sessionTable[config.sessionKey] :
            sessionTable[config.sessionKey] = new Session(config);
    }

}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// see /etc/odbc.ini
var dsn = 'DSN=hana;'
        + 'UID=robertkrahn;'
        + 'PWD=Pa2e476f0';

module.exports = function(baseRoute, app) {
    app.all(baseRoute + '*', function(req, res, next) {
        // see https://developer.mozilla.org/en-US/docs/HTTP_access_control#Preflighted_requests
        res.set({'Access-Control-Allow-Origin': '*'});
        res.set({'Access-Control-Allow-Methods': '*'}); // 'GET,POST,OPTIONS'
        res.set({'Access-Control-Allow-Headers': 'CONTENT-TYPE'}); // for POST requests with payload
        next();
    });
    app.get(baseRoute, function(req, res) {
        res.send({usage: req.url + " POST with {schema: STRING, query: STRING}"});
    })
    app.post(baseRoute, function(req, res) {
        var session = hanaInterface.getSession({dsn: dsn}),
            data = req.body;

        console.log('Running hana SQL query ' + data);
        session.query(data.schema, data.query, function(err, results) {
            res.status(err ? 400 : 200).send(err || results);
        });
    });
}
