var eines = require(__base + '/lib/routes/eines');
var activitats = require(__base + '/lib/routes/activitats');
var estudiants = require(__base + '/lib/routes/estudiants');
var aules = require(__base + '/lib/routes/aules');
var widget = require(__base + '/lib/routes/widget');
var ws = require(__base + '/lib/services/ws');
var config = require(__base + '/config');

var moment = require('moment');
var async = require('async');

/**
 * Eines de l'aula
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getTools = function (req, res, next) {
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
};

/**
 * Activitats de l'aula
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getActivities = function(req, res, next) {
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
};

/**
 * Avaluació dels estudiants de l'aula
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getAssessment = function (req, res, next) {
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
};

/**
 * Eines de l'activitat d'una aula
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getActivityTools = function (req, res, next) {
    if (req.query.perfil == 'estudiant') {
        return eines.activitatidp(
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
};

/**
 * Dades d'una aula
 * @param req
 * @param res
 * @param next
 * @returns {*|type[]}
 */
exports.get = function (req, res, next) {
    if (!req.query.quick) return aules.one(
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
};

/**
 * Widget de l'aula
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getWidget = function (req, res, next) {
    if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
    var libs = req.query.libs ? req.query.libs.split(",") : [];

    if (req.query.v == '1') {
        return widget.one(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.params.codAula, req.params.classroomId, req.params.domainCode, req.query.idp, libs, req.query.up_maximized, req.query.s, function (err, result) {
            if (err) return next(err);
            if (req.query.format) {
                res.json(result);
            } else {
                res.render('widget.html', { widget: result });
            }
        });
    } else {
        return widget.two(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.params.codAula, req.params.classroomId, req.params.domainCode, req.query.idp, libs, req.query.up_maximized, req.query.s, function (err, result) {
            if (err) return next(err);
            if (req.query.format) {
                res.json(result);
            } else {
                res.render('widgetv2.html', { widget: result });
            }
        });
    }
};

/**
 * Estudiants per aula amb llur indicadors
 * @param req
 * @param res
 * @param next
 */
exports.getStudents = function(req, res, next) {
    estudiants.aula(req.params.anyAcademic, req.params.codAssignatura, req.params.codAula, req.params.classroomId, req.params.dies, req.query.s, function (err, result) {
        if (err) return next(err);
        return res.json(result);
    });
};

/**
 * Estadístiques d'accés d'una aula
 * @param req
 * @param res
 * @param next
 */
exports.getStats = function(req, res, next) {

    var estadistiques = {
        s: req.query.s,
        anyAcademic: req.params.anyAcademic,
        codAssignatura: req.params.codAssignatura,
        domainId: req.params.domainId,
        codAula: req.params.codAula,
        classroomId: req.params.classroomId,
        domainCode: req.params.domainCode
    };

    if (req.query.idp) {
        estadistiques.idp = req.query.idp;
        async.parallel([
            function (next) {
                ws.lrs.byidpandclassroom(estadistiques.idp, estadistiques.classroomId, estadistiques.s, function (err, result) {
                    estadistiques.totals = result.value;
                    return next();
                });
            },
            function (next) {
                ws.lrs.byidpandclassroomfromwidget(estadistiques.idp, estadistiques.classroomId, estadistiques.s, function (err, result) {
                    estadistiques.widget = result.value;
                    return next();
                });
            }
        ], function (err, results) {
            return res.json(estadistiques);
        });
    } else {
        async.parallel([
            function (next) {
                ws.lrs.byclassroom(estadistiques.classroomId, estadistiques.s, function (err, result) {
                    estadistiques.totals = result.value;
                    return next();
                });
            },
            function (next) {
                ws.lrs.byclassroomfromwidget(estadistiques.classroomId, estadistiques.s, function (err, result) {
                    estadistiques.widget = result.value;
                    return next();
                });
            }
        ], function (err, results) {
            return res.json(estadistiques);
        });
    }
};
