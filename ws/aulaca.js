var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.getAssignaturesPerIdp = function(s, idp, callback) {

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

exports.getAulesEstudiant = function(idp, s, callback) {

    var url = util.format(
        '%s/webapps/aulaca/classroom/estudiant/%s/aules?s=%s',
        'http://putumayo:10009', //TODO config.cv(),
        idp,
        s
    );

    var aules = [
    ];

    service.json(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        config.debug(object);
        if (object.classrooms) {
            object.classrooms.forEach(function(classroom) {

                var aula = {
                    nom: classroom.title,
                    anyAcademic: classroom.anyAcademic,
                    appId: classroom.appId,
                    domainId: classroom.domainFatherId,
                    domainIdAula: classroom.domainId,
                    codAula: classroom.domainCode.slice(-1),
                    codiAssignatura: classroom.codi,
                    color: '66AA00',
                    link: util.format('%s/webapps/aulaca/classroom/Classroom.action?s=%s&domainId=%s', config.cv(), s, classroom.domainId)
                }

                if (object.assignments) {
                    object.assignments.forEach(function(assignment) {
                        if (assignment.assignmentId.domainId == aula.domainFatherId) {
                            aula.color = assignment.color;
                        }
                    });
                }

                aules.push(aula);
            });
        }
        callback(null, { aules: aules });
    });

    /*
    var aules = [{
        nom: 'Llenguatges i estàndars web',
        anyAcademic: '20131',
        domainId: '392985',
        codiAssignatura: '06.510',
        codAula: '1',
        domainIdAula: '419029',
        color: '66AA00',
        link: aulaURL
    }];

    callback(null, { aules: aules});
    */
}

exports.getGroupServlet = function(domainCode, s, callback) {

    var url = util.format(
        '%s/webapps/classroom/servlet/GroupServlet?dtId=DOMAIN&s=%s&dUId=ALL&dCode=%s',
        config.cv(),
        s,
        domainCode
    );

    service.xml(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        callback(null, object.Dominis.domini);
    });
}

exports.getLecturesPendentsAcumuladesAssignatura = function(domainId, s, callback) {
    //TODO
    callback();
}

exports.getParticipacionsAssignatura = function(domainId, s, callback) {
    //TODO
    callback();
}

exports.getLecturesPendentsIdpAssignatura = function(domainId, idp, s, callback) {
    //TODO
    callback();
}

exports.getLecturesPendentsAcumuladesAula = function(domainId, s, callback) {
    //TODO
    callback();
}

exports.getParticipacionsAula = function(domainId, s, callback) {
    //TODO
    callback();
}

exports.getLecturesPendentsIdpAula = function(domainId, idp, s, callback) {
    //TODO
    callback();
}