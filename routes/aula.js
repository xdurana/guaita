var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var service = require('../ws/service');

exports.index = function(req, res) {
	//http://localhost:3333/assignatura/aula?codAssignatura=M1.047&anyAcademic=20122&codAula=1
	var args = {
		in0: req.query.codAula,
		in1: req.query.codAssignatura,
		in2: req.query.anyAcademic
	};	
	service.operation(config.infoacademicawsdl(), 'getAulaById', args, function(err, result) {
		var aula = result.out.AulaVO[0];
		aula.activitats = indicadors.getActivitatsAssignatura();
		aula.eines = indicadors.getEinesAssignatura();
		res.json(aula);
	});
}