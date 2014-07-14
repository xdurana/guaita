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
        { "object.definition.type" : "AULA" },
        { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:app": "widget" }
    ]};
    count(data, function(err, result) {
        return next(err, { value: result });
    });
};

/**
 * Nombre d'accessos d'un idp des del widget d'una aula
 * @param idp
 * @param classroomId
 * @param s
 * @param next
 */
exports.byidpandclassroomfromwidget = function(idp, classroomId, s, next) {
    var data = { "$and":[
        { "actor.account.name": config.util.format("%s", idp) },
        { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", classroomId) },
        { "context.extensions.uoc:lrs:component": "widget" }
    ]};
    count(data, function(err, result) {
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
exports.byidpandclassroomfromwidgetlast = function(idp, classroomId, s, next) {
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
 * @param next
 */
var registra = function(statement, next) {
    xapi.sendStatement(statement, function (results, stmnt) {
        return next(null, stmnt);
    });
};

/**
 * Generar statement aules
 * @param idp
 * @param app
 * @param component
 * @param subjectId
 * @param classroomId
 * @param eventId
 * @param s
 * @param verb
 * @param object
 * @param next
 */
var generateStatement = function(idp, app, component, subjectId, classroomId, eventId, s, verb, object, next) {
    registra({
        actor: {
            objectType: "Agent",
            account: {
                name: idp
            }
        },
        context: {
            extensions: {
                'uoc:lrs:app': app,
                'uoc:lrs:component': component,
                'uoc:lrs:subject:id': subjectId,
                'uoc:lrs:classroom:id': classroomId,
                'uoc:lrs:activity:id': eventId,
                'uoc:lrs:session:id': s
            }
        },
        verb: {
            id: "http://adlnet.gov/expapi/verbs/" + verb,
            display: {
                en: verb
            }
        },
        object: object
    }, function(err, results) {
        return next(err, results);
    });
};

/**
 * Registra statement de l'accés a un material HTML5
 * @param idp
 * @param app
 * @param subjectId
 * @param classroomId
 * @param eventId
 * @param pid
 * @param url
 * @param s
 * @param next
 */
exports.registraHTML5 = function(idp, app, subjectId, classroomId, eventId, pid, url, s, next) {
    generateStatement(idp, app, subjectId, classroomId, eventId, s, "launched", {
        id: url,
        objectType : "Activity",
        definition : {
            type : "HTML5",
            name : {
                ca : "HTML5"
            },
            extensions : {
                "uoc:lrs:material:id": pid,
                "uoc:lrs:material:type": "HTML5"
            }
        }
    }, function(err, results) {
        return next(err, results);
    });
};

/**
 * Registra statement de l'accés a un BBFORUM
 * @param event
 * @param next
 */
var registraBBForums = function(event, next) {

    if (event.userid) {
        //TODO convertir userid en idp
    }

    generateStatement(event.idp, "aulaca", "tools", event.subject.id, event.classroom.id, event.activity.id, null, event.resource.action, {
        id: "T:" + event.resource.id,
        objectType : "Activity",
        definition : {
            type : event.resource.type,
            name : {
                ca : event.resource.type
            },
            extensions : {
                "uoc:lrs:tool:id": event.resource.id,
                "uoc:lrs:tool:forum:id": event.resource.forum.id,
                "uoc:lrs:tool:forum:topic:id": event.resource.topic.id,
                "uoc:lrs:tool:forum:post:id": event.resource.post.id
            }
        }
    }, function(err, results) {
        return next(err, results);
    });
};

/**
 * Registra statement de l'accés a un MICROBLOG
 * @param event
 * @param next
 */
var registraMicroblog = function(event, next) {

    if (event.userid) {
        //TODO convertir userid en idp
    }

    generateStatement(event.idp, "aulaca", event.subject.id, event.classroom.id, event.activity.id, null, event.resource.action, {
        id: "T:" + event.resource.id,
        objectType : "Activity",
        definition : {
            type : event.resource.type,
            name : {
                ca : event.resource.type
            },
            extensions : {
                "uoc:lrs:tool:id": event.resource.id,
                "uoc:lrs:tool:microblog:post:id": event.resource.post.id
            }
        }
    }, function(err, results) {
        return next(err, results);
    });
};

/**
 * Registra statement provienent d'una eina de l'aula
 * @param event
 * @param next
 */
exports.registraEina = function(event, next) {
    if (event.resource.type == "BB_FORUMS") {
        return registraBBForums(event, function(err, results) {
            return next(null, results);
        });
    }
    if (event.resource.type == "MICROBLOG") {
        return registraMicroblog(event, function(err, results) {
            return next(null, results);
        });
    }
};