# node-hana

node.js connection to SAP HANA using node-odbc.

# Install

## unixodbc

Required for running is [unixodbc](http://www.unixodbc.org/). Make sure it is
installed. Make sure you setup a data source (DSN) that points to a HANA
instance. [Here](http://scn.sap.com/community/developer-center/hana/blog/2012/09/14/hana-with-odbc-on-ubuntu-1204)
is a description for how to setup an odbc connection on Ubuntu.

##  node-hana from npm

node-hana is on npm, to install it run

    $ npm install node-hana

If a corporate firewall is bugging npm try

    $ npm --proxy http://proxy.pal.sap.corp:8080 --strict-ssl false install

## from github

To install from github do

    $ git clone https://github.com/rksm/node-hana.git
    $ cd node-hana
    $ npm install

# Usage

The `test.js` file shows how to connect To test if it works setup run

    $ node test.js username password

# License

MIT License
