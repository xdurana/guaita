var config = require('../config');
var service = require('./service');

/**
 * [getAgrupacionsIniciativesByEstudiant description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {Function} next       [description]
 * @return {[type]}                  [description]
 */
var getAgrupacionsIniciativesByEstudiant = exports.getAgrupacionsIniciativesByEstudiant = function(idp, perfilIniciativa, idioma, incloureNoDefinits, next) {
    var args = {
        in0: idp,
        in1: perfilIniciativa,
        in2: idioma,
        in3: incloureNoDefinits
    }
    service.operation(config.dadesacademiqueswsdl(), 'getAgrupacionsIniciativesByEstudiant', args, function(err, result) {
        return next(err, result.out.AgrupacioIniciativaVO ? result.out.AgrupacioIniciativaVO : []);
    });
}

/**
 * [getExpedientsByEstudiantAgrupacioIniciativa description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   idioma   [description]
 * @param  {Function} next [description]
 * @return {[type]}            [description]
 */
var getExpedientsByEstudiantAgrupacioIniciativa = exports.getExpedientsByEstudiantAgrupacioIniciativa = function(idp, agrupacioIniciativa, idioma, incloureNoDefinits, next) {
    var args = {
        in0: idp,
        in1: agrupacioIniciativa,
        in2: idioma,
        in3: incloureNoDefinits
    }
    service.operation(config.dadesacademiqueswsdl(), 'getExpedientsByEstudiantAgrupacioIniciativa', args, function(err, result) {
        return next(err, result.out.ExpedientVO ? result.out.ExpedientVO : []);
    });
}