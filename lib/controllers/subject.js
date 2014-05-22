var aules = require(__base + '/lib/routes/aules');
var config = require(__base + '/config');
var ws = require(__base + '/ws');

var async = require('async');

/**
 * [classroom description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var classroom = exports.classroom = function(req, res, next) {
    if (req.query.perfil == null) return next("Manca el parametre [perfil] a la crida");
    return aules.all(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.query.idp, req.query.s, req.query.perfil, function (err, result) {
        if (err) return next(err);
        return req.query.format ? res.json(result) : res.render(req.query.perfil == 'pra' ? 'tabs_pra.html' : 'tabs_consultor.html', { assignatura: result });
    });
}

/**
 * [estadistiques description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var estadistiques = exports.estadistiques = function(req, res, next) {
    ws.lrs.bysubjectall(req.params.domainId, req.query.s, function (err, result) {
        if (err) return next(err);
        async.map(result.value, apply, function(err, statements) {
            if (err) return next(err);
            return req.query.format ? res.json(statements) : res.render('estadistiques.html', { estadistiques: statements });
        });
    });
}

/**
 * [apply description]
 * @param  {[type]}   statement [description]
 * @param  {Function} next      [description]
 * @return {[type]}             [description]
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
}