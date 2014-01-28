var ws = require('../ws');
var config = require('../config');
var async = require('async');


/**
 * [get description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var get = exports.get = function (req, res, next) {
    if (!req.query.idp) return next("Manca l'idp");
    ws.dadesexpedient.getAgrupacionsIniciativesByEstudiant(req.query.idp, "ESTUDIANT", config.lng(), "N", function (err, iniciatives) {
        if (err) return next("No s'ha pogut obtenir les iniciatives de l'estudiant");
        if (!iniciatives) return next("No hi ha iniciatives");
        async.filter(iniciatives, esIniciativaValida, function(valides) {
            async.map(valides, getExpedientsByEstudiantAgrupacioIniciativa, function(err, expedients) {
                if (err) return next(err);
                async.filter(iniciatives, filtrarIniciativesSenseExpedients, function(valides) {
                    return res.json(valides);
                });
            });
        });
    });

    /**
     * [getExpedients description]
     * @param  {[type]}   iniciativa [description]
     * @param  {Function} next       [description]
     * @return {[type]}              [description]
     */
    var getExpedientsByEstudiantAgrupacioIniciativa = function(iniciativa, next) {
        ws.dadesexpedient.getExpedientsByEstudiantAgrupacioIniciativa(req.query.idp, iniciativa.id[0], config.lng(), "N", function (err, expedients) {
            if (err) return next(err);
            if (!expedients) return next("No s'ha pogut obtenir els expedients de la iniciativa");
            async.filter(expedients, filtrarExpedient, function(filtrats) {
                iniciativa.expedients = filtrats;
                return next(null, iniciativa);
            });
        });
    }

    /**
     * [esIniciativaValida description]
     * @param  {[type]}   iniciativa [description]
     * @param  {Function} next       [description]
     * @return {[type]}              [description]
     */
    var esIniciativaValida = function(iniciativa, next) {
        return next(iniciativa.id[0] != 0);
    }

    /**
     * [filtrarExpedient description]
     * @param  {[type]}   expedient [description]
     * @param  {Function} next      [description]
     * @return {[type]}             [description]
     */
    var filtrarExpedient = function(expedient, next) {        
        return req.query.active && req.query.active == 'true' ? next(expedient.indEstatExpedient[0] == 'A') : next(expedient.indEstatExpedient[0] != 'E');
    }

    /**
     * [filtrarIniciativesSenseExpedients description]
     * @param  {[type]}   iniciativa [description]
     * @param  {Function} next       [description]
     * @return {[type]}              [description]
     */
    var filtrarIniciativesSenseExpedients = function(iniciativa, next) {
        return next(iniciativa.expedients.length > 0);
    }
}

/**
 * [getHTML5 description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var getHTML5 = exports.getHTML5 = function(req, res, next) {
    if (!(req.params.pid && req.query.idp && req.query.login && req.query.role && req.query.subject && req.query.classroom && req.query.language)) return next("No s'ha pogut obtenir la URL del material");
    ws.myway.getHTML5Format(req.query.idp, req.query.login, req.query.role, req.query.subject, req.query.classroom, req.params.pid, req.query.language, function (err, format) {
        if (err) return next(err);
        return res.redirect(format);
    });
}