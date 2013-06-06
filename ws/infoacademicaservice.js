var config = require('../config');
var service = require('./service');

exports.getAssignaturaByCodi = function(req, res) {
	//http://localhost:3333/ws/getAssignaturaByCodi?in0=10.002&in1=ca
	var args = {
		in0: req.query.in0, //Codi Assignatura "10.002"
		in1: req.query.in1	//Idioma "ca"
	};
	service.operation(config.infoacademicawsdl(), 'getAssignaturaByCodi', args, function(err, result) {
		if (err) return callback(err);
    res.json(result);
	});
}

exports.getAssignatures = function(req, res) {
	//http://localhost:3333/ws/getAssignatures?in0=ca
	var args = {
		in0: req.query.in0 //Idioma "ca"
	};
	service.operation(config.infoacademicawsdl(), 'getAssignatures', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.getAulesByAssignatura = function(req, res) {
	//http://localhost:3333/ws/getAulesByAssignatura?in0=M1.047&in1=20121
	var args = {
		in0: req.query.in0, //Codi Assignatura "M1.047"
		in1: req.query.in1	//Any acadèmic "20121"
	};	
	service.operation(config.infoacademicawsdl(), 'getAulesByAssignatura', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.getAulaById = function(req, res) {
	//http://localhost:3333/ws/getAulaById?in0=1&in1=M1.047&in2=20121
	var args = {
		in0: req.query.in0,	//Identificador de l'aula
		in1: req.query.in1, //Codi Assignatura "M1.047"
		in2: req.query.in2,	//Any acadèmic "20121"
	};	
	service.operation(config.infoacademicawsdl(), 'getAulaById', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.getAulesByConsultor = function(req, res) {
	//http://localhost:3333/ws/getAulesByConsultor?in0=224475&in1=20121
	var args = {
		in0: req.query.in0,	//IDP del consultor
		in1: req.query.in1 //Any acadèmic "20121"
	};	
	service.operation(config.infoacademicawsdl(), 'getAulesByConsultor', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.getPrasByAssignaturaAny = function(req, res) {
	//http://localhost:3333/ws/getPrasByAssignaturaAny?in0=M1.047&in1=20121
	var args = {
		in0: req.query.in0, //Codi Assignatura "M1.047"
		in1: req.query.in1	//Any acadèmic "20121"
	};	
	service.operation(config.infoacademicawsdl(), 'getPrasByAssignaturaAny', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}