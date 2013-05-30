var express = require('express');
var http = require('http')
var path = require('path');

var ws = require('./routes/ws');
var config = require('./config');

var app = express();

app.set('port', config.port());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(app.router);

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/ws/getAssignaturaByCodi', ws.getAssignaturaByCodi);
app.get('/ws/getUserRoles', ws.getUserRoles);
app.get('/ws/isUserAuthenticated', ws.isUserAuthenticated);

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});