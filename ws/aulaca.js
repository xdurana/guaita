var config = require('../config');
var service = require('./service');
var async = require('async');

/**
 * [isDocent description]
 * @param  {[type]}   s        [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   domainId [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var isDocent = exports.isDocent = function(s, idp, domainId, next) {
    var docent = false;
    var url = config.util.format('%s/assignatures?s=%s&idp=%s',
        config.aulaca(),
        s,
        idp
    );
    service.json(url, function(err, object) {
        if (err) return next(err);
        if (object.subjects) {
            object.subjects.forEach(function(assignatura) {
                docent = docent || domainId == assignatura.domainId;
            });
        }
        return next(null, docent);
    });
}

/**
 * [getAssignaturesPerIdpPerfil description]
 * @param  {[type]}   s      [description]
 * @param  {[type]}   idp    [description]
 * @param  {[type]}   perfil [description]
 * @param  {Function} next   [description]
 * @return {[type]}          [description]
 */
var getAssignaturesPerIdpPerfil = exports.getAssignaturesPerIdpPerfil = function(s, idp, perfil, next) {

    var userTypeId = perfil === 'pra' ? 'CREADOR' : 'RESPONSABLE';
    var url = config.util.format('%s/assignatures?s=%s&idp=%s',
        config.aulaca(),
        s,
        idp
    );

    service.json(url, function(err, object) {
        async.filter(object.subjects,
            function(subject, next) {
                async.detect(object.assignments,
                    function(assignment, next) {
                        return next(assignment.userTypeId == userTypeId && assignment.assignmentId.domainId == subject.domainId);
                    },
                    function(result) {
                        return next(typeof(result) != "undefined");
                    }
                );
            },
            function(filtered) {
                object.subjects = filtered;
                return next(null, object);
            }
        );
    });
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
        return next(err, object ? object.classrooms : []);
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
        return next(err, object ? object.activities : []);
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
        '%s/estudiant/%s/aules?s=%s',
        config.aulaca(),
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
        if (err) return next(err);
        return object && object.Dominis.domini ? next(err, object.Dominis.domini) : next("No s'ha trobat el domini");
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
        '%s/usuaris/%s/id?s=%s',
        config.aulaca(),
        idp,
        s
    );
    service.json(url, function(err, object) {
        return next(err, object ? object.userId : -1);
    });
}