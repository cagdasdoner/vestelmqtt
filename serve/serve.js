var http = require('http'), express = require('express');
var methodOverride = require('method-override');
var querystring = require('querystring');

var auth = require("../auth/auth.js");
var monitor = require("../monitor/monitor.js");

var port = process.env.PORT || 80;
var app = express();
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));

/* Start HTTP Server */
var server = http.createServer(app).listen(port, function() {
    console.log("HTTP Server listening to %d within %s environment",
          port, app.get('env'));
});

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
  
app.get('/', function(req, res){
    res.send(monitor.monitorResult());
});

