var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jsforce = require('jsforce');
var cors = require('cors')

var eventsRouter = require('./routes/events');

var app = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const str="I AM AN ENDPOINT FOR YOUR SALESFORCE APPLICATION";
    res.send(str);
});

function jsForceConnection(req, res, next) {
    var conn = new jsforce.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl : 'https://firsterror-dev-ed.my.salesforce.com'
    });
    const username = "ankitbihani415@username.com"
    const password = "p9bQ(A`^.A:!KRn$"
    const securityToken = "8CQ1xibOFeqWH7ZUVkBAok2JQ"
    conn.login(username, password+securityToken, function(err, userInfo) {
        if (err) { return console.error(err); }
        // console.log(conn.accessToken);
        // console.log(conn.instanceUrl);
        // console.log("User ID: " + userInfo.id);
        // console.log("Org ID: " + userInfo.organizationId);
        req.conn = conn
        next()
    });
}
app.use('/api/v1/events',jsForceConnection, eventsRouter);

module.exports = app;
