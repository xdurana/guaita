var config = require('../config');
var service = require('./service');

exports.getAssignaturesByResponsableAny = function(req, res) {
	//http://localhost:3333/ws/getAssignaturesByResponsableAny?idResponsable=224475&anyAcademic=20121
	var args = {
		in0: req.query.idResponsable,
		in1: req.query.anyAcademic
	};
	service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
		res.json(result);
	});
}

exports.getAllAssignaturesRelacionades = function(req, res) {
	//http://localhost:3333/ws/getAllAssignaturesRelacionades?codAssignatura=M1.047&anyAcademic=20121&isoLang=ca
	var args = {
		in0: req.query.codAssignatura,
		in1: req.query.anyAcademic,
		in2: req.query.isoLang
	};
	service.operation(config.dadesacademiqueswsdl(), 'getAllAssignaturesRelacionades', args, function(err, result) {
		res.json(result);
	});
}

exports.getAllCampsPlaDocentAssignatura = function(req, res) {
	//http://localhost:3333/ws/getAllCampsPlaDocentAssignatura?anyAcademic=20121&codAssignatura=M1.047&ambitCamp=A
	var args = {
		in0: req.query.anyAcademic,
		in1: req.query.codAssignatura,
		in2: req.query.ambitCamp
	};
	service.operation(config.dadesacademiqueswsdl(), 'getAllCampsPlaDocentAssignatura', args, function(err, result) {
		res.json(result);
	});
}

exports.getAllAnysAcademics = function(req, res) {
	//http://localhost:3333/ws/getAllAnysAcademics
	service.operation(config.dadesacademiqueswsdl(), 'getAllAnysAcademics', {}, function(err, result) {
		res.json(result);
	});
}