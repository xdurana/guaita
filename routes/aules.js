var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var activitats = require('./activitats');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules

	var struct = {
		anyAcademic: anyAcademic,
		codAssignatura: codAssignatura,
		aules: [
		]
	}

	infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		if (result.out.AulaVO) {			
			result.out.AulaVO.forEach(function(aula) {
				struct.aules.push({
					codAula: aula.codAula,
					codAulaTFC: aula.codAulaTFC,
					codTFC: aula.codTFC,
					dataCreacio: aula.dataCreacio,
					dataModificacio: aula.dataModificacio,
					idpConsultor: aula.idpConsultor,
					indConsOficial: aula.indConsOficial,
					numPlacesAssignades: aula.numPlacesAssignades
				});

				/*
				classroom = struct.aules[aula.codAula];
				classroom.clicksAcumulats = indicadors.getClicksAcumulatsAula();
				classroom.lecturesPendents = indicadors.getLecturesPendentsAula();
				classroom.lecturesPendents = indicadors.getLecturesPendentsAula();
				classroom.participacions = indicadors.getParticipacionsAula();
				classroom.seguimentAC = indicadors.getSeguimentACAula();
				classroom.superacioAC = indicadors.getSuperacioACAula();
				classroom.darreraActivitatLliurada = indicadors.getDarreraActivitatLliuradaAula();
				classroom.darreraActivitatSuperada = indicadors.getDarreraActivitatSuperadaAula();
				*/

			});
		}
		callback(null, struct);
	});
}

exports.one = function(codAssignatura, anyAcademic, codAula, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,		
		aula: {
		},
		estudiants: {
		}
	}

	rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {

		if(err) { console.log(err); callback(true); return; }
		struct.aula = result.out;

		rac.getUltimaActivitatAmbNotaByAula(anyAcademic, codAssignatura, codAula, function(err, result) {

			if(err) { console.log(err); callback(true); return; }
			struct.aula.ordre = result.out.ordre;

			async.parallel([
				function (callback) {

					var tipusIndicador = 'RAC_PRA_2';
					var comptarEquivalents = '0';
					var comptarRelacions = '0';

			    	rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, struct.aula.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
			    		if(err) { console.log(err); callback(true); return; }
						struct.estudiants.total = indicadors.getTotalEstudiantsTotal(result.out.ValorIndicadorVO);
						struct.estudiants.repetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
						struct.estudiants.primera_matricula = indicadors.getTotalEstudiantsPrimeraMatricula(result.out.ValorIndicadorVO);
						callback();
					});
				},
				function (callback) {

					var tipusIndicador = 'RAC_CONSULTOR_AC';
					var comptarEquivalents = '0';
					var comptarRelacions = '0';

			    	rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, struct.aula.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
			    		if(err) { console.log(err); callback(true); return; }
						struct.estudiants.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
						struct.estudiants.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
						callback();
					});
				}
			], function(err, results) {
				if(err) { console.log(err); callback(true); return; }
				callback(null, struct);
			});
		});
	});

	/*
	var getIndicadorsActivitat = function(item, callback) {
		async.parallel([
			function(callback) {
	    	getNumEstudiantsQualificatsByActivitat(item, function(err, result) {
	    		if(err) { console.log(err); callback(true); return; }
					item.qualificats = result.out;
	    	});
			},
			function(callback) {

				var tipusIndicador = 'RAC_CONSULTOR_AC';
				var comptarEquivalents = '0';
				var comptarRelacions = '0';

	    	rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
	    		if(err) { console.log(err); callback(true); return; }
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
	*/
}