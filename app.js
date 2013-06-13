var express = require('express');
var http = require('http')
var path = require('path');

var config = require('./config');

var assignatures = require('./routes/assignatures');
var aules = require('./routes/aules');
var estudiants = require('./routes/estudiants');
var consultors = require('./routes/consultors');

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

app.get('/assignatures', function (req, res) {
	return assignatures.bypra(req.query.idp, req.query.anyAcademic, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules', function (req, res) {
	return aules.all(req.params.codAssignatura, req.params.anyAcademic, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula', function (req, res) {
	return aules.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/estudiants', function (req, res) {
	return estudiants.all(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/estudiants/:numExpedient', function (req, res) {
	return estudiants.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.numExpedient, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/consultors', function (req, res) {
	return consultors.all(req.params.codAssignatura, req.params.anyAcademic, function (err, result) {
		res.json(result);
	});
});

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});