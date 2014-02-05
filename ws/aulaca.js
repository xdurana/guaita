var config = require('../config');
var service = require('./service');
var async = require('async');

/**
 * [getAssignaturesPerIdp description]
 * @param  {[type]}   s    [description]
 * @param  {[type]}   idp  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var getAssignaturesPerIdp = exports.getAssignaturesPerIdp = function(s, idp, next) {
    var url = config.util.format('%s/assignatures?s=%s&idp=%s',
        config.aulaca(),
        s,
        idp
    );
    service.json(url, function(err, object) {
        return next(err, object.subjects || []);

        object.subjects = object.subjects || [];
        var active = [];
        async.each(object.assignments || [], list, function(err) {
            if (err) return next(err);
            if (object.subjects) {
                object.subjects = object.subjects.filter(function(assignatura) {
                    //TODO GUAITA-85
                    return active[assignatura.domainId] ? active[assignatura.domainId].userTypeId === 'CREADOR' || active[assignatura.domainId].userTypeId === 'RESPONSABLE' : true;
                });
            }
            return next(null, object.subjects);
        });
    });
    var list = function(assignment, next) {
        active[assignment.assignmentId.domainId] = assignment;
        return next();
    }
}

/**
 * [getAulesAssignatura description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var getAulesAssignatura = exports.getAulesAssignatura = function(domainId, idp, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules?s=%s&idp=%s',
        config.aulaca(),
        domainId,
        s,
        idp
    );
    service.json(url, function(err, object) {
        if (err) {
            return next(err);
        }
        return next(null, object.classrooms);
    });
}

/**
 * [getActivitatsAula description]
 * @param  {[type]}   domainId     [description]
 * @param  {[type]}   domainIdAula [description]
 * @param  {[type]}   s            [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
var getActivitatsAula = exports.getActivitatsAula = function(domainId, domainIdAula, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules/%s/activitats?s=%s',
        config.aulaca(),
        domainId,
        domainIdAula,
        s
    );
    service.json(url, function(err, object) {
        if (err) {
            return next(err);
        }
        return next(null, object.activities);
    });
}

/**
 * [getEinesPerActivitat description]
 * @param  {[type]}   domainId     [description]
 * @param  {[type]}   domainIdAula [description]
 * @param  {[type]}   eventId      [description]
 * @param  {[type]}   s            [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
var getEinesPerActivitat = exports.getEinesPerActivitat = function(domainId, domainIdAula, eventId, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules/%s/activitats/%s/eines?s=%s',
        config.aulaca(),
        domainId,
        domainIdAula,
        eventId,
        s
    );
    service.json(url, function(err, object) {
        return next(err, object ? object.tools : []);
    });
}

/**
 * [getEinesPerAula description]
 * @param  {[type]}   domainId     [description]
 * @param  {[type]}   domainIdAula [description]
 * @param  {[type]}   s            [description]
 * @param  {Function} next         [description]
 * @return {[type]}                [description]
 */
var getEinesPerAula = exports.getEinesPerAula = function(domainId, domainIdAula, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules/%s/eines?s=%s',
        config.aulaca(),
        domainId,
        domainIdAula,
        s
    );
    service.json(url, function(err, object) {
        return next(err, object ? object.tools : []);
    });
}

/**
 * [getAulesEstudiant description]
 * @param  {[type]}   idp  [description]
 * @param  {[type]}   s    [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var getAulesEstudiant = exports.getAulesEstudiant = function(idp, s, next) {
    var url = config.util.format(
        '%s/webapps/aulaca/classroom/estudiant/%s/aules?s=%s',
        config.cv(),
        idp,
        s
    );
    service.json(url, function(err, object) {
        return next(err, object ? object : []);
    });
}

/**
 * [getGroupServlet description]
 * @param  {[type]}   domainCode [description]
 * @param  {[type]}   s          [description]
 * @param  {Function} next       [description]
 * @return {[type]}              [description]
 */
var getGroupServlet = exports.getGroupServlet = function(domainCode, s, next) {
    var url = config.util.format(
        '%s/webapps/classroom/servlet/GroupServlet?dtId=DOMAIN&s=%s&dUId=ALL&dCode=%s',
        config.cv(),
        s,
        domainCode
    );
    service.xml(url, function(err, object) {
        return next(err, object ? object.Dominis.domini : {});
    });
}

/**
 * [getUserIdPerIdp description]
 * @param  {[type]}   idp  [description]
 * @param  {[type]}   s    [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var getUserIdPerIdp = exports.getUserIdPerIdp = function(idp, s, next) {
    var url = config.util.format(
        '%s/webapps/aulaca/classroom/usuaris/%s/id?s=%s',
        config.cv(),
        idp,
        s
    );
    service.json(url, function(err, object) {
        return next(err, object ? object.userId : -1);
    });
}

/**
 * [isAulaca description]
 * @param  {[type]}   domainCode [description]
 * @param  {[type]}   s          [description]
 * @param  {Function} next       [description]
 * @return {Boolean}             [description]
 */
var isAulaca = exports.isAulaca = function(domainCode, s, next) {
    getGroupServlet(domainCode, s, function(err, object) {
        return next(err, object ? object[0]['$']['idTipoPresent'] == 'AULACA' : false);
    });
}

/**
 * [getLecturesPendentsAcumuladesAssignatura description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var getLecturesPendentsAcumuladesAssignatura = exports.getLecturesPendentsAcumuladesAssignatura = function(domainId, s, next) {
    //TODO GUAITA-36
    next();
}

/**
 * [getParticipacionsAssignatura description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var getParticipacionsAssignatura = exports.getParticipacionsAssignatura = function(domainId, s, next) {
    //TODO GUAITA-36
    next();
}

/**
 * [getLecturesPendentsIdpAssignatura description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var getLecturesPendentsIdpAssignatura = exports.getLecturesPendentsIdpAssignatura = function(domainId, idp, s, next) {
    //TODO GUAITA-36
    next();
}

/**
 * [getLecturesPendentsAcumuladesAula description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var getLecturesPendentsAcumuladesAula = exports.getLecturesPendentsAcumuladesAula = function(domainId, s, next) {
    //TODO GUAITA-36
    next();
}

/**
 * [getParticipacionsAula description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var getParticipacionsAula = exports.getParticipacionsAula = function(domainId, s, next) {
    //TODO GUAITA-36
    next();
}

/**
 * [getLecturesPendentsIdpAula description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var getLecturesPendentsIdpAula = exports.getLecturesPendentsIdpAula = function(domainId, idp, s, next) {
    //TODO GUAITA-36
    next();
}