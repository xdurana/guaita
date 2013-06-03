var soap = require('soap');
var url = 'http://sa.uoc.es/infoacademica-ws/services/InfoacademicaService?WSDL';

//http://cv.uoc.edu/~grc_8842_w01/ws/html/wsdl/InfoacademicaService.xml

exports.getAssignaturaByCodiWS = function(req, res) {

	//http://localhost:3333/ws/getAssignaturaByCodi?in0=10.002&in1=ca

	var args = {
		in0: req.query.in0, //Codi Assignatura "10.002"
		in1: req.query.in1	//Idioma "ca"
	};	
	soap.createClient(url, function(err, client) {
	  client.getAssignaturaByCodi(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}

exports.getAssignaturesWS = function(req, res) {

	//http://localhost:3333/ws/getAssignatures?in0=ca

	var args = {
		in0: req.query.in0 //Idioma "ca"
	};	
	soap.createClient(url, function(err, client) {
	  client.getAssignatures(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}

exports.getAulesByAssignaturaWS = function(req, res) {

	//http://localhost:3333/ws/getAulesByAssignatura?in0=M1.047&in1=20121

	var args = {
		in0: req.query.in0, //Codi Assignatura "M1.047"
		in1: req.query.in1	//Any acadèmic "20121"
	};	
	soap.createClient(url, function(err, client) {
	  client.getAulesByAssignatura(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}

exports.getAulaByIdWS = function(req, res) {

	//http://localhost:3333/ws/getAulaById?in0=1&in1=M1.047&in2=20121

	var args = {
		in0: req.query.in0,	//Identificador de l'aula
		in1: req.query.in1, //Codi Assignatura "M1.047"
		in2: req.query.in2,	//Any acadèmic "20121"
	};	
	soap.createClient(url, function(err, client) {
	  client.getAulaById(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}

exports.getAulesByConsultorWS = function(req, res) {

	//http://localhost:3333/ws/getAulesByConsultor?in0=224475&in1=20121

	var args = {
		in0: req.query.in0,	//IDP del consultor
		in1: req.query.in1 //Any acadèmic "20121"
	};	
	soap.createClient(url, function(err, client) {
	  client.getAulesByConsultor(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}

exports.getPrasByAssignaturaAnyWS = function(req, res) {

	//http://localhost:3333/ws/getPrasByAssignaturaAny?in0=M1.047&in1=20121

	var args = {
		in0: req.query.in0, //Codi Assignatura "M1.047"
		in1: req.query.in1	//Any acadèmic "20121"
	};	
	soap.createClient(url, function(err, client) {
	  client.getPrasByAssignaturaAny(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}