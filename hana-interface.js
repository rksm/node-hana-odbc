var util = require("util"),
    odbc = require("odbc"),
    async = require("async"),
    db = new odbc.Database();

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

var hanaInterface = {

    createSession: function(config) { return new Session(config); }
}

module.exports = hanaInterface;