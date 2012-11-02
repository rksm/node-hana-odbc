/*global */

// supposed to be used as a life_star (expressjs) subserver
// http://lvpal310.pal.sap.corp:9101/hana-interface.xhtml

console.log("dir" + __dirname)
var hanaInterface = require('./hana-interface');

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
            res.status(err ? 400 : 200);
            res.send(err || results);
        });
    });
}
