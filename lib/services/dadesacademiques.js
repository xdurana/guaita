var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Fonts d'informació per assignatura
 * @param codAssignatura
 * @param anyAcademic
 * @param next
 */
exports.getRecursosByAssignatura = function(codAssignatura, anyAcademic, next) {
    var args = {
        in0: codAssignatura,
        in1: anyAcademic,
        in2: config.lng()
    };
    service.operation(config.dadesacademiqueswsdl(), 'getRecursosByAssignatura', args, function(err, result) {
        return next(err, result);
    });
};

/**
 * Assignatura per codi
 * @param codAssignatura
 * @param next
 */
exports.getAssignaturaByCodi = function(codAssignatura, next) {
    var args = {
        in0: codAssignatura,
        in1: config.lng()
    };
    service.operation(config.dadesacademiqueswsdl(), 'getAssignaturaByCodi', args, function(err, result) {
        return next(err, result);
    });
};