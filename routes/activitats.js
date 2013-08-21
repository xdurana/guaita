var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.aula = function(domainId, domainIdAula, s, callback) {
	var request = require("request");

	domainId = '382784';
	domainIdAula = '382785';

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
		if (error) { console.log(err); callback(true); return; }
		if (response.statusCode == '200') {
			var object = JSON.parse(body);
			struct.activitats = object.activities;
			struct.activitats.forEach(function(activitat) {
				activitat.nom = activitat.name;
				activitat.resum = {
					comunicacio: {
						clicsAcumulats: 0,
						lecturesPendentsAcumulades: 0,
						lecturesPendents: 0,
						participacions: 0
					}
				}
			});
		}
		callback(null, struct);
	});
}

exports.all = function(domainId, domainIdAula, callback) {

	var struct = {
		domainId: domainId,
		domainIdAula: domainIdAula,
		activitats: [
			{
				nom: 'Activitat 1 Lorem ipsum dolor',
				eventId: '696566',
				resum: {
					comunicacio: {
						clicsAcumulats: 0,
						lecturesPendentsAcumulades: 0,
						lecturesPendents: 0,
						participacions: 0
					}
				}
			},
			{
				nom: 'Activitat 2 Consectur ips magna curator',
				eventId: '694961',
				resum: {
					comunicacio: {
						clicsAcumulats: 0,
						lecturesPendentsAcumulades: 0,
						lecturesPendents: 0,
						participacions: 0
					}
				}
			}
		]
	}

	/*
	rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
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
exports.all = function(codAssignatura, anyAcademic, codAula, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/activitats

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		domainId: '382785',
		activitats: [
			{
				nom: 'Activitat 1 Lorem ipsum dolor',
				activityId: '696566'
			},
			{
				nom: 'Activitat 2 Consectur ips magna curator',
				activityId: '694961'
			}
		]
	}

	/*
	rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		struct.activitats = result.out.ActivitatVO;
		async.each(struct.aula.activitats, getIndicadorsActivitat, function(err) {
			if(err) { console.log(err); return; }
	  		callback(null, struct);
		});
	});		
	*

	callback(null, struct);
}
*/
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
	    		if(err) { console.log(err); callback(true); return; }
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
				if(err) { console.log(err); callback(true); return; }
				struct.avaluacio.seguimentac = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
				struct.avaluacio.superacioac = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
				callback();
			});
		}
	], function(err, results) {
		if(err) { console.log(err); callback(true); return; }
		callback(null, struct);
	});
}