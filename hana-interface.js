var util = require("util"),
    odbc = require("odbc"),
    db = new odbc.Database();

function Session(config) {
    this.dsn = config.dsn;
    this.db = config.db || new odbc.Database();
    this.connectionEstablished = false;
    this.connectInProgress = false;
    this.afterConnectionCallbacks = [];
    this.afterSchemaSelectCallbacks = [];
    this.afterCloseCallbacks = [];
    this.currentSchema = null;
}

Session.prototype.connect = function(callback) {
    var session = this;
    callback && session.afterConnectionCallbacks.push(callback);
    if (session.connectInProgress) return;
    session.connectInProgress = true;
    session.db.open(session.dsn, function(err) {
        if (err) {
            console.error('Could not establish connection to HANA database: ', err);
            callback(err);
            return;
        }
        session.connectionEstablished = true;
        session.connectInProgress = false;
        while (session.afterConnectionCallbacks.length > 0) {
            session.afterConnectionCallbacks.shift().call(null, err, session);
        }
    });
}

Session.prototype.selectSchema = function(schema, callback) {
    var session = this;
    callback && session.afterSchemaSelectCallbacks.push(callback);
    session.db.query("set schema " + schema, function(err, rows, moreResultSets) {
        session.currentSchema = schema;
        while (session.afterSchemaSelectCallbacks.length > 0) {
            session.afterSchemaSelectCallbacks.shift().call(null, err, session);
        }
    });
}

Session.prototype.query = function(schema, sqlStatement, callback) {
    var session = this;
    if (!session.connectionEstablished) {
        session.connect(function(err) {
            if (err) callback(err);
            else session.query(schema, sqlStatement, callback);
        });
        return;
    }

    if (session.currentSchema !== schema) {
        session.selectSchema(schema, function(err) {
            if (err) callback(err);
            else session.query(schema, sqlStatement, callback);
        });
        return;
    }
    session.db.query(sqlStatement, function(err, rows, moreResultSets) {
        callback(err, {rows: rows, hasMoreResultSets: moreResultSets});
    });
}

Session.prototype.close = function(callback) {
    if (!this.db || !this.connectionEstablished) { callback(null); return; }
    var session = this;
    callback && session.afterCloseCallbacks.push(callback);
    session.db.close(function(err) {
        session.connectionEstablished = false;
        while (session.afterCloseCallbacks.length > 0) {
            session.afterCloseCallbacks.shift().call(null, err);
        }
    });
}

var hanaInterface = {
    sessionTable: {},
    getSession: function(config) {
        if (!config.sessionKey) return new Session(config);
        return this.sessionTable[config.sessionKey] ||
              (this.sessionTable[config.sessionKey] = new Session(config));
    }
}

module.exports = hanaInterface;
