var ws = require(__base + '/lib/services/ws');
var config = require(__base + '/config');

/**
 * Materials propis d'una assignatura
 * @param req
 * @param res
 * @param next
 */
exports.getMaterials = function(req, res, next) {

    var s = req.query.s;
    var idp = req.query.idp;
    var codAssignatura = req.params.codAssignatura;
    var anyAcademic = req.params.anyAcademic;
    var format = req.query.format;
    var userId = req.query.userid;

    ws.mymat.listMaterialsAjax(s, codAssignatura, userId, function (err, object) {
        if (err) return next(err);
        var materials = object.dades || [];

        var o = {
            anyAcademic: anyAcademic,
            codiAssignatura: codAssignatura,
            materials: materials,
            idp: idp,
            s: s,
            cv: config.cv()
        };

        return format ? res.json(o) : res.render('materials.html', o);
    });
};

/**
 * Fonts d'una assignatura
 * @param req
 * @param res
 * @param next
 */
exports.getFontsInformacio = function(req, res, next) {
    ws.dadesacademiques.getRecursosByAssignatura(req.params.codAssignatura, req.params.anyAcademic, function (err, object) {
        if (err) return next(err);
        var fonts = object || [];
        if (req.query.format) {
            res.json(fonts);
        } else {
            res.render('fonts-informacio.html', {
                fonts: fonts,
                cv: config.cv()
            });
        }
    });
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