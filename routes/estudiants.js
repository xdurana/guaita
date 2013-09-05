var async = require('async');

var indicadors = require('./indicadors');
var config = require('../config');
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
        try {
    		async.each(struct, getResumEstudiant, function(err) {
    			if(err) { console.log(err); callback(err); return; }
    			callback(null, struct);
    		});
        } catch(e) {
            callback(struct);
        }
	});

	var getResumEstudiant = function(estudiant, callback) {
		estudiant.nomComplert = indicadors.getNomComplert(estudiant.tercer);
		estudiant.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		};
		callback(null, estudiant);
	}
}