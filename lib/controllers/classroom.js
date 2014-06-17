var eines = require(__base + '/lib/routes/eines');
var activitats = require(__base + '/lib/routes/activitats');
var aules = require(__base + '/lib/routes/aules');
var widget = require(__base + '/lib/routes/widget');
var ws = require(__base + '/lib/services/ws');
var config = require(__base + '/config');

var moment = require('moment');
var async = require('async');

/**
 * [getTools description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var getTools = exports.getTools = function (req, res, next) {
    if (req.query.perfil) {
        return eines.aulaidp(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.query.idp,
            req.query.s,
            true,
            function (err, result) {
            if (err) {
                return next("No s'ha pogut obtenir la informació de les eines de l'aula");
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render(req.query.perfil == 'consultor' ? 'eines-aula-estudiant.html' : 'eines-aula-consultor.html', { aula: result });
            }
        });
    } else {
        return eines.aula(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.query.idp,
            req.query.s,
            function (err, result) {
            if (err) {
                return next("No s'ha pogut obtenir la informació de les eines de l'aula");
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('eines-estudiants.html', { aula: result });
            }
        })
    }
}

/**
 * [getActivities description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var getActivities = exports.getActivities = function(req, res, next) {
    if (req.query.perfil) {
        return activitats.idp(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.query.idp,
            req.query.s,
            function (err, result) {
            if (err) {
                return next("No s'ha pogut obtenir la informació de les activitats de l'aula");
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render(req.query.perfil == 'consultor' ? 'activitats-consultors.html' : 'activitats-aula.html', { aula: result });
            }
        })
    } else {
        return activitats.aula(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.query.s,
            true,
            function (err, result) {
            if (err) {
                return next("No s'ha pogut obtenir la informació de les activitats de l'aula");
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('activitats-estudiants.html', { aula: result });
            }
        });        
    }
}

/**
 * [getAssessment description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var getAssessment = exports.getAssessment = function (req, res, next) {
    return activitats.avaluacio(
        req.params.anyAcademic,
        req.params.codAssignatura,
        req.params.domainId,
        req.params.codAula,
        req.params.classroomId,
        req.params.domainCode,
        req.query.s,
        function (err, result) {
        if (err) {
            return next("No s'ha pogut obtenir la informació de l'avaluació dels estudiants de l'aula");
        }
        if (req.query.format) {
            res.json(result);
        } else {
            result.s = req.query.s;
            res.render('avaluacio-estudiants.html', { aula: result });
        }
    });
}

/**
 * [getActivityTools description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var getActivityTools = exports.getActivityTools = function (req, res, next) {
    if (req.query.perfil == 'estudiant') {
        return eines.activitatEstudiant(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.params.eventId,
            req.query.idp,
            req.query.s,
            function (err, result) {
            if (err) {
                return next("No s'ha pogut obtenir la informació de les eines de l'activitat");
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('eines-activitat-estudiant.html', { activitat: result });
            }
        });
    } else {
        return eines.activitat(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.params.eventId,
            req.query.idp,
            req.query.s,
            function (err, result) {
            if (err) {
                return next("No s'ha pogut obtenir la informació de les activitats de l'aula");
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('eines-activitats-estudiants.html', { activitat: result });
            }
        })
    }
}

/**
 * [get description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var get = exports.get = function (req, res, next) {
    if (req.query.quick) {

    } else {
        return aules.one(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.query.idp,
            req.query.s,
            function (err, result) {
            if (err) {
                return next("No s'ha pogut obtenir la informació de l'aula");
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('aula.html', { aula: result });
            }
        });
    }
}

/**
 * [rac description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var rac = exports.rac = function (req, res, next) {
    return aules.avaluacio(
        req.params.anyAcademic,
        req.params.codAssignatura,
        req.params.domainId,
        req.params.codAula,
        req.params.classroomId,
        req.params.domainCode,
        req.query.idp,
        req.query.s,
        function (err, result) {
        if (err) {
            return next("No s'ha pogut obtenir la informació de l'aula");
        }
        if (req.query.format) {
            res.json(result);
        } else {
            result.s = req.query.s;
            res.render('avaluacio.html', { aula: result });
        }
    });
}

/**
 * [getWidget description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var getWidget = exports.getWidget = function (req, res, next) {
    if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
    var libs = req.query.libs ? req.query.libs.split(",") : [];
    if (req.query.v == '2') {
        return widget.two(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.params.codAula, req.params.classroomId, req.params.domainCode, req.query.idp, libs, req.query.up_maximized, req.query.s, function (err, result) {
            if (err) return next(err);
            if (req.query.format) {
                res.json(result);
            } else {
                res.render('widget-aula.html', { widget: result });
            }
        });
    } else {
        return widget.one(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.params.codAula, req.params.classroomId, req.params.domainCode, req.query.idp, libs, req.query.up_maximized, req.query.s, function (err, result) {
            if (err) return next(err);
            if (req.query.format) {
                res.json(result);
            } else {
                res.render('widget-aula.html', { widget: result });
            }
        });
    }
}