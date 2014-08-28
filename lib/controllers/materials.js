var ws = require(__base + '/lib/services/ws');
var config = require(__base + '/config');

var async = require('async');


/**
 * Agrupacions d'un estudiant
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.get = function (req, res, next) {
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
     * Expedients de l'estudiant per agrupació
     * @param iniciativa
     * @param next
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
    };

    /**
     * Identificar si és una iniciativa vàlida
     * @param iniciativa
     * @param next
     * @returns {*}
     */
    var esIniciativaValida = function(iniciativa, next) {
        return next(iniciativa.id[0] != 0);
    };

    /**
     * Filtrar expedients actius
     * @param expedient
     * @param next
     * @returns {*}
     */
    var filtrarExpedient = function(expedient, next) {
        return req.query.active && req.query.active == 'true' ? next(expedient.indEstatExpedient[0] == 'A') : next(expedient.indEstatExpedient[0] != 'E');
    };

    /**
     * Filtrar iniciatives sense expedients
     * @param iniciativa
     * @param next
     * @returns {*}
     */
    var filtrarIniciativesSenseExpedients = function(iniciativa, next) {
        return next(iniciativa.expedients.length > 0);
    };
};

/**
 * Materials HTML5
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.getHTML5 = function(req, res, next) {
    if (!(req.params.pid && req.query.idp && req.query.login && req.query.role && req.query.subject && req.query.classroom && req.query.language)) return next("No s'ha pogut obtenir la URL del material");
    ws.myway.getHTML5Format(req.query.idp, req.query.login, req.query.role, req.query.subject, req.query.classroom, req.params.pid, req.query.language, function (err, format) {
        if (err) return next(err);
        ws.lrs.registraHTML5(req.query.idp, req.query.app, req.query.subject, req.query.classroom, req.query.eventId, req.params.pid, req.query.url, req.query.s);
        return res.redirect(format);
    });
};

/**
 * Materials d'una assignatura
 * @param req
 * @param res
 * @param next
 */
var assignatura = exports.assignatura = function(req, res, next) {

    var materials = [];
    var fonts = [];

    async.parallel([
        function(next) {
            var userId = '0';//'212204';
            ws.mymat.listMaterialsAjax(req.query.s, req.params.codAssignatura, userId, function (err, object) {
                if (err) return next(err);
                materials = object.dades || [];
                return next();
            });
        },
        function(next) {
            ws.aulaca.getFontsInformacioAssignatura(req.params.anyAcademic, req.params.codAssignatura, req.query.s, function (err, object) {
                if (err) return next(err);
                fonts = object;
                return next();
            });
        }
    ], function(err, results) {
        var object = {
            materials: materials,
            fonts: fonts,
            s: req.query.s,
            idp: req.query.idp,
            anyAcademic: req.params.anyAcademic,
            codiAssignatura: req.params.codAssignatura
        };
        if (req.query.format) {
            res.json(object);
        } else {
            res.render('materials.html', {
                object: object,
                cv: config.cv()
            });
        }
    });
};
