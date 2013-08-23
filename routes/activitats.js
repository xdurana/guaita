var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

var getActivitatsAula = function(domainId, domainIdAula, s, callback) {

	var request = require("request");
	var struct = {
		domainId: domainId,
		domainIdAula: domainIdAula,
		activitats: [
		]
	};

	request({
	  url: "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures/" + domainId + "/aules/" + domainIdAula + "/activitats?s=" + s,
	  method: "GET"
	}, function (error, response, body) {
		if (error) { console.log(err); callback(err); return; }
		if (response.statusCode == '200') {
			var object = JSON.parse(body);
			struct.activitats = object.activities;
		}
		callback(null, struct);
	});	
}

var getResumComunicacio = function(domainId, domainIdAula, eventId, s, callback) {
	var comunicacio = {
		clicsAcumulats: 0,
		lecturesPendentsAcumulades: 0,
		lecturesPendents: 0,
		participacions: 0
	}
	callback(null, comunicacio);
}

exports.aula = function(domainId, domainIdAula, s, callback) {

	domainId = '382784';
	domainIdAula = '382785';

	getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		result.activitats.forEach(function(activitat) {
			activitat.nom = activitat.name;
			activitat.resum = {
			}
			getResumComunicacio(domainId, domainIdAula, activitat.domainId, s, function(err, struct) {
				if(err) { console.log(err); callback(err); return; }
				activitat.resum.comunicacio = struct;
			});
		});
		callback(null, result);
	});
}

exports.avaluacio = function(domainId, domainIdAula, s, callback) {

	var struct = {
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
						dataEntrega: '01/01/2014'
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
						dataEntrega: '01/01/2014'
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