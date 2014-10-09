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

    var assignaturesEstudiant = [];
    var anyAcademic = req.query.anyAcademic;
    var s = req.query.s;

    if (!req.query.idp) return next("Manca l'idp");
    ws.dadesexpedient.getExpedientsByEstudiant(req.query.idp, function(err, expedients) {
        async.each(expedients, getAssignatures, function(err) {
            if (err) return next(err);
            return res.json(assignaturesEstudiant);
        });
    });

    /**
     * Assignatures per expedient
     * @param expedient
     * @param next
     */
    var getAssignatures = function(expedient, next) {
        ws.matricula.getAssignaturesDocenciaMatriculadesEstudiant(expedient.numExpedient, anyAcademic, function(err, assignatures) {
            if (err) return next(err);
            async.each(assignatures, getMaterials, function(err) {
                return next(err);
            });
        });
    };

    /**
     * Materials d'una assignatura
     * @param assignatura
     * @param next
     */
    var getMaterials = function(assignatura, next) {
        assignatura = assignatura.assignatura;
        getMaterialsAssignatura(assignatura.codAssignatura, anyAcademic, s, function(err, biblioteca) {
            if (err) return next(err);
            assignatura.biblioteca = biblioteca;
            assignaturesEstudiant = assignaturesEstudiant.concat(assignatura);
            return next();
        });
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
 * @param codAssignatura
 * @param anyAcademic
 * @param s
 * @param next
 */
var getMaterialsAssignatura = function(codAssignatura, anyAcademic, s, next) {

    var materials = [];
    var fonts = [];

    async.parallel([
        function(next) {
            var userId = '0';//'212204';
            ws.mymat.listMaterialsAjax(s, codAssignatura, userId, function (err, object) {
                if (err) return next(err);
                materials = object.dades || [];
                return next();
            });
        },
        function(next) {
            ws.aulaca.getFontsInformacioAssignatura(anyAcademic, codAssignatura, s, function (err, object) {
                if (err) return next(err);
                fonts = object || [];
                fonts = fonts.sort(function(a, b) {
                    return a.titulo.localeCompare(b.titulo);
                });
                return next();
            });
        }
    ], function(err, results) {
        if (err) return next(err);
        return next(null, {
            materials: materials,
            fonts: fonts
        });
    });
};

/**
 * Materials d'una assignatura
 * @param req
 * @param res
 * @param next
 */
exports.assignatura = function(req, res, next) {
    getMaterialsAssignatura(req.params.codAssignatura, req.params.anyAcademic, req.params.s, function(err, result) {
        if (err) return next(err);
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