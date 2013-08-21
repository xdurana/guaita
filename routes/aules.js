var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var activitats = require('./activitats');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, domainId, callback) {

	var struct = {
		anyAcademic: anyAcademic,
		codAssignatura: codAssignatura,
		domainId: domainId,
		aules: [
		],
		resum: {
			aules: {
				total: 0
			},
			estudiants: {
				total: 0,
				repetidors: 0
			},
			comunicacio: {
				clicsAcumulats: 0,
				lecturesPendentsAcumulades: 0,
				lecturesPendents: 0,
				participacions: 0
			},
			avaluacio: {
				seguiment: '0,00%',
				superacio: '0,00%',
				dataEntrega: '-'
			}
		}
	}

	infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		if(err) { console.log(err); callback(true); return; }

		if (result.out.AulaVO) {			
			result.out.AulaVO.forEach(function(aula) {

				struct.aules.push({
					codAula: aula.codAula,
					codAulaTFC: aula.codAulaTFC,
					codTFC: aula.codTFC,
					domainIdAula: '382784',
					dataCreacio: aula.dataCreacio,
					dataModificacio: aula.dataModificacio,
					idpConsultor: aula.idpConsultor,
					indConsOficial: aula.indConsOficial,
					estudiants: {
						total: aula.numPlacesAssignades[0],
						repetidors: 0
					},
					comunicacio: {
						clicsAcumulats: 0,
						lecturesPendentsAcumulades: 0,
						lecturesPendents: 0,
						participacions: 0
					},
					avaluacio: {
						seguiment: '0,00%',
						superacio: '0,00%',
						dataEntrega: '-'
					}
				});

				struct.resum.aules.total += 1;
				struct.resum.estudiants.total += parseInt(aula.numPlacesAssignades[0]);
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
		activitat: {
		},
		avaluacio: {
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
			    	rac.getActivitat(codAssignatura, anyAcademic, codAula, struct.aula.ordre, function(err, result) {
			    		if(err) { console.log(err); callback(true); return; }
						struct.activitat.campusId = result.out.campusId;
						struct.activitat.dataLliurament = result.out.dataLliurament;
						struct.activitat.dataPublicacio = result.out.dataPublicacio;
						callback();
					});
				},
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
						struct.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
						struct.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
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