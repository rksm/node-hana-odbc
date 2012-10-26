var util = require("util"),
    hanaInterface = require('./hana-interface');

// see /etc/odbc.ini
var dsn = 'DSN=hana;'
        + 'UID=robertkrahn;'
        + 'PWD=Pa2e476f0';

var session = hanaInterface.createSession({dsn: dsn});

session.query('SFLIGHT', "select * from SAPLANE",
                    function(err, results) {
                        console.log(JSON.stringify(results, null, 2));
                        console.log("done");
                    })
