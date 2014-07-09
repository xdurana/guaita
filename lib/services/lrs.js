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

/**
 * Nombre d'accessos per assignatura
 * @param domainId
 * @param s
 * @param next
 */
exports.bysubject = function(domainId, s, next) {
    var data = { "$and":[
        { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Llista d'accessos per assignatura
 * @param subjectId
 * @param s
 * @param next
 */
exports.bysubjectall = function(subjectId, s, next) {
    var data = { "$and":[
        { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", subjectId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    all(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos a una aula
 * @param classroomId
 * @param s
 * @param next
 */
exports.byclassroom = function(classroomId, s, next) {
    var data = { "$and":[
        { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos a una aula des del widget
 * @param classroomId
 * @param s
 * @param next
 */
exports.byclassroomfromwidget = function(classroomId, s, next) {
    var data = { "$and":[
        { "object.id" : "https://cv.uoc.edu/webapps/aulaca" },
        { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:app": "widget" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos a una activitat a una aula
 * @param classroomId
 * @param eventId
 * @param s
 * @param next
 */
exports.byactivityandclassroom = function(classroomId, eventId, s, next) {
    var data = { "$and":[
        { "context.extensions.uoc:lrs:classroom:id" : config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos a una eina a una aula
 * @param classroomId
 * @param resourceId
 * @param s
 * @param next
 */
exports.bytoolandclassroom = function(classroomId, resourceId, s, next) {
    var data = { "$and":[
        { "context.extensions.uoc:lrs:classroom:id" : config.util.format("%s", classroomId) },
        { "object.id" : config.util.format("T:%s", resourceId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos a una aula d'un idp
 * @param idp
 * @param classroomId
 * @param s
 * @param next
 */
exports.byidpandclassroom = function(idp, classroomId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Últim accés a una aula d'un idp
 * @param idp
 * @param classroomId
 * @param s
 * @param next
 */
exports.byidpandclassroomlast = function(idp, classroomId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Últim accés d'un idp des del widget d'una aula
 * @param idp
 * @param classroomId
 * @param s
 * @param next
 */
exports.byidpandclassroomandwidgetlast = function(idp, classroomId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:component": "widget" }
    ]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos d'un idp a una activitat d'una aula
 * @param idp
 * @param eventId
 * @param s
 * @param next
 */
exports.byidpandactivity = function(idp, eventId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Últim accés d'un idp a una activitat d'una aula
 * @param idp
 * @param eventId
 * @param s
 * @param next
 */
exports.byidpandactivitylast = function(idp, eventId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Últim accés d'un idp a una activitat d'una aula des del widget
 * @param idp
 * @param eventId
 * @param s
 * @param next
 */
exports.byidpandactivityandwidgetlast = function(idp, eventId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) },
        { "context.extensions.uoc:lrs:component": "widget" }
    ]};
    last(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos d'un idp a una eina
 * @param idp
 * @param resourceId
 * @param s
 * @param next
 */
exports.byidpandtool = function(idp, resourceId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "object.id": config.util.format("T:%s", resourceId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Últim accés d'un idp a una eina
 * @param idp
 * @param resourceId
 * @param s
 * @param next
 */
exports.byidpandtoollast = function(idp, resourceId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "object.id": config.util.format("T:%s", resourceId) },
        { "context.extensions.uoc:lrs:app": "aulaca" }
    ]};
    last(data, function(err, result) {
        return next(err, { value: result });
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