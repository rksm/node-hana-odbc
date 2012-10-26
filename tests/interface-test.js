/*global exports, require, JSON, __dirname, console*/

// continously run with:
// nodemon -x nodeunit tests/*js

var hanaInterface = require('./../hana-interface'),
    async = require('async');


// -=-=-=-=-=-=-=-=-=-
// mock db for testing
// -=-=-=-=-=-=-=-=-=-

var db = {},
    openCalls, selectedSchema,
    queries, queryError, queryResult;

db.open = function(dsnString, callback) {
    openCalls++;
    callback();
}

db.query = function(sqlStatement, callback) {
    queries.push(sqlStatement);
    callback(queryError, queryResult.rows, queryResult.hasMoreResultSets);
}

// -=-=-=-=-
// the tests
// -=-=-=-=-

// +-----+-----+
// |foo  |bar  |
// +-----+-----+
// |1    |2    |
// +-----+-----+
// |3    |4    |
// +-----+-----+
var defaultResult = {
    hasMoreResultSets: false,
    rows: [
        {foo: 1, bar: 2},
        {foo: 3, bar: 4}
    ]
};

var InterfaceTests = {

    setUp: function(run) {
        openCalls = 0;
        selectedSchema = null;
        queries = [];
        queryError = null;
        queryResult = null;
        run();
    },

    tearDown: function(run) {
        run()
    },

    "run simple query": function(test) {
        queryResult = defaultResult;
        var session = hanaInterface.createSession({dsn: 'foo bar', db: db}), result;
        session.query("fooSchema", "select * from fooTable", function(err, resultSet) { result = resultSet; });
        test.equals(1, openCalls);
        test.deepEqual(["set schema fooSchema", "select * from fooTable"], queries);
        test.deepEqual(defaultResult, result);
        test.done();
    },

    "run two queries in same session": function(test) {
        queryResult = defaultResult;
        var session = hanaInterface.createSession({dsn: 'foo bar', db: db}), result;
        session.query("fooSchema", "select * from fooTable", function(err, resultSet) { result = resultSet; });
        session.query("fooSchema", "select bar from fooTable", function(err, resultSet) { result = resultSet; });
        test.equals(1, openCalls);
        test.deepEqual(["set schema fooSchema", "select * from fooTable", "select bar from fooTable"], queries);
        test.deepEqual(defaultResult, result);
        test.done();
    }

}

exports.InterfaceTests = InterfaceTests;