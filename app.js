var express = require('express');
var http = require('http')
var path = require('path');
var swig = require('swig');

var config = require('./config');
var controllers = require('./controllers/controllers');
var user = controllers.user;
var subject = controllers.subject;
var classroom = controllers.classroom;

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
    console.error(err.stack);
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
 * [description]
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

app.get('/app/guaita/assignatures', user.authorize, user.getSubjects);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules', user.authorize, subject.getClassroom);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode', user.authorize, classroom.get);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/eines', user.authorize, classroom.getTools);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/activitats', user.authorize, classroom.getActivities);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/activitats/:eventId/eines', user.authorize, classroom.getActivityTools);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/avaluacio', user.authorize, classroom.getAssessment);
app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/widget', user.authorize, classroom.getWidget);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});