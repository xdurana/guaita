var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

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
		  rac.getUltimaActivitatAmbNotaByAula(anyAcademic, codAssignatura, numAula, function(err, result) {
		  	aula.ultima = result.out.ordre;
		  }),
		  rac.getActivitatsByAula(anyAcademic, codAssignatura, numAula, function(err, result) {
				aula.activitats = result.out.ActivitatVO;
				async.each(aula.activitats, getIndicadorsActivitat, function(err) {
					callback();
				});
		  })
		], function(err, results) {
			if(err) { console.log(err); callback(true); return; }
			res.json(aula);
		});		
	});

	var getIndicadorsActivitat = function(item, callback) {
		async.parallel([
			function(callback) {
	    	getNumEstudiantsQualificatsByActivitat(item, function(err, result) {
					item.qualificats = result.out;
	    	});
			},
			function(callback) {

				var tipusIndicador = 'RAC_CONSULTOR_AC';
				var comptarEquivalents = '0';
				var comptarRelacions = '0';

	    	rac.calcularIndicadorsAula(tipusIndicador, codAssignatura, anyAcademic, numAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
	    		item.indicadors = {};
					item.indicadors.seguimentac = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
					item.indicadors.superacioac = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
				});

			}
		], function(err, results) {
			if(err) { console.log(err); callback(true); return; }
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
	  		var ordre = '2';
	  		getActivitatsByEstudiantAulaOrdre(req.query.anyAcademic, req.query.codAssignatura, req.query.numAula, ordre, estudiant.numExpedient, function(err, result) {
	  			if(err) { console.log(err); callback(true); return; }
					estudiant.darreraNota = result.out.codQualificacio;
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

exports.estudiant = function(req, res) {
	var estudiant = {};
	rac.getActivitatsByEstudiantAulaResponse(req.query.anyAcademic, req.query.codAssignatura, req.query.numAula, req.query.numExpedient, function(err, result) {
		if(err) { console.log(err); return; }
		estudiant.activitats = result.out;
		res.json(estudiant);
	});
}