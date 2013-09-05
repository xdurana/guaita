var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.getAssignaturesPerIdp = function(s, idp, anyAcademic, callback) {

    var url = util.format('%s/assignatures?s=%s&idp=%s',
        config.aulaca(),
        s,
        idp
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            object.subjects = object.subjects.filter(function(assignatura) {
                return (assignatura.anyAcademic === anyAcademic);
            });
            callback(null, object.subjects);
        } catch(e) {
            callback(util.format("(aulaca) No s'han pogut obtenir les assignatures del idp [%s]", url));
        }
    });
}

exports.getAulesAssignatura = function(domainId, idp, s, callback) {

    var url = util.format('%s/assignatures/%s/aules?s=%s&idp=%s',
        config.aulaca(),
        domainId,
        s,
        idp
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            callback(null, object.classrooms);
        } catch(e) {
            callback(util.format("(aulaca) No s'han pogut obtenir les aules de l'assignatura [%s]", url));
        }
    });
}

exports.getActivitatsAula = function(domainId, domainIdAula, s, callback) {

    var url = util.format('%s/assignatures/%s/aules/%s/activitats?s=%s',
        config.aulaca(),
        domainId,
        domainIdAula,
        s
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            callback(null, object.activities);
        } catch(e) {
            callback(util.format("(aulaca) No s'han pogut obtenir les activitats de l'aula [%s]", url));
        }
    });
}

exports.getEinesPerActivitat = function(domainId, domainIdAula, eventId, s, callback) {

    var url = util.format('%s/assignatures/%s/aules/%s/activitats/%s/eines?s=%s',
        config.aulaca(),
        domainId,
        domainIdAula,
        eventId,
        s
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            callback(null, object.tools);
        } catch(e) {
            callback(util.format("(aulaca) No s'han pogut obtenir les eines de l'activitat [%s]", url));
        }
    });
}

exports.getEinesPerAula = function(domainId, domainIdAula, s, callback) {

    var url = util.format('%s/assignatures/%s/aules/%s/eines?s=%s',
        config.aulaca(),
        domainId,
        domainIdAula,
        s
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            callback(null, object.tools);
        } catch(e) {
            callback(util.format("(aulaca) No s'han pogut obtenir les eines de l'aula [%s]", url));
        }
    });
}

/**
 * TODO
 */
exports.getLecturesPendentsAcumuladesAssignatura = function(domainId, s, callback) {
    callback();
}

/**
 * TODO
 */
exports.getParticipacionsAssignatura = function(domainId, s, callback) {
    callback();
}

/**
 * TODO
 */
exports.getLecturesPendentsIdpAssignatura = function(domainId, idp, s, callback) {
    callback();
}

/**
 * TODO
 */
exports.getLecturesPendentsAcumuladesAula = function(domainId, s, callback) {
    callback();
}

/**
 * TODO
 */
exports.getParticipacionsAula = function(domainId, s, callback) {
    callback();
}

/**
 * TODO
 */
exports.getLecturesPendentsIdpAula = function(domainId, idp, s, callback) {
    callback();
}
