# hana-odbc

node.js connection using node-odbc to

[![](http://www.saphana.com/themes/generated_advanced_skin_global2/images/home.png)](http://www.saphana.com/welcome)

# Install

## odbc backend

node-odbc will need a odbc driver to connect to HANA. I have used [unixodbc](http://www.unixodbc.org/) so far.
For using it make sure you setup a data source (DSN) that points to a HANA
instance. [Here](http://scn.sap.com/community/developer-center/hana/blog/2012/09/14/hana-with-odbc-on-ubuntu-1204)
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

The [`test.js`](test.js) file shows how to connect to and query a database. It uses the SFLIGHT schema by default. To test if it works make sure your DB includes this schema and run

    $ node test.js username password

[`server.js`](server.js) shows how you can provide a HTTP interface with a expressjs-like backend.

To just use the programatic interface require [`hana-interface.js`](hana-interface.js) ast it is done in `test.js` and `server.js`.

# License

[MIT License](LICENSE)
