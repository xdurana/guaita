var express = require('express');
var http = require('http')
var path = require('path');

var config = require('./config');

var authservice = require('./ws/authservice');
var infoacademicaservice = require('./ws/infoacademicaservice');
var dadesacademiquesservice = require('./ws/dadesacademiquesservice');

var professor = require('./routes/professor');

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

app.get('/ws/getUserRoles', authservice.getUserRolesWS);
app.get('/ws/isUserAuthenticated', authservice.isUserAuthenticatedWS);
app.get('/ws/getContextBySessionId', authservice.getContextBySessionIdWS);

app.get('/ws/getAssignaturaByCodi', infoacademicaservice.getAssignaturaByCodiWS);
app.get('/ws/getAssignatures', infoacademicaservice.getAssignaturesWS);
app.get('/ws/getAulesByAssignatura', infoacademicaservice.getAulesByAssignaturaWS);
app.get('/ws/getAulaById', infoacademicaservice.getAulaByIdWS);
app.get('/ws/getAulesByConsultor', infoacademicaservice.getAulesByConsultorWS);
app.get('/ws/getPrasByAssignaturaAny', infoacademicaservice.getPrasByAssignaturaAnyWS);

app.get('/ws/getAssignaturesByResponsableAny', dadesacademiquesservice.getAssignaturesByResponsableAnyWS);

app.get('/professor', professor.index);
app.get('/anys', professor.anys);
app.get('/aula', professor.aula);

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});