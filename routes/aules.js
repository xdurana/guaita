var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.index = function(codAssignatura, anyAcademic, codAula, callback) {

	//http://localhost:3333/assignatures/M1.047/20122/aules/1

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		aula: {
		},
		activitats: {
		}
	}

	rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
		struct.aula = result.out;
		async.parallel([
			function(callback) {
			  rac.getUltimaActivitatAmbNotaByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
			  	struct.aula.ultima = result.out.ordre;
			  });
			  callback();
			},
			function(callback) {
			  rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
					struct.aula.activitats = result.out.ActivitatVO;
					async.each(struct.aula.activitats, getIndicadorsActivitat, function(err) {
						callback();
					});
			  });
			  callback();
			}
		], function(err, results) {
			if(err) { console.log(err); callback(true); return; }
			callback(null, struct);
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

	    	rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
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