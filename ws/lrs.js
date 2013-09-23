var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.byidp = function(idp, s, callback) {
    var data = { "actor.account.name": util.format("%s", idp) };
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidplast = function(idp, s, callback) {
    var data = { "actor.account.name": util.format("%s", idp) };
    service.last(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.bysubject = function(domainId, s, callback) {
    var data = { "context.extensions.uoc:lrs:subject:id": util.format("%s", domainId) };
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byclassroom = function(domainId, s, callback) {
    var data = { "context.extensions.uoc:lrs:classroom:id": util.format("%s", domainId) };
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byactivity = function(eventId, s, callback) {
    var data = { "context.extensions.uoc:lrs:activity:id": util.format("%s", eventId) };
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byactivityandclassroom = function(domainId, eventId, s, callback) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:classroom:id" : util.format("%s", domainId) }, { "context.extensions.uoc:lrs:activity:id": util.format("%s", eventId) }]};
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.bytool = function(resourceId, s, callback) {
    var data = { "object.id" : util.format("T:%s", resourceId) };
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.bytoolandclassroom = function(domainId, resourceId, s, callback) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:classroom:id" : util.format("%s", domainId) }, { "object.id" : util.format("T:%s", resourceId) }]};
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandsubject = function(idp, domainId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "context.extensions.uoc:lrs:subject:id": util.format("%s", domainId) }]};
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandsubjectlast = function(idp, domainId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "context.extensions.uoc:lrs:subject:id": util.format("%s", domainId) }]};
    service.last(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandclassroom = function(idp, domainId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": util.format("%s", domainId) }]};
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandclassroomlast = function(idp, domainId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": util.format("%s", domainId) }]};
    service.last(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandactivity = function(idp, eventId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": util.format("%s", eventId) }]};
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandactivitylast = function(idp, eventId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": util.format("%s", eventId) }]};
    service.last(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandtool = function(idp, resourceId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "object.id": util.format("T:%s", resourceId) }]};
    service.count(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}

exports.byidpandtoollast = function(idp, resourceId, s, callback) {
    var data = { "$and":[{ "actor.account.name" : util.format("%s", idp) }, { "object.id": util.format("T:%s", resourceId) }]};
    service.last(data, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(null, { value: result });
    });
}