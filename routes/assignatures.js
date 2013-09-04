var async = require('async');
var request = require('request');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var aulaca = require('../ws/aulaca');

exports.byidp = function(s, idp, anyAcademic, callback) {

    var struct = {
        s: s,
        idp: idp,
        anyAcademic: anyAcademic,
        assignatures: [
        ]
    };

    //TODO
	var getResum = function(subject, callback) {

		subject.s = s;
		subject.resum = {
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
				superacio: '0,00%'
			}
		};

		async.parallel([
			function (callback) {
				rac.calcularIndicadorsAssignatura('RAC_PRA_2', subject.anyAcademic, subject.codi, '0', '0', function(err, result) {
					if(err) { console.log(err); callback(err); return; }
					subject.resum.estudiants.total = indicadors.getTotalEstudiantsTotal(result.out.ValorIndicadorVO);
					subject.resum.estudiants.repetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
					callback(null);
				});
			},
			function (callback) {
				rac.calcularIndicadorsAssignatura('RAC_CONSULTOR_AC', subject.anyAcademic, subject.codi, '0', '0', function(err, result) {
					if(err) { console.log(err); callback(err); return; }
					subject.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
					subject.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
					callback(null);
				});
			}
		], function(err, result) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, result);
		});
	}

	aulaca.getAssignaturesPerIdp(s, idp, anyAcademic, function(err, result) {
		if(err) { console.log(err); callback(err); return; }
		struct.assignatures = result;
		async.each(struct.assignatures, getResum, function(err) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, struct);
		});
	});
}