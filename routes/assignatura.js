var async = require('async');

var config = require('../config');
var service = require('../ws/service');

exports.aules = function(req, res) {
	//http://localhost:3333/assignatura/aules?codAssignatura=M1.047&anyAcademic=20122

	var args = {
		in0: req.query.codAssignatura,
		in1: req.query.anyAcademic
	}
	service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
		if (result.out.AulaVO) {
			result.out.AulaVO.forEach(function(aula) {
				//TODO Get classroom indicators
			});
		}
	});
}

exports.consultors = function(req, res) {
	//http://localhost:3333/assignatura/consultors?codAssignatura=M1.047&anyAcademic=20122

	var consultants = {};
	var getConsultantStats = function(item, callback) {
		consultants[item.idpConsultor[0]] = {
			idpConsultor: item.idpConsultor[0],
			codAssignatura: item.codAssignatura[0],
			codAula: item.codAula[0]
		}
		//TODO Get consultor indicators
	}

	var args = {
		in0: req.query.codAssignatura,
		in1: req.query.anyAcademic
	}
	service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
		async.each(result.out.AulaVO, getConsultantStats, function(err) {
			if (err) return callback(err);			
		});
		res.json(consultants);
	});
}