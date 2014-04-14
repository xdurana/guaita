var express = require('express');
var http = require('http')
var path = require('path');
var swig = require('swig');

var config = require('./config');
var controllers = require('./controllers/controllers');

var user = controllers.user;
var subject = controllers.subject;
var classroom = controllers.classroom;
var materials = controllers.materials;
var test = controllers.test;

var app = express();

app.set('port', config.port());

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

app.use(express.favicon());
app.use(express.bodyParser());
app.use(config.i18next.handle);
app.use(express.methodOverride());
app.use('/app/guaita', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(app.router);

/**
 * Error handler for console output
 * @param  {[type]}   err
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
app.use(function(err, req, res, next) {
    config.log(err);
    next(err);
});

/**
 * 404
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
app.use(function(req, res, next) {
    res.json({
        status: 404,
        url: req.url
    });
});

/**
 * 500
 * @param  {[type]}   err  [description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
app.use(function(err, req, res, next) {
    res.status(500);
    res.json({
        status: 500,
        url: req.url,
        error: err 
    });
});

config.i18next.registerAppHelper(app);

app.get('/app/guaita/calendari', user.authorize, user.calendar);
app.get('/app/guaita/assignatures', user.authorize, user.subjects);

app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules', user.authorize, subject.classroom);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/estadistiques', user.authorize, subject.estadistiques);

app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode', user.authorize, classroom.get);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/eines', user.authorize, classroom.getTools);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/activitats', user.authorize, classroom.getActivities);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/activitats/:eventId/eines', user.authorize, classroom.getActivityTools);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/avaluacio', user.authorize, classroom.getAssessment);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/widget', user.authorize, classroom.getWidget);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/rac', user.authorize, classroom.rac);

app.get('/app/guaita/registre', user.authorize, user.registre);

app.get('/app/guaita/materials', user.admin, materials.get);
app.get('/app/guaita/materials/:pid', user.admin, materials.getHTML5);
app.get('/app/guaita/materials/assignatura/:codAssignatura', user.admin, materials.assignatura);

app.get('/app/guaita/test/pra', user.admin, test.pra);
app.get('/app/guaita/test/consultor', user.admin, test.consultor);
app.get('/app/guaita/test/estudiant', user.admin, test.estudiant);
app.get('/app/guaita/test/widget', user.admin, test.widget);
app.get('/app/guaita/test/aula', user.admin, test.aula);
app.get('/app/guaita/test/material', user.admin, test.material);

app.get('/app/guaita/lrs/idp/:idp/aules/:domainId', user.byidpandclassroom);
app.get('/app/guaita/lrs/idp/:idp/aules/:domainId/last', user.byidpandclassroomlast);
app.get('/app/guaita/lrs/idp/:idp/aules/:domainId/widget', user.byidpandclassroomandwidgetlast);

var server = http.createServer(app);
server.listen(app.get('port'), function() {
    config.log('Express server listening on port ' + app.get('port'));
});

var gracefulShutdown = function() {
    config.log("Received kill signal, shutting down gracefully.");
    server.close(function() {
        config.log("Closed out remaining connections.");
        process.exit();
    });

    setTimeout(function() {
        config.log("Could not close connections in time, forcefully shutting down");
        process.exit();
    }, 10*1000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
