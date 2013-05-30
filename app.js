var express = require('express');
var http = require('http')
var path = require('path');

var config = require('./config');

var authservice = require('./ws/authservice');
var infoacademicaservice = require('./ws/infoacademicaservice');
var dadesacademiquesservice = require('./ws/dadesacademiquesservice');

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

app.get('/ws/getUserRoles', authservice.getUserRoles);
app.get('/ws/isUserAuthenticated', authservice.isUserAuthenticated);
app.get('/ws/getContextBySessionId', authservice.getContextBySessionId);

app.get('/ws/getAssignaturaByCodi', infoacademicaservice.getAssignaturaByCodi);
app.get('/ws/getAssignatures', infoacademicaservice.getAssignatures);
app.get('/ws/getAulesByAssignatura', infoacademicaservice.getAulesByAssignatura);
app.get('/ws/getAulaById', infoacademicaservice.getAulaById);
app.get('/ws/getAulesByConsultor', infoacademicaservice.getAulesByConsultor);
app.get('/ws/getPrasByAssignaturaAny', infoacademicaservice.getPrasByAssignaturaAny);

app.get('/ws/getAssignaturesByResponsableAny', dadesacademiquesservice.getAssignaturesByResponsableAny);

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});