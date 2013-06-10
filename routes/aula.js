var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var service = require('../ws/service');

exports.index = function(req, res) {

	//http://localhost:3333/assignatura/aula?codAssignatura=M1.047&anyAcademic=20122&numAula=1&ordre=0

	var args = {
		in0: req.query.anyAcademic,
		in1: req.query.codAssignatura,
		in2: req.query.numAula
	};
	service.operation(config.racwsdl(), 'getAula', args, function(err, result) {
		if(err) { console.log(err); callback(true); return; }

		var aula = result.out;
		//aula.activitats = indicadors.getActivitatsAssignatura();
		//aula.eines = indicadors.getEinesAssignatura();
		aula.indicadors = {};
		async.parallel([
		    function(callback) {
					var args = {
						in0: 'RAC_CONSULTOR_AC',
						in1: req.query.codAssignatura,
						in2: req.query.anyAcademic,
						in3: req.query.numAula,
						in4: req.query.ordre,
						in5: '0',
						in6: '0'
					}
					service.operation(config.racwsdl(), 'calcularIndicadorsAula', args, function(err, result) {
						if(err) { console.log(err); callback(true); return; }
						aula.indicadors.seguimentac = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
						aula.indicadors.superacioac = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
						callback();
					});
		    }
		], function(err, results) {
			if(err) { console.log(err); callback(true); return; }
			res.json(aula);
		});
	});
}