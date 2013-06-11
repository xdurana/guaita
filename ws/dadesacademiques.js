var config = require('../config');
var service = require('../service');

exports.getAssignaturesRelacionades = function(rol, anyAcademic, codAssignatura, idioma, callback) {
	var args = {
		in0: rol,
		in1: codAssignatura,
		in2: anyAcademic,
		in3: idioma
	}
	service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesRelacionades', args, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		callback(null, result);
	});
}