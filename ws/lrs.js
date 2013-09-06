var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.byidp = function(idp, s, callback) {

    var url = util.format('%s/guaita/idp/%s',
        config.lrs(),
        idp
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.bysubject = function(domainId, s, callback) {

    var url = util.format('%s/guaita/subjects/%s',
        config.lrs(),
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byclassroom = function(domainId, s, callback) {

    var url = util.format('%s/guaita/classrooms/%s',
        config.lrs(),
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byactivity = function(eventId, s, callback) {

    var url = util.format('%s/guaita/activities/%s',
        config.lrs(),
        eventId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.bytool = function(resourceId, s, callback) {

    var url = util.format('%s/guaita/tools/%s',
        config.lrs(),
        resourceId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandsubject = function(idp, domainId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/subjects/%s',
        config.lrs(),
        idp,
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandclassroom = function(idp, domainId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/classrooms/%s',
        config.lrs(),
        idp,
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandactivity = function(idp, eventId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/activities/%s',
        config.lrs(),
        idp,
        eventId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandtool = function(idp, resourceId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/tools/%s',
        config.lrs(),
        idp,
        resourceId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidplast = function(idp, s, callback) {

    var url = util.format('%s/guaita/idp/%s/last',
        config.lrs(),
        idp
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result[0].stored });
    });
}

exports.byidpandsubjectlast = function(idp, domainId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/subjects/%s/last',
        config.lrs(),
        idp,
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result[0].stored });
    });
}

exports.byidpandclassroomlast = function(idp, domainId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/classrooms/%s/last',
        config.lrs(),
        idp,
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result[0].stored });
    });
}

exports.byidpandactivitylast = function(idp, eventId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/activities/%s/last',
        config.lrs(),
        idp,
        eventId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result[0].stored });
    });
}

exports.byidpandtoollast = function(idp, resourceId, s, callback) {

    var url = util.format('%s/guaita/idp/%s/tools/%s/last',
        config.lrs(),
        idp,
        resourceId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result[0].stored });
   });
}