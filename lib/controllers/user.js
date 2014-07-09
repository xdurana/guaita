var ws = require(__base + '/lib/services/ws');
var assignatures = require(__base + '/lib/routes/assignatures');
var estudiants = require(__base + '/lib/routes/estudiants');
var calendaris = require(__base + '/lib/routes/calendaris');
var config = require(__base + '/config');

var async = require('async');

/**
 * Autorització d'un usuari a través de la sessió
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.authorize = function (req, res, next) {
    if (req.query.s == null) return next("Manca el parametre [s] a la crida");
    ws.campus.getIdpBySession(req.query.s, function (err, idp) {
        if (err) return next("La sessió no és valida o ha caducat");
        req.query.idp = (req.query.idp && idp == config.idpadmin()) ? req.query.idp : idp;
        return next();
    });
};

/**
 * Autorització de l'usuari admin a través de la sessió
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.admin = function (req, res, next) {
    if (req.query.s == null) return next("Manca el parametre [s] a la crida");
    ws.campus.getIdpBySession(req.query.s, function (err, idp) {
        if (err) return next("La sessió no és valida o ha caducat");
        if (idp != config.idpadmin()) return next("Permis denegat");
        return next();
    });
};

/**
 * Llista d'assignatures d'un usuari
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.subjects = function (req, res, next) {
    if (req.query.perfil == null) return next("Manca el parametre [perfil] a la crida");
    if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
    
    if (req.query.perfil == 'estudiant') {
        return exports.calendar(req, res, function (err, result) {
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
};

/**
 * Calendari d'un usuari
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.calendar = function (req, res, next) {

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
        object.icalurl = config.util.format('/app/guaita/calendari?idp=%s&perfil=%s&s=%s&format=ical', req.query.idp, req.query.perfil, req.query.s);
        if (req.query.format === 'ical') {            
            var ical = calendaris.getiCal(object);
            res.attachment('uoc.ical');
            res.setHeader('Content-Type', 'text/calendar');
            res.end(ical);
        } else if (req.query.format) {
            res.json(object);
        } else {
            res.render(req.query.perfil === 'pra' ? 'calendari-pra.html' : req.query.perfil === 'consultor' ? 'calendari-consultor.html' : 'calendari-estudiant', {
                object: object
            });
        }
    }
};