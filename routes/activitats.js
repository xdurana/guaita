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

	domainId = '382784';
	domainIdAula = '382785';

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

	domainId = '382784';
	domainIdAula = '382785';

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
exports.avaluacio = function(domainId, domainIdAula, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		activitats: [
			{
				nom: 'Activitat 1 Lorem ipsum dolor',
				eventId: '696566',
				resum: {
					avaluacio: {
						seguiment: '0/0 0,00%',
						superacio: '0/0 0,00%',
						dataLliurament: '01/01/2014'
					}
				}
			},
			{
				nom: 'Activitat 2 Consectur ips magna curator',
				eventId: '694961',
				resum: {
					avaluacio: {
						seguiment: '0/0 0,00%',
						superacio: '0/0 0,00%',
						dataLliurament: '01/01/2014'
					}
				}
			}
		]
	}

	/*
	var anyAcademic = '20122';
	var codAssignatura = '05.002';
	var codAula = '1';

	rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		struct.activitats = result.out.ActivitatVO;
		async.each(struct.aula.activitats, getIndicadorsActivitat, function(err) {
			if(err) { console.log(err); return; }
	  		callback(null, struct);
		});
	});
	*/

	callback(null, struct);
}

/*
exports.one = function(codAssignatura, anyAcademic, codAula, ordre, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/activitats/1

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		ordre: ordre,
		activitat: {
		},
		avaluacio: {
		}
	}

	async.parallel([
		function (callback) {
	    	rac.getActivitat(codAssignatura, anyAcademic, codAula, ordre, function(err, result) {
	    		if(err) { console.log(err); callback(err); return; }
				struct.activitat.campusId = result.out.campusId;
				struct.activitat.dataLliurament = result.out.dataLliurament;
				struct.activitat.dataPublicacio = result.out.dataPublicacio;
				callback();
			});
		},
		function (callback) {

			var tipusIndicador = 'RAC_CONSULTOR_AC';
			var comptarEquivalents = '0';
			var comptarRelacions = '0';

			rac.calcularIndicadorsAula(tipusIndicador, codAssignatura, anyAcademic, codAula, ordre, comptarEquivalents, comptarRelacions, function(err, result) {
				if(err) { console.log(err); callback(err); return; }
				struct.avaluacio.seguimentac = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
				struct.avaluacio.superacioac = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
				callback();
			});
		}
	], function(err, results) {
		if(err) { console.log(err); callback(err); return; }
		callback(null, struct);
	});
}
*/