var ws = require('../ws');
var assignatures = require('../routes/assignatures');
var estudiants = require('../routes/estudiants');
var indicadors = require('../routes/indicadors');
var config = require('../config');

/**
 * [authorize description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var authorize = exports.authorize = function (req, res, next) {
    if (req.query.s == null) {
        return next("Manca el parametre [s] a la crida");
    }
    ws.campus.getIdpBySession(req.query.s, function (err, idp) {
        if (err) {
            return next("La sessió no és valida o ha caducat");
        }
        req.query.idp = (req.query.idp && idp == config.idpadmin()) ? req.query.idp : idp;
        return next();
    });
}

/**
 * [getSubjects description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var getSubjects = exports.getSubjects = function (req, res, next) {
    if (req.query.perfil == null) {
        return next("Manca el parametre [perfil] a la crida");
    }
    if (req.query.perfil == 'estudiant') {
        return estudiants.aules(req.query.idp, req.query.s, function (err, result) {
            if (err) {
                return next(err);
            }
            if (req.query.format === 'ical') {
                res.attachment('student.ical');
                res.setHeader('Content-Type', 'text/calendar');
                config.debug(result.ical);
                res.end(result.ical);
            } else if (req.query.format) {
                res.json(result);
            } else {
                res.render('estudiant.html', {
                    object: result
                });
            }
        });
    } else {
        return assignatures.byidp(req.query.s, req.query.idp, function (err, result) {
            if (err) {
                return next(err);
            }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                result.idp = req.query.idp;
                if (req.query.perfil == 'pra') {
                    result.retorn = config.util.format(
                        '%s/webapps/classroom/081_common/jsp/aulespra.jsp?s=%s',
                        config.cv(),
                        req.query.s
                    );
                    res.render('pra.html', { object: result });
                } else {
                    result.retorn = config.util.format(
                        '%s/UOC/a/cgi-bin/hola?s=%s&tmpl=p://cv.uoc.edu/%s/%s/ext_breakcam_0.htm?s=%s&ACCIO=B_AULES&t=docencia/responsable_aula.tmpl',
                        config.cv(),
                        req.query.s,
                        indicadors.getAppActiva(),
                        indicadors.getAppLang(),
                        req.query.s
                    );
                    res.render('consultor.html', { object: result });
                }
            }
        })
    }
}

/**
 * getClassroomPage
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 *
var getClassroomPage = exports.getClassroomPage = function (req, res, next) {
    return estudiants.aules(req.query.idp, req.query.s, function (err, result) {
        if (err) {
            return next(err);
        }
        if (req.query.format === 'ical') {
            res.attachment('student.ical');
            res.setHeader('Content-Type', 'text/calendar');
            config.debug(result.ical);
            res.end(result.ical);
        } else if (req.query.format) {
            res.json(result);
        } else {
            res.render('estudiant.html', {
                object: result
            });
        }
    });
}*/