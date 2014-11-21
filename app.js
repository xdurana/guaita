global.__base = __dirname;

var express = require('express');
var http = require('http');
var path = require('path');
var swig = require('swig');
var app = express();
var config = require(__base + '/config');

app.set('port', config.port());
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/lib/views');
app.set('view cache', false);

app.use(express.favicon());
app.use(express.bodyParser());
app.use(config.i18next.handle);
app.use(express.methodOverride());
app.use('/app/guaita', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(app.router);

config.i18next.registerAppHelper(app);
config.services = require(__base + '/lib/services/index');
config.user = require(__base + '/lib/services/auth')(app, config);
config.indicadors = require(__base + '/lib/utils/indicadors')(config);

require('./lib/controllers/calendar/index')(app, config);
require('./lib/controllers/classrooms/index')(app, config);
require('./lib/controllers/resources/index')(app, config);
require('./lib/controllers/rooms/index')(app, config);
require('./lib/controllers/statistics/index')(app, config);
require('./lib/controllers/test/index')(app, config);
require('./lib/controllers/widget/index')(app, config);
require('./lib/controllers/monitor/index')(app, config);

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
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
