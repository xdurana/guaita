var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var service = require('../ws/service');

exports.index = function(req, res) {

	//http://localhost:3333/professor?idp=224475&anyAcademic=20122

	var groups = [];
	var courses = {};

	var getGroupStats = function(item, callback) {
		async.each([].concat([item], item.filles), getCourseStats, function(err) {
			if (err) {
				console.log(err);
				return callback(err);
			}
			callback();
		});
	}

	var getCourseStats = function(item, callback) {
		var args = {
			in0: item.codAssignatura,
			in1: req.query.anyAcademic
		}				
		service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
			if (err) {
				console.log(err);
				return callback(err);
			}
			course = courses[item.codAssignatura];
			course.stats = {
				aules: result.out.AulaVO,
				numAules: indicadors.getTotalAules(result.out.AulaVO),
				estudiants: indicadors.getTotalEstudiants(result.out.AulaVO),
				estudiantsRepetidors: indicadors.getTotalEstudiantsRepetidors()
			};
			callback();
		});
	}

	var getCodiMare = function(relacions) {
		return relacions && relacions[0].tipusRelacio == 'I' ? relacions[0].codi : false;
	}

	var getAssignaturesRelacionades = function(item, callback) {
		var args = {
			in0: 1,
			in1: item.codAssignatura,
			in2: req.query.anyAcademic,
			in3: 'ca'
		}
		service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesRelacionades', args, function(err, result) {
			courses[item.codAssignatura]	= item;
			courses[item.codAssignatura].relacions = result.out.AssignaturaRelacionadaVO;
			courses[item.codAssignatura].filles = [];
			callback();
		});
	}

	var args = {
		in0: req.query.idp,
		in1: req.query.anyAcademic
	}
	service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
		if (err) return callback(err);

		async.each(result.out.AssignaturaReduidaVO, getAssignaturesRelacionades, function(err) {
			if (err) return callback(err);
			for (var key in courses) {
				assignatura = courses[key];
				mare = getCodiMare(assignatura.relacions);
				if (mare) {
					courses[mare].filles.push(assignatura);
				} else {
					groups.push(assignatura);
				}
			}
			async.each(groups, getGroupStats, function(err) {
				if (err) return callback(err);
				res.json(groups);
			});
		});
	});
}