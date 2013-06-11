var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var service = require('../ws/service');

exports.index = function(req, res) {

	//http://localhost:3333/assignatura/aula?codAssignatura=M1.047&anyAcademic=20122&numAula=1

	var aula = [];
	var args = {
		in0: req.query.anyAcademic,
		in1: req.query.codAssignatura,
		in2: req.query.numAula
	};
	service.operation(config.racwsdl(), 'getAula', args, function(err, result) {
		aula = result.out;
		async.parallel([
		  getUltimaActivitatAmbNotaByAula,
		  getActivitatsByAula,
		], function(err, results) {
			if(err) { console.log(err); callback(true); return; }
			res.json(aula);
		});		
	});

	var getUltimaActivitatAmbNotaByAula = function(callback) {
		var args = {
			in0: req.query.anyAcademic,
			in1: req.query.codAssignatura,
			in2: req.query.numAula
		}
		service.operation(config.racwsdl(), 'getUltimaActivitatAmbNotaByAula', args, function(err, result) {
			if(err) { console.log(err); callback(true); return; }
			aula.ultima = result.out.ordre;
			callback();
		});
	}

	var getActivitatsByAula = function(callback) {
		var args = {
			in0: req.query.anyAcademic,
			in1: req.query.codAssignatura,
			in2: req.query.numAula
		}
		service.operation(config.racwsdl(), 'getActivitatsByAula', args, function(err, result) {
			if(err) { console.log(err); callback(true); return; }
			aula.activitats = result.out.ActivitatVO;
			async.each(aula.activitats, getIndicadorsActivitat, function(err) {
				callback();
			});
		});
	}

	var getIndicadorsActivitat = function(item, callback) {
		async.parallel([
			function(callback) {
	    	getNumEstudiantsQualificatsByActivitat(item, callback);
			},
			function(callback) {
	    	calcularIndicadorsAula(item, callback);
			}
		], function(err, results) {
			if(err) { console.log(err); callback(true); return; }
			callback();
		});
	}

	var getNumEstudiantsQualificatsByActivitat = function(item, callback) {
		var args = {
			in0: req.query.anyAcademic,
			in1: req.query.codAssignatura,
			in2: req.query.numAula,
			in3: item.ordre
		}
		service.operation(config.racwsdl(), 'getNumEstudiantsQualificatsByActivitat', args, function(err, result) {
			if(err) { console.log(err); callback(true); return; }
			item.qualificats = result.out;
			callback();
		});
	}

	var calcularIndicadorsAula = function(item, callback) {
		var args = {
			in0: 'RAC_CONSULTOR_AC',
			in1: req.query.codAssignatura,
			in2: req.query.anyAcademic,
			in3: req.query.numAula,
			in4: item.ordre,
			in5: '0',
			in6: '0'
		}
		service.operation(config.racwsdl(), 'calcularIndicadorsAula', args, function(err, result) {
			if(err) { console.log(err); callback(true); return; }
			item.indicadors = {};
			item.indicadors.seguimentac = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
			item.indicadors.superacioac = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
			callback();
		});		
	}
}

exports.estudiants = function(req, res) {

	var estudiants = [];
	async.series([
		function(callback) {
			getEstudiantsPerAula(req.query.anyAcademic, req.query.codAssignatura, req.query.numAula, function(err, result) {
				if(err) { console.log(err); callback(true); return; }
				estudiants = result.out.EstudiantAulaVO;
				callback();
			});
		},
	  function(callback) {
	  	async.each(estudiants, function (estudiant, callback) {
	  		getDarreraNotaEstudiant(req.query.anyAcademic, req.query.codAssignatura, req.query.numAula, estudiant, function(err, result) {
	  			if(err) { console.log(err); callback(true); return; }
					estudiant.darreraNota = result;
					callback();
				});
	  	}, function(err) {
	  		if(err) { console.log(err); callback(true); return; }
				callback();
			});
	  }
	], function(err, results) {
		if(err) { console.log(err); callback(true); return; }
		res.json(estudiants);
	});

}

var getDarreraNotaEstudiant = function(anyAcademic, codAssignatura, numAula, estudiant, callback) {
	var args = {
		in0: estudiant.numExpedient,
		in1: anyAcademic,
		in2: codAssignatura,
		in3: numAula,
		in4: '2'
	}
	service.operation(config.racwsdl(), 'getActivitatsByEstudiantAulaOrdre', args, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		callback(null, result.out.codQualificacio);
	});
}

var getEstudiantsPerAula = function(anyAcademic, codAssignatura, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula
	}
	service.operation(config.racwsdl(), 'getEstudiantsByAula', args, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		callback(null, result);
	});
}