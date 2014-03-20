var ws = require('../ws');
var assignatures = require('../routes/assignatures');
var estudiants = require('../routes/estudiants');
var calendaris = require('../routes/calendaris');
var config = require('../config');
var async = require('async');

/**
 * [authorize description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var authorize = exports.authorize = function (req, res, next) {
    if (req.query.s == null) return next("Manca el parametre [s] a la crida");
    ws.campus.getIdpBySession(req.query.s, function (err, idp) {
        if (err) return next("La sessió no és valida o ha caducat");
        config.log("Usuari autenticat");
        req.query.idp = (req.query.idp && idp == config.idpadmin()) ? req.query.idp : idp;
        ws.lrs.registraLog(idp, req.url, req.query.s);
        return next();
    });
}

/**
 * [admin description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var admin = exports.admin = function (req, res, next) {
    if (req.query.s == null) return next("Manca el parametre [s] a la crida");
    ws.campus.getIdpBySession(req.query.s, function (err, idp) {
        if (err) return next("La sessió no és valida o ha caducat");
        if (idp != config.idpadmin()) return next("Permis denegat");
        return next();
    });
}

/**
 * [subjects description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var subjects = exports.subjects = function (req, res, next) {
    if (req.query.perfil == null) return next("Manca el parametre [perfil] a la crida");
    if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
    
    if (req.query.perfil == 'estudiant') {
        return calendar(req, res, function (err, result) {
            return next(err, result);

        });
    } else {
        return assignatures.byidp(req.query.s, req.query.idp, req.query.perfil, function (err, result) {
            if (err) return next(err);
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
                        config.getAppActiva(),
                        config.getAppLang(),
                        req.query.s
                    );
                    res.render('consultor.html', { object: result });
                }
            }
        })
    }
}

/**
 * [calendar description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var calendar = exports.calendar = function (req, res, next) {

    if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
    if (req.query.perfil == null) return next("Manca el parametre [perfil] a la crida");

    if (req.query.perfil == 'estudiant') {
        calendaris.estudiant(req.query.s, req.query.idp, function (err, object) {
            if (err) return next(err);
            pinta(object);
        });
    } else {
        calendaris.docent(req.query.s, req.query.idp, req.query.perfil, function(err, object) {
            if (err) return next(err);
            pinta(object);
        });
    }

    var pinta = function(object) {
        if (req.query.format === 'ical') {
            res.attachment('uoc.ical');
            res.setHeader('Content-Type', 'text/calendar');
            res.end(object.ical);
        } else if (req.query.format) {
            res.json(object);
        } else {
            ws.lrs.registraCalendari(req.query.idp, req.query.perfil, req.query.url, req.query.s);
            res.render(req.query.perfil === 'pra' ? 'calendari-pra.html' : req.query.perfil === 'consultor' ? 'calendari-consultor.html' : 'calendari-estudiant', {
                object: object
            });
        }
    }
}

/**
 * [registre description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var registre = exports.registre = function (req, res, next) {
    ws.lrs.registraGeneric(req.query.idp, req.query.perfil, req.query.app, req.query.component, req.query.domainId, req.query.domainIdAula, req.query.eventId, req.query.url, req.query.s);
    res.json({
        status: 200,
        url: req.url
    });
}

/**
 * [byidpandsubject description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var byidpandclassroom = exports.byidpandclassroom = function (req, res, next) {
    ws.lrs.byidpandclassroom(req.params.idp, req.params.domainId, req.query.s, function (err, result) {
        if (err) return next(err);
        res.json(result);
    });
}

/**
 * [byidpandsubjectlast description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var byidpandclassroomlast = exports.byidpandclassroomlast = function (req, res, next) {
    ws.lrs.byidpandclassroomlast(req.params.idp, req.params.domainId, req.query.s, function (err, result) {
        if (err) return next(err);
        res.json(result);
    });
}

/**
 * [byidpandclassroomandwidgetlast description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var byidpandclassroomandwidgetlast = exports.byidpandclassroomandwidgetlast = function (req, res, next) {
    ws.lrs.byidpandclassroomandwidgetlast(req.params.idp, req.params.domainId, req.query.s, function (err, result) {
        if (err) return next(err);
        res.json(result);
    });
}
