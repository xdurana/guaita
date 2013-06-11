var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.assignatures = function(req, res) {

	//http://localhost:3333/professor?idp=224475&anyAcademic=20122

	var groups = {};
	var courses = {};

	var args = {
		in0: req.query.idp,
		in1: req.query.anyAcademic
	}
	service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		async.each(result.out.AssignaturaReduidaVO, getEquivalents, function(err) {
			if(err) { console.log(err); callback(true); return; }
			async.each(Object.keys(courses), getCourseStats, function(err) {
				if(err) { console.log(err); callback(true); return; }
				async.each(Object.keys(groups), getGroupStats, function(err) {
					if(err) { console.log(err); callback(true); return; }
					res.json(groups);
				});
			});
		});
	});

	var getEquivalents = function(item, callback) {

		var codAssignatura = item.codAssignatura[0];
		item.filles = [];
		item.indicadors = {};
		courses[codAssignatura] = item;

		dadesacademiques.getAssignaturesRelacionades(1, anyAcademic, codAssignatura, 'ca', function(err, result) {
			item.relacions = result.out.AssignaturaRelacionadaVO;
			codiMare = indicadors.getCodiMare(item.relacions);
			codi = codiMare ? codiMare : codAssignatura;
			groups[codi] = groups[codi] ? groups[codi] : {};
			groups[codi].assignatures = groups[codi].assignatures ? groups[codi].assignatures : [];
			groups[codi].assignatures.push(item);
			if (codiMare) {
				courses[codiMare].filles.push(item);
			}			
			callback();
		});
	}

	var getCourseStats = function(key, callback) {
		var course = courses[key];
		async.parallel([
		    function(callback) {
		    	rac.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		    		if(err) { console.log(err); callback(true); return; }
						course.aules = result.out.AulaVO;
						course.indicadors.numAules = indicadors.getTotalAules(result.out.AulaVO);
						course.indicadors.estudiants = indicadors.getTotalEstudiants(result.out.AulaVO);
						callback();
		    	});
		    },
		    function(callback) {
		    	rac.calcularIndicadorsAssignatura('RAC_PRA_2', anyAcademic, codAssignatura, '0', '0', function(err, result) {
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
		var group = groups[key];
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