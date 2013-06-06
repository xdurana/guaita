var config = require('../config');
var service = require('./service');

exports.getAssignaturaByCodi = function(req, res) {
	//http://localhost:3333/ws/getAssignaturaByCodi?codAssignatura=10.002&idioma=ca
	var args = {
		in0: req.query.codAssignatura,
		in1: req.query.idioma
	};
	service.operation(config.infoacademicawsdl(), 'getAssignaturaByCodi', args, function(err, result) {
    res.json(result);
	});
}

exports.getAssignatures = function(req, res) {
	//http://localhost:3333/ws/getAssignatures?idioma=ca
	var args = {
		in0: req.query.idioma
	};
	service.operation(config.infoacademicawsdl(), 'getAssignatures', args, function(err, result) {
		res.json(result);
	});
}

exports.getAulesByAssignatura = function(req, res) {
	//http://localhost:3333/ws/getAulesByAssignatura?codAssignatura=M1.047&anyAcademic=20121
	var args = {
		in0: req.query.codAssignatura,
		in1: req.query.anyAcademic
	};	
	service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
		res.json(result);
	});
}

exports.getAulaById = function(req, res) {
	//http://localhost:3333/ws/getAulaById?aula=1&codAssignatura=M1.047&anyAcacemic=20121
	var args = {
		in0: req.query.aula,
		in1: req.query.codAssignatura,
		in2: req.query.anyAcacemic
	};	
	service.operation(config.infoacademicawsdl(), 'getAulaById', args, function(err, result) {
		res.json(result);
	});
}

exports.getAulesByConsultor = function(req, res) {
	//http://localhost:3333/ws/getAulesByConsultor?idp=224475&anyAcademic=20121
	var args = {
		in0: req.query.idp,
		in1: req.query.anyAcademic
	};	
	service.operation(config.infoacademicawsdl(), 'getAulesByConsultor', args, function(err, result) {
		res.json(result);
	});
}

exports.getPrasByAssignaturaAny = function(req, res) {
	//http://localhost:3333/ws/getPrasByAssignaturaAny?codAssignatura=M1.047&anyAcademic=20121
	var args = {
		in0: req.query.codAssignatura,
		in1: req.query.anyAcademic
	};	
	service.operation(config.infoacademicawsdl(), 'getPrasByAssignaturaAny', args, function(err, result) {
		res.json(result);
	});
}