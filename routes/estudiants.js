var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

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

exports.one = function(codAssignatura, anyAcademic, codAula, numExpedient, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/estudiants/476981

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		numExpedient: numExpedient,
		estudiant: {
		}
	}

	rac.getActivitatsByEstudiantAula(anyAcademic, codAssignatura, codAula, numExpedient, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		struct.estudiant.activitats = result.out;
		callback(null, struct);
	});
}