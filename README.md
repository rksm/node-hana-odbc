# hana-odbc

node.js library that is a thin wrapper around [node-odbc](https://github.com/wankdanker/node-odbc) to connect to

[![](http://www.saphana.com/themes/generated_advanced_skin_global2/images/home.png)](http://www.saphana.com/welcome)

# Install

## odbc backend

node-odbc will need a odbc driver to connect to HANA. I have used [unixodbc
](http://www.unixodbc.org/) so far. For using it make sure you setup a data
source (DSN) that points to a HANA instance. [Here](http://scn.sap.com/community/developer-center/hana/blog/2012/09/14/hana-with-odbc-on-ubuntu-1204)
is a description for how to setup an odbc connection on Ubuntu.

##  hana-odbc from npm

hana-odbc is on npm, to install it run

    $ npm install hana-odbc

If a corporate firewall is bugging npm try

    $ npm --proxy http://username:password@proxyservername:port --strict-ssl false install

## Or: from github (alternative to npm install above)

To install from github do

    $ git clone https://github.com/rksm/node-hana-odbc.git
    $ cd node-hana-odbc
    $ npm install

# Usage

The [`test.js`](test.js) file shows how to connect to and query a database. It
uses the SFLIGHT schema by default. To test if it works make sure your DB
includes this schema and run

    $ node test.js username password

[`server.js`](server.js) shows how you can provide a HTTP interface with a
expressjs-like backend.

To just use the programatic interface require [`hana-interface.js
`](hana-interface.js) ast it is done in `test.js` and `server.js`.

## API

### getSession(dsn)

Returns an odbc session object for interacting with a HANA database.

__Arguments__

* dsn - Specifies the data source and access parameters.

__Example__

```js
var session = hanaInterface.getSession({dsn: "DSN=hana;UID=UserName;PWD=Password"});
```

### session.connect(callback)

Establishes a connection to a HANA DB.

__Arguments__

* callback - Called when the connection was established or when an error
  occurs. Called with one argument, an error object.

__Example__

```js
session.connect(function(err) {
    if (err) console.error('Could not connect!');
    else console.log('Connection established!');
});
```

### session.query(schema, sqlStatement, callback)

Selects a schema, sends a query, and invokes callback with the query result. If
no DB connection is established yet this method will also create a connection.

__Arguments__

* schema - String, the name of the schema
* sqlStatement - String, the SQL to run
* callback - Function that takes two arguments: error and result. result is a
  object matching `{rows: rows, hasMoreResultSets: moreResultSets}`. The property
  rows is an array representing the rows that are the query result.
  hasMoreResultSets is a Bool that signals whether there are more results. If
  true, callback will be called again with the remaining results.

__Example__

```js
session.query(
    'SFLIGHT', "select * from SAPLANE",
    function(err, results) {
        console.log(JSON.stringify(results, null, 2));
        if (!results.hasMoreResultSets)
            session.close(console.log.bind(console, 'done'));
    });
```

### session.close(callback)

Ends the connection to a HANA DB.

__Arguments__

* callback - Called when the connection was closed. Takes an error
  object as its single arguments that is non-null in case of a problem closing
  the connection.

__Example__

```js
session.close(function(err) {
    if (err) console.error('Could not close!');
    else console.log('Closed!');
});
```

# License

[MIT License](LICENSE)
