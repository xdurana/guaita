var async = require('async');
var request = require('request');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var auth = require('../ws/auth');

exports.byidp = function(s, idp, anyAcademic, callback) {

	var url = "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures?idp=" + idp + "&s=" + s;

	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var object = JSON.parse(body);			
			object.subjects = object.subjects.filter(function(assignatura) {
			    return (assignatura.anyAcademic === anyAcademic);
			});
			async.each(object.subjects, resumAssignatura, function(err) {
				if(err) { console.log(err); callback(err); return; }
				callback(null, object);
			});
		} else {
			callback('error al carregar assignatures del idp');
		}
	});

	var resumAssignatura = function(subject, callback) {

		subject.s = s;
		subject.domainId = '382785';
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
}