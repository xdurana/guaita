var async = require('async');

var indicadors = require('./indicadors');
var config = require('../config');
var rac = require('../ws/rac');
var lrs = require('../ws/lrs');

/**
 * Estudiants d'una aula
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 */
exports.all = function(anyAcademic, codAssignatura, codAula, s, callback) {

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
        estudiant.idp = estudiant.tercer[0].idp[0];
		estudiant.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		};

        async.parallel([
            function(callback) {
                lrs.byidp(estudiant.idp, s, function(err, result) {
                    if (err) { console.log(err); callback(err); return; }
                    estudiant.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    callback();
                });
            },
            function(callback) {
                lrs.byidplast(estudiant.idp, s, function(err, result) {
                    if (err) { console.log(err); callback(err); return; }
                    estudiant.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    callback();
                });
            }
        ], function(err, results) {
            if(err) { console.log(err); }
            callback();
        });
	}
}