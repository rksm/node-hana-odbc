var util = require("util"),
    odbc = require("odbc"),
    async = require("async"),
    db = new odbc.Database();

// see /etc/odbc.ini
var dsn = 'DSN=hana;'
        + 'UID=robertkrahn;'
        + 'PWD=Pa2e476f0';

function connect(callback) {
    db.open(dsn, callback);
}

function makeQuery(sqlStatement) {
    return function(callback) {
        console.log('Querying: ' + sqlStatement);
        db.query(sqlStatement, function(err, rows, moreResultSets) {
            callback(err, {rows: rows, hasMoreResultSets: moreResultSets});
        });
    }
}

function inSchemaRunQuery(schema, sqlStatement, callback) {
    async.series([
        connect,
        makeQuery("set schema " + schema),
        makeQuery(sqlStatement)
    ], callback);
}

inSchemaRunQuery('SFLIGHT', "select * from SAPLANE",
                 function(err, results) {
                     console.log(JSON.stringify(results, null, 2));
                     console.log("done");
                 });
