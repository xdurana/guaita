var TinCan = require('tincanjs');
var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Número de registres que compleixen la condició
 * @param data
 * @param next
 */
var count = function(data, next) {
    service.post(config.util.format('%s/guaita/count', config.lrs()), data, function (err, data) {
        return next(err, data);
    });
};

/**
 * Últim registre que compleix la condició
 * @param data
 * @param next
 */
var last = function(data, next) {
    service.post(config.util.format('%s/guaita/all/1', config.lrs()), data, function (err, data) {
        return next(err, data);
    });
};

/**
 * Llista de registres que compleixen la condició
 * @param data
 * @param next
 */
var all = function(data, next) {
    service.post(config.util.format('%s/guaita/all/100', config.lrs()), data, function (err, data) {
        return next(err, data);
    });
};

exports.byidp = function(idp, s, next) {
    var data = { "actor.account.name": config.util.format("%s", idp) };
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidplast = function(idp, s, next) {
    var data = { "actor.account.name": config.util.format("%s", idp) };
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.bysubject = function(domainId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.bysubjectall = function(domainId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    all(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byclassroom = function(domainId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byactivity = function(eventId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byactivityandclassroom = function(domainId, eventId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:classroom:id" : config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.bytool = function(resourceId, s, next) {
    var data = { "$and":[{ "object.id" : config.util.format("T:%s", resourceId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.bytoolandclassroom = function(domainId, resourceId, s, next) {
    var data = { "$and":[{ "context.extensions.uoc:lrs:classroom:id" : config.util.format("%s", domainId) }, { "object.id" : config.util.format("T:%s", resourceId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandsubject = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandsubjectlast = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandclassroom = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandclassroomlast = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandclassroomandwidgetlast = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:component": "widget" }]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandactivity = function(idp, eventId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandactivitylast = function(idp, eventId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandactivityandwidgetlast = function(idp, eventId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }, { "context.extensions.uoc:lrs:component": "widget" }]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandtool = function(idp, resourceId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "object.id": config.util.format("T:%s", resourceId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.byidpandtoollast = function(idp, resourceId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "object.id": config.util.format("T:%s", resourceId) }, { "context.extensions.uoc:lrs:app": "aulaca" }]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

exports.bydatetime = function(datetime, next) {
    var data = { "timestamp": { "$regex": config.util.format("%s", datetime) } };
    count(data, function(err, result) {
        if(err) { console.log(err); return next(err); }
        return next(null, { value: result });
    });    
};

var xapi = new TinCan({
    recordStores: [{
        endpoint: config.lrs() + "/xapi/",
        username: "",
        password: ""
    }]
});

/**
 * Registra statement al LRS
 * @param statement
 */
var registra = function(statement) {
    xapi.sendStatement(statement, function (results, statement) {
    });
};

/**
 * Registra statement de l'accés a un material HTML5
 * @param idp
 * @param app
 * @param domainId
 * @param classroomId
 * @param eventId
 * @param pid
 * @param url
 * @param s
 */
exports.registraHTML5 = function(idp, app, domainId, classroomId, eventId, pid, url, s) {
    registra({
        actor: {
            objectType: "Agent",
            account: {
                name: idp
            }
        },
        context: {
            extensions: {
                'uoc:lrs:app': 'guaita',
                'uoc:lrs:component': 'anotacions',
                'uoc:lrs:subject:id': domainId,
                'uoc:lrs:classroom:id': classroomId,
                'uoc:lrs:activity:id': eventId,
                'uoc:lrs:session:id': s
            }
        },
        verb: {
            id: "http://adlnet.gov/expapi/verbs/launched",
            display: {
                en: "launched"
            }
        },
        object: {
            id: url,
            extensions: {
                "uoc:lrs:material:id": pid,
                "uoc:lrs:material:type": "HTML5"
            }
        }
    });
};