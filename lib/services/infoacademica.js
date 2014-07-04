var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Aules per assignatura
 * @param anyAcademic
 * @param codAssignatura
 * @param next
 */
exports.getAulesByAssignatura = function(anyAcademic, codAssignatura, next) {
	var args = {
		in0: codAssignatura,
		in1: anyAcademic
	};
	service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
		return next(err, result);
	});
};

/**
 * Dades de l'assignatura per codi d'assignatura
 * @param anyAcademic
 * @param codAssignatura
 * @param next
 */
exports.getAssignaturaByCodi = function(anyAcademic, codAssignatura, next) {
    var args = {
        in0: codAssignatura,
        in1: anyAcademic
    };
    service.operation(config.infoacademicawsdl(), 'getAssignaturaByCodi', args, function(err, result) {
        return next(err, result);
    });
};

/**
 * Dades del pla per codi de pla
 * @param codPla
 * @param next
 */
exports.getPlaById = function(codPla, next) {
    var args = {
        in0: codPla,
        in1: config.lng()
    };
    service.operation(config.infoacademicawsdl(), 'getPlaById', args, function(err, result) {
        return next(err, result);
    });
};