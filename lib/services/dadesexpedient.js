var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

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
    service.operation(config.expedientwsdl(), 'getExpedientsByEstudiantAgrupacioIniciativa', args, function(err, result) {
        return next(err, result.out.ExpedientVO ? result.out.ExpedientVO : []);
    });
};

/**
 * Llista d'expedients per estudiant
 * @param idp
 * @param next
 */
exports.getExpedientsByEstudiant = function(idp, next) {
    var args = {
        in0: idp,
        in1: config.lng()
    };
    service.operation(config.expedientwsdl(), 'getExpedientsByEstudiant', args, function(err, result) {
        return next(err, result.out.ExpedientVO ? result.out.ExpedientVO : []);
    });
};

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
    service.operation(config.expedientwsdl(), 'getAgrupacionsIniciativesByEstudiant', args, function(err, result) {
        return next(err, result.out.AgrupacioIniciativaVO ? result.out.AgrupacioIniciativaVO : []);
    });
};