var async = require('async');

var config = require('../config');
var service = require('../ws/service');

exports.index = function(req, res) {

	//http://localhost:3333/professor?idp=224475&anyAcademic=20122

	var courses = {};

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
					in1: item.anyAcademic
				}
				service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
					if (err) return callback(err);

					course = courses[item.codAssignatura];
					course.aules = 0;
					course.estudiants = 0;
					if (result.out.AulaVO) {
						course.aules = result.out.AulaVO.length;
						result.out.AulaVO.forEach(function(aula) {
							course.estudiants += parseInt(aula.numPlacesAssignades);
						});
					}

					callback();
				});
			}
		], function(err, results) {
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
				async.each(result.out.AssignaturaReduidaVO, getCourseStats, function(err) {
					if (err) return callback(err);
					callback(null, courses);
				});
			});
		}
	], function (err, result) {
		res.json(result);
	});
}