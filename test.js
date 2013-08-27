/*
 * run with "node test.js user password"
 */

var util = require("util"),
    hanaInterface = require('./hana-interface');

var user = process.argv[2],
    password = process.argv[3],
    // see /etc/odbc.ini
    dsn = util.format('DSN=hana;UID=%s;PWD=%s', user, password),
    session = hanaInterface.getSession({dsn: dsn});

session.query('SFLIGHT', "select * from SAPLANE",
              function(err, results) {
                  console.log(JSON.stringify(results, null, 2));
		  session.close(function() { console.log('done'); });
              });
