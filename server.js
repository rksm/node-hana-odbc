/*
 * This code can be used to integrate with the expressjs framewrok
 */

var hana = require('./hana-interface'),
    util = require('util');

var dsn = 'DSN=hana;UID=%s;PWD=%s',
    usage = {
        method: "POST",
        data: {
            schema: "STRING",
            query: "STRING",
            password: "STRING",
            user: "STRING"
        }
    };

module.exports = function(baseRoute, app) {
    app.all(baseRoute + '*', function(req, res, next) {
        // enable CORS for cross-domain querying
        // see https://developer.mozilla.org/en-US/docs/HTTP_access_control#Preflighted_requests
        res.set({'Access-Control-Allow-Origin': '*'});
        res.set({'Access-Control-Allow-Methods': '*'}); // 'GET,POST,OPTIONS'
        res.set({'Access-Control-Allow-Headers': 'CONTENT-TYPE'}); // for POST requests with payload
        next();
    });
    app.get(baseRoute, function(req, res) {
        res.json({usage: usage});
    });
    app.post(baseRoute, function(req, res) {
        var data = req.body;
        if (!data.schema || !data.query || !data.user || !data.password) {
            console.log(usage)
            res.status(400).json({usage: usage});
            return;
        }
        var queryDsn = util.format(dsn, data.user, data.password),
            session = hana.getSession({dsn: queryDsn});
        console.log('Running hana SQL query ', data);
        session.query(data.schema, data.query, function(err, results) {
            res.status(err ? 400 : 200).send(err || results);
        });
    });
}
