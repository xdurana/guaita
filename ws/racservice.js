var config = require('../config');
var service = require('./service');

exports.getIndicadorsByResponsable = function(req, res) {
	//http://localhost:3333/ws/getIndicadorsByResponsable?idpResponsable=224475&anyAcademic=20121
	var args = {
		in0: req.query.idpResponsable,
		in1: req.query.anyAcademic
	};
	service.operation(config.racwsdl(), 'getIndicadorsByResponsable', args, function(err, result) {
		res.json(result);
	});
}

exports.calcularIndicadorsAssignatura = function(req, res) {
	//http://localhost:3333/ws/calcularIndicadorsAssignatura?tipusIndicador=ESTUD_REPITE&codAssignatura=M1.147&anyAcademic=20121&comptarEquivalents=0&comptarRelacions=0
	var args = {
		in0: req.query.tipusIndicador,
		in1: req.query.codAssignatura,
		in2: req.query.anyAcademic,
		in3: req.query.comptarEquivalents,
		in4: req.query.comptarRelacions
	};
	service.operation(config.racwsdl(), 'calcularIndicadorsAssignatura', args, function(err, result) {
		res.json(result);
	});
}

exports.getAula = function(req, res) {
	//http://localhost:3333/ws/getAula?anyAcademic=20122&codAssignatura=M1.047&numAula=1
	var args = {
		in0: req.query.anyAcademic,
		in1: req.query.codAssignatura,
		in2: req.query.numAula
	}
	service.operation(config.racwsdl(), 'getAula', args, function(err, result) {
		res.json(result);
	});
}