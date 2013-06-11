var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var service = require('../ws/service');

exports.index = function(req, res) {

	//http://localhost:3333/professor?idp=224475&anyAcademic=20122

	var groups = {};
	var courses = {};

	var args = {
		in0: req.query.idp,
		in1: req.query.anyAcademic
	}
	service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
		if(err) { console.log(err); callback(true); return; }

		async.each(result.out.AssignaturaReduidaVO, getAssignaturesRelacionades, function(err) {
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

	var getAssignaturesRelacionades = function(item, callback) {

		var codAssignatura = item.codAssignatura[0];
		var args = {
			in0: 1,
			in1: codAssignatura,
			in2: req.query.anyAcademic,
			in3: 'ca'
		}
		item.filles = [];
		item.indicadors = {};
		courses[codAssignatura] = item;
		service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesRelacionades', args, function(err, result) {

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
					var args = {
						in0: course.codAssignatura,
						in1: req.query.anyAcademic
					}
					service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
						if(err) { console.log(err); callback(true); return; }
						course.aules = result.out.AulaVO;
						course.indicadors.numAules = indicadors.getTotalAules(result.out.AulaVO);
						course.indicadors.estudiants = indicadors.getTotalEstudiants(result.out.AulaVO);
						callback();
					});
		    },
		    function(callback) {
					var args = {
						in0: 'RAC_PRA_2',
						in1: course.codAssignatura,
						in2: req.query.anyAcademic,
						in3: '0',
						in4: '0'
					}
					service.operation(config.racwsdl(), 'calcularIndicadorsAssignatura', args, function(err, result) {
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