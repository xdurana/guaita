var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Llista d'agrupacions segons iniciativa i idp
 * @param idp
 * @param perfilIniciativa
 * @param idioma
 * @param incloureNoDefinits
 * @param next
 */
exports.getAgrupacionsIniciativesByEstudiant = function(idp, perfilIniciativa, idioma, incloureNoDefinits, next) {
    var args = {
        in0: idp,
        in1: perfilIniciativa,
        in2: idioma,
        in3: incloureNoDefinits
    };
    service.operation(config.dadesacademiqueswsdl(), 'getAgrupacionsIniciativesByEstudiant', args, function(err, result) {
        return next(err, result.out.AgrupacioIniciativaVO ? result.out.AgrupacioIniciativaVO : []);
    });
};

/**
 * Llista d'expedients per estudiant i agrupació
 * @param idp
 * @param agrupacioIniciativa
 * @param idioma
 * @param incloureNoDefinits
 * @param next
 */
exports.getExpedientsByEstudiantAgrupacioIniciativa = function(idp, agrupacioIniciativa, idioma, incloureNoDefinits, next) {
    var args = {
        in0: idp,
        in1: agrupacioIniciativa,
        in2: idioma,
        in3: incloureNoDefinits
    };
    service.operation(config.dadesacademiqueswsdl(), 'getExpedientsByEstudiantAgrupacioIniciativa', args, function(err, result) {
        return next(err, result.out.ExpedientVO ? result.out.ExpedientVO : []);
    });
};