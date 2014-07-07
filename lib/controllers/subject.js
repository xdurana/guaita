var aules = require(__base + '/lib/routes/aules');
var estudiants = require(__base + '/lib/routes/estudiants');
var config = require(__base + '/config');
var ws = require(__base + '/lib/services/ws');

var async = require('async');

/**
 * Aules per assignatura
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.classroom = function(req, res, next) {
    if (req.query.perfil == null) return next("Manca el parametre [perfil] a la crida");
    return aules.all(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.query.idp, req.query.s, req.query.perfil, function (err, result) {
        if (err) return next(err);
        return req.query.format ? res.json(result) : res.render(req.query.perfil == 'pra' ? 'tabs_pra.html' : 'tabs_consultor.html', { assignatura: result });
    });
};

/**
 * Estadístiques de connexió d'una aula
 * @param req
 * @param res
 * @param next
 */
exports.estadistiques = function(req, res, next) {
    ws.lrs.bysubjectall(req.params.domainId, req.query.s, function (err, result) {
        if (err) return next(err);
        async.map(result.value, apply, function(err, statements) {
            if (err) return next(err);
            return req.query.format ? res.json(statements) : res.render('estadistiques.html', { estadistiques: statements });
        });
    });
};

/**
 * Parsing del statement
 * @param statement
 * @param next
 * @returns {*}
 */
var apply = function(statement, next) {
    return next(null, {
        idp: statement.actor.account.name,
        assignatura: statement.context.extensions['uoc:lrs:subject:id'],
        aula: statement.context.extensions['uoc:lrs:classroom:id'],
        activitat: statement.context.extensions['uoc:lrs:activity:id'],
        sessio: statement.context.extensions['uoc:lrs:session:id'],
        object: statement.object.id,
        stored: statement.stored
    });
};

/**
 * Estudiants sense connectar per aula
 * @param req
 * @param res
 * @param next
 */
exports.connexio = function(req, res, next) {
    estudiants.estudiantsConnectatsFaMesDeNDies(req.params.anyAcademic, req.params.codAssignatura, req.params.codAula, req.params.classroomId, req.params.dies, req.query.s, function (err, result) {
        if (err) return next(err);
        return res.json(result);
    });
};