var config = require('../config');
var service = require('../service');

exports.getAulesByAssignatura = function(anyAcademic, codAssignatura, callback) {
	var args = {
		in0: codAssignatura,
		in1: anyAcademic
	}
	service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		callback(null, result);
	});
}