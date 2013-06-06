var config = require('../config');
var service = require('./service');

exports.getIndicadorsByResponsable = function(req, res) {
	//http://localhost:3333/ws/getIndicadorsByResponsable?in0=224475&in1=20121
	var args = {
		in0: req.query.in0, //idpResponsable
		in1: req.query.in1, //anyAcademic
	};
	service.operation(config.racwsdl(), 'getIndicadorsByResponsable', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.calcularIndicadorsAssignatura = function(req, res) {
	//http://localhost:3333/ws/calcularIndicadorsAssignatura?in0=ESTUD_REPITE&in1=M1.147&in2=20121&in3=0&in4=0
	var args = {
		in0: req.query.in0, //tipusIndicador
		in1: req.query.in1, //codAssignatura
		in2: req.query.in2, //anyAcademic
		in3: req.query.in3, //comptarEquivalents
		in4: req.query.in4, //comptarRelacions
	};
	service.operation(config.racwsdl(), 'calcularIndicadorsAssignatura', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}