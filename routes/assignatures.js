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
				total: config.nc()
			},
			estudiants: {
				total: config.nc(),
				repetidors: config.nc()
			},
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc()
			},
			avaluacio: {
				seguiment: config.nc(),
				superacio: config.nc()
			}
		};

		async.parallel([
            function (callback) {
                aulaca.getAulesAssignatura(subject.domainId, idp, s, function(err, result) {
                    if (err) {
                        console.log(err);
                        callback(null);
                    }
                    subject.resum.aules.total = result.length;
                    callback(null);
                });
            },
			function (callback) {
				rac.calcularIndicadorsAssignatura('RAC_PRA_2', subject.anyAcademic, subject.codi, '0', '0', function(err, result) {
					if (err) {
                        console.log(err);
                        callback(null);
                    }
					subject.resum.estudiants.total = indicadors.getTotalEstudiantsTotal(result.out.ValorIndicadorVO);
					subject.resum.estudiants.repetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
					callback(null);
				});
			},
			function (callback) {
				rac.calcularIndicadorsAssignatura('RAC_CONSULTOR_AC', subject.anyAcademic, subject.codi, '0', '0', function(err, result) {
                    if (err) {
                        console.log(err);
                        callback(null);
                    }
					subject.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
					subject.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
					callback(null);
				});
			}
		], function(err, result) {
			if (err) {
                console.log(err);
            }
			callback(null, result);
		});
	}

	aulaca.getAssignaturesPerIdp(s, idp, anyAcademic, function(err, result) {
		if (err) {
            console.log(err);
            callback(null, struct);
        }
		struct.assignatures = result;
		async.each(struct.assignatures, getResum, function(err) {
			if (err) {
                console.log(err);
            }
			callback(null, struct);
		});
	});
}