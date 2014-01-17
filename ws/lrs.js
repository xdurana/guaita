var config = require('../config');
var service = require('./service');

var count = function(data, next) {
    service.post(config.util.format('%s/guaita/count', config.lrs()), data, function (err, data) {
        return next(null, data);
    });
}

var last = function(data, next) {
    service.post(config.util.format('%s/guaita/all/1', config.lrs()), data, function (err, data) {
        return next(null, data);
    });
}

exports.byidp = function(idp, s, next) {
    var data = { "actor.account.name": config.util.format("%s", idp) };
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidplast = function(idp, s, next) {
    var data = { "actor.account.name": config.util.format("%s", idp) };
    last(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.bysubject = function(domainId, s, next) {
    var data = { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) };
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byclassroom = function(domainId, s, next) {
    var data = { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) };
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byactivity = function(eventId, s, next) {
    var data = { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) };
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byactivityandclassroom = function(domainId, eventId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:classroom:id" : config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }]};
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.bytool = function(resourceId, s, next) {
    var data = { "object.id" : config.util.format("T:%s", resourceId) };
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.bytoolandclassroom = function(domainId, resourceId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:classroom:id" : config.util.format("%s", domainId) }, { "object.id" : config.util.format("T:%s", resourceId) }]};
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandsubject = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) }]};
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandsubjectlast = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) }]};
    last(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandclassroom = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }]};
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandclassroomlast = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }]};
    last(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandactivity = function(idp, eventId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }]};
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandactivitylast = function(idp, eventId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }]};
    last(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandtool = function(idp, resourceId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "object.id": config.util.format("T:%s", resourceId) }]};
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}

exports.byidpandtoollast = function(idp, resourceId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "object.id": config.util.format("T:%s", resourceId) }]};
    last(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });
}