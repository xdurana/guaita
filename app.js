var express = require('express');
var http = require('http')
var path = require('path');
var request = require('request');
var cons = require('consolidate');
var swig = require('swig');

var config = require('./config');

var assignatures = require('./routes/assignatures');
var aules = require('./routes/aules');
var activitats = require('./routes/activitats');
var eines = require('./routes/eines');
var estudiants = require('./routes/estudiants');
var consultors = require('./routes/consultors');
var connexions = require('./routes/connexions');

var app = express();

app.set('port', config.port());

app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
swig.init({
    root: __dirname + '/views',
	autoescape: true,
	cache: true,
	encoding: 'utf8',
    allowErrors: true
});

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(app.router);

app.use(function(err, req, res, next) {
	res.status(500);
	res.json({ error: err });
});

if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

//TODO: authenticate IDP

app.get('/assignatures', function (req, res) {
	return assignatures.bypra(req.query.s, req.query.anyAcademic, function (err, result) {
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

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/activitats', function (req, res) {
	return activitats.all(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, function (err, result) {
		res.json(result);
	});		
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/activitats/:ordre', function (req, res) {
	return activitats.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.ordre, function (err, result) {
		res.json(result);
	});		
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/eines', function (req, res) {
	return eines.all(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/eines/:codEina', function (req, res) {
	return eines.one(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.codEina, function (err, result) {
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

app.get('/assignatures/:codAssignatura/:anyAcademic/aules/:codAula/estudiants/:numExpedient/connexions', function (req, res) {
	return connexions.all(req.params.codAssignatura, req.params.anyAcademic, req.params.codAula, req.params.numExpedient, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/:codAssignatura/:anyAcademic/consultors', function (req, res) {
	return consultors.all(req.params.codAssignatura, req.params.anyAcademic, function (err, result) {
		res.json(result);
	});
});

app.get('/assignatures/phpBB3', function (req, res) {
	return eines.phpBB3(req.query.domainId, req.query.forumId, function (err, result) {
		res.json(result);
	});
});

app.get('/', function(req, res) {
	res.render('pra', { title: 'The index page!' })
	//res.json({status: 'Express server listening on port ' + app.get('port') });
});

app.get('/pra', function(req, res, next) {
	if (req.query.s && req.query.idp) {
		var url = "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures?idp=" + req.query.idp + "&s=" + req.query.s;
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//res.json(JSON.parse(body));
				res.render('pra.html', { subjects: body.subjects })
			} else {
				next('error al carregar assignatures del idp');
			}
		});
	} else {
		next('manquen algun dels parametres de la crida [s, idp]');
	}
});


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});