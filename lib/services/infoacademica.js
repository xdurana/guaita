var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * [getAulesByAssignatura description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {Function} next           [description]
 * @return {[type]}                  [description]
 */
var getAulesByAssignatura = exports.getAulesByAssignatura = function(anyAcademic, codAssignatura, next) {
	var args = {
		in0: codAssignatura,
		in1: anyAcademic
	}
	service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
		return next(err, result);
	});
}

/**
 * [getAssignaturaByCodi description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {Function} next           [description]
 * @return {[type]}                  [description]
 */
var getAssignaturaByCodi = exports.getAssignaturaByCodi = function(anyAcademic, codAssignatura, next) {
    var args = {
        in0: codAssignatura,
        in1: anyAcademic
    }
    service.operation(config.infoacademicawsdl(), 'getAssignaturaByCodi', args, function(err, result) {
        return next(err, result);
    });
}

/**
 * [getPlaById description]
 * @param  {[type]}   codPla [description]
 * @param  {Function} next   [description]
 * @return {[type]}          [description]
 */
var getPlaById = exports.getPlaById = function(codPla, next) {
    var args = {
        in0: codPla,
        in1: config.lng()
    }
    service.operation(config.infoacademicawsdl(), 'getPlaById', args, function(err, result) {
        return next(err, result);
    });
}