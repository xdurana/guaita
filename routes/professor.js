var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var service = require('../ws/service');

exports.index = function(req, res) {

	//http://localhost:3333/professor?idp=224475&anyAcademic=20122

	var agrupacions = [];
	var assignatures = {};
	var courses = {};

	/*
	var getCourseStats = function(item, callback) {

		courses[item.codAssignatura] = {};

		async.parallel([

			//Course information
			function(callback) {
				var args = {
					in0: item.codAssignatura,
					in1: 'ca'
				}
				service.operation(config.infoacademicawsdl(), 'getAssignaturaByCodi', args, function(err, result) {
					if (err) return callback(err);

					course = courses[item.codAssignatura];
					course.codAssignatura = result.out.codAssignatura;
				  course.descAssignatura = result.out.descAssignatura;
				  course.descLlargaAssignatura = result.out.descLlargaAssignatura;
				  course.numCredits = result.out.numCredits;

					callback();
				});
			},

			//Course classroom information
			function(callback) {
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
					course.aules = indicadors.getTotalAules(result.out.AulaVO);
					course.estudiants = indicadors.getTotalEstudiants(result.out.AulaVO);
					course.estudiantsRepetidors = indicadors.getTotalEstudiantsRepetidors();
					callback();
				});
			}
		], function(err, results) {
			callback();
		});
	}
	*/

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
			assignatures[item.codAssignatura]	= item;
			assignatures[item.codAssignatura].relacions = result.out.AssignaturaRelacionadaVO;
			assignatures[item.codAssignatura].filles = [];
			callback();
		});
	}

	async.waterfall([
		function(callback) {
			var args = {
				in0: req.query.idp,
				in1: req.query.anyAcademic
			}
			service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
				if (err) return callback(err);
				async.each(result.out.AssignaturaReduidaVO, getAssignaturesRelacionades, function(err) {
					if (err) return callback(err);
					for (var key in assignatures) {
						assignatura = assignatures[key];
						mare = getCodiMare(assignatura.relacions);
						if (mare) {
							assignatures[mare].filles.push(assignatura);
						} else {
							agrupacions.push(assignatura);
						}
					}
					callback(null, agrupacions);
				});

				/*
				async.each(result.out.AssignaturaReduidaVO, getCourseStats, function(err) {
					if (err) return callback(err);
					callback(null, courses);
				});
				*/

			});
		}
	], function (err, result) {
		res.json(result);
	});
}