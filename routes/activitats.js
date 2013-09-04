var async = require('async');
var request = require('request');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var aulaca = require('../ws/aulaca');

/**
 * Activitats d'una aula
 * @param domainId
 * @param domainIdAula
 * @param s
 */
exports.aula = function(domainId, domainIdAula, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		activitats: [
		]
	}

	//TODO
	var getResumComunicacio = function(activitat, callback) {
		activitat.nom = activitat.name;
		activitat.resum = {
			comunicacio: {
				clicsAcumulats: 0,
				lecturesPendentsAcumulades: 0,
				lecturesPendents: 0,
				participacions: 0
			}
		}
		callback(null, activitat);
	}

	aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		struct.activitats = result;
		async.each(struct.activitats, getResumComunicacio, function(err) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, struct);
		});
	});
}

/**
 * Activitats d'un idp
 * @param domainId
 * @param domainIdAula
 * @param idp
 */
exports.idp = function(domainId, domainIdAula, idp, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		idp: idp,
		activitats: [
		]
	}

	//TODO
	var getResumComunicacioActivitatIdp = function(activitat, callback) {
		activitat.nom = activitat.name;
		activitat.resum = {
			comunicacio: {
				clicsAcumulats: 0,
				lecturesPendents: 0,
				participacions: 0,
				ultimaConnexio: '01/01/2014'
			}
		}
		callback(null, activitat);
	}

	aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		struct.activitats = result;
		async.each(struct.activitats, getResumComunicacioActivitatIdp, function(err) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, struct);
		});
	});
}

/**
 * Indicadors d'avaluació d'una aula
 * @param domainId
 * @param domainIdAula
 */
exports.avaluacio = function(anyAcademic, codAssignatura, codAula, s, callback) {

	var struct = {
		s: s,
		anyAcademic: anyAcademic,
		codAssignatura: codAssignatura,
        codAula: codAula,
		activitats: [
		]
	}

	rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		struct.activitats = result.out.ActivitatVO;
		async.each(struct.activitats, getIndicadorsActivitat, function(err) {
			if(err) { console.log(err); return; }
	  		callback(null, struct);
		});
	});

    var getIndicadorsActivitat = function(item, callback) {

        item.nom = item.descripcio[0].DescripcioVO[0].valor;
        item.resum = {
            avaluacio: {
                seguiment: '-',
                superacio: '-',
                dataLliurament: item.dataLliurament ? item.dataLliurament : '-'
            }
        }

        async.parallel([
            function(callback) {
                callback();
                /*
                rac.getNumEstudiantsQualificatsByActivitat(item, function(err, result) {
                    if(err) { console.log(err); callback(err); return; }
                    item.qualificats = result.out;
                    callback();
                });
                */
            },
            function(callback) {

                var tipusIndicador = 'RAC_CONSULTOR_AC';
                var comptarEquivalents = '0';
                var comptarRelacions = '0';

                rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
                    if(err) { console.log(err); callback(err); return; }
                    item.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
                    item.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
                    callback();
                });
            }
        ], function(err, results) {
            if(err) { console.log(err); callback(err); return; }
            callback();
        });
    }    
}