var TinCan = require('tincanjs');
var config = require('../config');
var service = require('./service');

/**
 * [tincan description]
 * @type {tincanjs}
 */
var xapi = new TinCan({
    recordStores: [{
        endpoint: config.lrs() + "/xapi/",
        username: "<Test User>",
        password: "<Test User's Password>"
    }]
});

/**
 * [registra description]
 * @param  {[type]} statement [description]
 * @return {[type]}           [description]
 */
var registra = function(statement) {
    xapi.sendStatement(statement, function (results, statement) {        
    });
}

/**
 * [registraGeneric description]
 * @param  {[type]} idp          [description]
 * @param  {[type]} perfil       [description]
 * @param  {[type]} app          [description]
 * @param  {[type]} component    [description]
 * @param  {[type]} domainId     [description]
 * @param  {[type]} domainIdAula [description]
 * @param  {[type]} eventId      [description]
 * @param  {[type]} url          [description]
 * @param  {[type]} s            [description]
 * @return {[type]}              [description]
 */
var registraGeneric = exports.registraGeneric = function(idp, perfil, app, component, domainId, domainIdAula, eventId, url, s) {
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
                'uoc:lrs:subject:id': domainId,
                'uoc:lrs:classroom:id': domainIdAula,
                'uoc:lrs:activity:id': eventId,
                'uoc:lrs:perfil': perfil,
                'uoc:lrs:session:id': s
            }
        },
        verb: {
            id: "http://adlnet.gov/expapi/verbs/experienced",
            display: {
                en: "experienced"
            }
        },
        object: {
            id: url
        }
    });
}

/**
 * [registraCalendari description]
 * @param  {[type]} idp [description]
 * @param  {[type]} s   [description]
 * @return {[type]}     [description]
 */
var registraCalendari = exports.registraCalendari = function(idp, perfil, url, s) {
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
                'uoc:lrs:component': 'calendari',                
                'uoc:lrs:perfil': perfil,
                'uoc:lrs:session:id': s
            }
        },
        verb: {
            id: "http://adlnet.gov/expapi/verbs/experienced",
            display: {
                en: "experienced"
            }
        },
        object: {
            id: url
        }
    });
}

/**
 * [registraWidget description]
 * @param  {[type]} idp          [description]
 * @param  {[type]} domainId     [description]
 * @param  {[type]} domainIdAula [description]
 * @param  {[type]} s            [description]
 * @return {[type]}              [description]
 */
var registraWidget = exports.registraWidget = function(idp, domainId, domainIdAula, url, s) {
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
                'uoc:lrs:component': 'widget',
                'uoc:lrs:subject:id': domainId,
                'uoc:lrs:classroom:id': domainIdAula,
                'uoc:lrs:session:id': s
            }
        },
        verb: {
            id: "http://adlnet.gov/expapi/verbs/experienced",
            display: {
                en: "experienced"
            }
        },
        object: {
            id: url
        }
    });
}

/**
 * [registraHTML5 description]
 * @param  {[type]} idp          [description]
 * @param  {[type]} app          [description]
 * @param  {[type]} domainId     [description]
 * @param  {[type]} domainIdAula [description]
 * @param  {[type]} eventId      [description]
 * @param  {[type]} pid          [description]
 * @param  {[type]} s            [description]
 * @return {[type]}              [description]
 */
var registraHTML5 = exports.registraHTML5 = function(idp, app, domainId, domainIdAula, eventId, pid, url, s) {
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
                'uoc:lrs:classroom:id': domainIdAula,
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
}

/**
 * [registraLog description]
 * @param  {[type]} idp [description]
 * @param  {[type]} url [description]
 * @param  {[type]} s   [description]
 * @return {[type]}     [description]
 */
var registraLog = exports.registraLog = function(idp, url, s) {
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
                'uoc:lrs:component': 'log',
                'uoc:lrs:session:id': s
            }
        },
        verb: {
            id: "http://adlnet.gov/expapi/verbs/experienced",
            display: {
                en: "experienced"
            }
        },
        object: {
            id: url
        }
    });
}

/**
 * [count description]
 * @param  {[type]}   data [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var count = function(data, next) {
    service.post(config.util.format('%s/guaita/count', config.lrs()), data, function (err, data) {
        if(err) { console.log(err); return next(err); }
        return next(null, data);
    });
}

/**
 * [last description]
 * @param  {[type]}   data [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var last = function(data, next) {
    service.post(config.util.format('%s/guaita/all/1', config.lrs()), data, function (err, data) {
        if(err) { console.log(err); return next(err); }
        return next(null, data);
    });
}

/**
 * [all description]
 * @param  {[type]}   data [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var all = function(data, next) {
    service.post(config.util.format('%s/guaita/all/100', config.lrs()), data, function (err, data) {
        if(err) { console.log(err); return next(err); }
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

exports.bysubjectall = function(domainId, s, next) {
    var data = { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) };
    all(data, function(err, result) {
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

exports.byidpandclassroomandwidgetlast = function(idp, domainId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }, { "context.extensions.uoc:lrs:component": "widget" }]};
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

exports.byidpandactivityandwidgetlast = function(idp, eventId, s, next) {
    var data = { "$and":[{ "actor.account.name" : config.util.format("%s", idp) }, { "context.extensions.uoc:lrs:activity:id": config.util.format("%s", eventId) }, { "context.extensions.uoc:lrs:component": "widget" }]};
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