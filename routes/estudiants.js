var async = require('async');

var indicadors = require('./indicadors');
var rac = require('../ws/rac');

/**
 * Estudiants d'una aula
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 */
exports.all = function(anyAcademic, codAssignatura, codAula, callback) {

	var struct = [
	];

	rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		struct = result.out.EstudiantAulaVO;
		async.each(struct, getResumEstudiant, function(err) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, struct);
		});
	});

	var getResumEstudiant = function(estudiant, callback) {
		estudiant.nomComplert = indicadors.getNomComplert(estudiant.tercer);
		estudiant.resum = {
			comunicacio: {
				clicsAcumulats: 0,
				lecturesPendentsAcumulades: 0,
				participacions: 0,
				ultimaConnexio: '01/01/2014'
			}
		};
		callback(null, estudiant);
	}

	/*
	var getIndicadorsActivitat = function(estudiant, callback) {
		var ordre = '2';
		rac.getActivitatsByEstudiantAulaOrdre(struct.anyAcademic, struct.codAssignatura, struct.codAula, ordre, estudiant.numExpedient[0], function(err, result) {
			if(err) { console.log(err); callback(err); return; }
			estudiant.darreraNota = result.out.codQualificacio;
			callback();
		});
	}
	*/
}