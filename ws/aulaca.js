var config = require('../config');
var service = require('./service');

var request = require('request');
var util = require('util');

var getAssignaturesPerIdp = function(s, idp, callback) {

    var url = util.format('%s/assignatures?s=%s&idp=%s',
        config.aulaca(),
        s,
        idp
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            object.subjects = object.subjects.filter(function(assignatura) {
                return true;
            });
            callback(null, object.subjects);
        } catch(e) {
            callback(util.format("(aulaca) No s'han pogut obtenir les assignatures del idp [%s]", url));
        }
    });
}

var getAulesAssignatura = function(domainId, idp, s, callback) {

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

var getActivitatsAula = function(domainId, domainIdAula, s, callback) {

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

var getEinesPerActivitat = function(domainId, domainIdAula, eventId, s, callback) {

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

var getEinesPerAula = function(domainId, domainIdAula, s, callback) {

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

var getAulesEstudiant = function(idp, s, callback) {

    var url = util.format(
        '%s/webapps/aulaca/classroom/estudiant/%s/aules?s=%s',
        config.cv(),
        idp,
        s
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        callback(null, object);
    });
}

var getGroupServlet = function(domainCode, s, callback) {

    var url = util.format(
        '%s/webapps/classroom/servlet/GroupServlet?dtId=DOMAIN&s=%s&dUId=ALL&dCode=%s',
        config.cv(),
        s,
        domainCode
    );

    service.xml(url, function(err, object) {
        if (err) { console.log(err); return callback(); }
        callback(null, object.Dominis.domini);
    });
}

var getUserIdPerIdp = function(idp, s, callback) {
    var url = util.format(
        '%s/webapps/aulaca/classroom/usuaris/%s/id?s=%s',
        config.cv(),
        idp,
        s
    );

    service.json(url, function(err, object) {
        if (err) { console.log(err); return callback(); }
        callback(null, object.userId);
    });
}

var getLecturesPendentsAcumuladesAssignatura = function(domainId, s, callback) {
    //TODO GUAITA-36
    callback();
}

var getParticipacionsAssignatura = function(domainId, s, callback) {
    //TODO GUAITA-36
    callback();
}

var getLecturesPendentsIdpAssignatura = function(domainId, idp, s, callback) {
    //TODO GUAITA-36
    callback();
}

var getLecturesPendentsAcumuladesAula = function(domainId, s, callback) {
    //TODO GUAITA-36
    callback();
}

var getParticipacionsAula = function(domainId, s, callback) {
    //TODO GUAITA-36
    callback();
}

var getLecturesPendentsIdpAula = function(domainId, idp, s, callback) {
    //TODO GUAITA-36
    callback();
}

var isAulaca = function(domainCode, s, callback) {
    getGroupServlet(domainCode, s, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            config.debug(object[0]['$']['idTipoPresent']);
            callback(null, object[0]['$']['idTipoPresent'] == 'AULACA');
        } catch(e) {
            callback(null, true);
        }
    });
}

module.exports = {
    getAssignaturesPerIdp: getAssignaturesPerIdp,
    getAulesAssignatura: getAulesAssignatura,
    getActivitatsAula: getActivitatsAula,
    getEinesPerActivitat: getEinesPerActivitat,
    getEinesPerAula: getEinesPerAula,
    getAulesEstudiant: getAulesEstudiant,
    getGroupServlet: getGroupServlet,
    getUserIdPerIdp: getUserIdPerIdp,
    getLecturesPendentsAcumuladesAssignatura: getLecturesPendentsAcumuladesAssignatura,
    getParticipacionsAssignatura: getParticipacionsAssignatura,
    getLecturesPendentsIdpAssignatura: getLecturesPendentsIdpAssignatura,
    getLecturesPendentsAcumuladesAula: getLecturesPendentsAcumuladesAula,
    getParticipacionsAula: getParticipacionsAula,
    getLecturesPendentsIdpAula: getLecturesPendentsIdpAula,
    isAulaca: isAulaca
}