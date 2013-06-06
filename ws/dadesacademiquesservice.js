var config = require('../config');
var service = require('./service');

exports.getAssignaturesByResponsableAny = function(req, res) {
	//http://localhost:3333/ws/getAssignaturesByResponsableAny?in0=224475&in1=20121
	var args = {
		in0: req.query.in0, //IDP del PRA "224475"
		in1: req.query.in1	//Any acadèmic "20121"
	};
	service.operation(config.infoacademicawsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.getAllAssignaturesRelacionades = function(req, res) {
	//http://localhost:3333/ws/getAllAssignaturesRelacionades?in0=M1.047&in1=20121&in2=ca
	var args = {
		in0: req.query.in0, //Codi assignatura
		in1: req.query.in1,	//Any acadèmic "20121"
		in2: req.query.in2	//Idioma
	};
	service.operation(config.infoacademicawsdl(), 'getAllAssignaturesRelacionades', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.getAllCampsPlaDocentAssignatura = function(req, res) {
	//http://localhost:3333/ws/getAllCampsPlaDocentAssignatura?in0=20121&in1=M1.047&in2=A
	var args = {
		in0: req.query.in0,	//Any acadèmic "20121"
		in1: req.query.in1, //Codi assignatura
		in2: req.query.in2	//Àmbit camp
	};
	service.operation(config.infoacademicawsdl(), 'getAllCampsPlaDocentAssignatura', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}