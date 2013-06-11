var express = require('express');
var http = require('http')
var path = require('path');

var config = require('./config');

var professor = require('./routes/professor');
var assignatura = require('./routes/assignatura');
var aula = require('./routes/aula');

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

app.get('/professors/assignatures', professor.assignatures);
app.get('/assignatures/aula', aula.index);
app.get('/assignatures/aules', assignatura.aules);
app.get('/assignatures/aules/estudiants', aula.estudiants);
app.get('/assignatures/aules/estudiant', aula.estudiant);
app.get('/assignatures/consultors', assignatura.consultors);


app.get('/assignatures', function (req, res) {
	return assignatures.bypra(req.query.idp, req.quer.anyAcademic, function (err, result) {

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