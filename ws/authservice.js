var config = require('../config');
var service = require('./service');

exports.getContextBySessionId = function(req, res) {
	//http://localhost:3333/ws/getContextBySessionId?in0=<session>
	var args = {
		in0: req.query.in0	//ID de la sessió
	};
	service.operation(config.authwsdl(), 'getContextBySessionId', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.isUserAuthenticated = function(req, res) {
	//http://localhost:3333/ws/isUserAuthenticated?in0=<session>
	var args = {
		in0: req.query.in0	//ID de la sessió
	};
	service.operation(config.authwsdl(), 'isUserAuthenticated', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}

exports.getUserRoles = function(req, res) {
	//http://localhost:3333/ws/getUserRoles?in0=224475&in1=
	var args = {
		in0: req.query.in0,	//IDP de l'usuari a consultar
		in1: req.query.in1	//Identificador de l'aplicació per la qual es vol saber els rols d'entrada
	};
	service.operation(config.authwsdl(), 'getUserRoles', args, function(err, result) {
		if (err) return callback(err);
		res.json(result);
	});
}