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
				if(err) { console.log(err); callback(true); return; }
				callback(null, object);
			});
		} else {
			callback('error al carregar assignatures del idp');
		}
	});

	var resumAssignatura = function(subject, callback) {
		//TODO
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
		}
		callback(null);
	}
}

/*
exports.bypra = function(s, anyAcademic, callback) {

	//http://localhost:3333/assignatures/?s=&anyAcademic=20122

	var struct = {
		anyAcademic: anyAcademic,
		groups: {
		},
		courses: {
		}
	}

	auth.getContextBySessionId(s, function(err, result) {
		if(err) { console.log(err); callback(true); return; }

		console.log(result.out.idp);

		struct.idp = result.out.idp;

		dadesacademiques.getAssignaturesByResponsableAny(struct.idp, anyAcademic, function(err, result) {
			if(err) { console.log(err); callback(true); return; }
			
			async.each(result.out.AssignaturaReduidaVO, getEquivalents, function (err) {
				if(err) { console.log(err); callback(true); return; }

				async.each(Object.keys(struct.courses), getCourseStats, function(err) {
					if(err) { console.log(err); callback(true); return; }

					async.each(Object.keys(struct.groups), getGroupStats, function(err) {
						if(err) { console.log(err); callback(true); return; }
						callback(null, struct);

					});
				});
			});
		});
	});

	var getEquivalents = function(item, callback) {

		var codAssignatura = item.codAssignatura[0];
		item.filles = [];
		item.indicadors = {};
		struct.courses[codAssignatura] = item;

		dadesacademiques.getAssignaturesRelacionades(1, struct.anyAcademic, codAssignatura, 'ca', function(err, result) {
			item.relacions = result.out.AssignaturaRelacionadaVO;
			codiMare = indicadors.getCodiMare(item.relacions);
			codi = codiMare ? codiMare : codAssignatura;
			struct.groups[codi] = struct.groups[codi] ? struct.groups[codi] : {};
			struct.groups[codi].assignatures = struct.groups[codi].assignatures ? struct.groups[codi].assignatures : [];
			struct.groups[codi].assignatures.push(item);
			if (codiMare) {
				struct.courses[codiMare].filles.push(item);
			}			
			callback();
		});
	}

	var getCourseStats = function(key, callback) {

		var course = struct.courses[key];
		var codAssignatura = course.codAssignatura;

		async.parallel([
		    function(callback) {
		    	infoacademica.getAulesByAssignatura(struct.anyAcademic, codAssignatura, function(err, result) {
		    		if(err) { console.log(err); callback(true); return; }
						course.aules = result.out.AulaVO;
						course.indicadors.numAules = indicadors.getTotalAules(result.out.AulaVO);
						course.indicadors.estudiants = indicadors.getTotalEstudiants(result.out.AulaVO);
						callback();
		    	});
		    },
		    function(callback) {
		    	rac.calcularIndicadorsAssignatura('RAC_PRA_2', struct.anyAcademic, codAssignatura, '0', '0', function(err, result) {
						if(err) { console.log(err); callback(true); return; }
						course.indicadors.estudiantsRepetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
						callback();
		    	});
				}
		], function(err, results) {
			if(err) { console.log(err); callback(true); return; }
			callback();
		});
	}

	var getGroupStats = function(key, callback) {
		var group = struct.groups[key];
		group.indicadors = {
			estudiants: 0,
			estudiantsRepetidors: 0,
			numAules: 0
		};
		group.assignatures.forEach(function(assignatura) {
			group.indicadors.estudiants += assignatura.indicadors.estudiants;
			group.indicadors.estudiantsRepetidors += assignatura.indicadors.estudiantsRepetidors;
			group.indicadors.numAules += assignatura.indicadors.numAules;
		});
		callback();
	}
}
*/