var config = require('../config');
var service = require('./service');

exports.getContextBySessionId = function(req, res) {
	//http://localhost:3333/ws/getContextBySessionId?s=<session>
	var args = {
		in0: req.query.s
	};
	service.operation(config.authwsdl(), 'getContextBySessionId', args, function(err, result) {
		res.json(result);
	});
}

exports.isUserAuthenticated = function(req, res) {
	//http://localhost:3333/ws/isUserAuthenticated?s=<session>
	var args = {
		in0: req.query.s
	};
	service.operation(config.authwsdl(), 'isUserAuthenticated', args, function(err, result) {
		res.json(result);
	});
}

exports.getUserRoles = function(req, res) {
	//http://localhost:3333/ws/getUserRoles?idp=224475&appid=
	var args = {
		in0: req.query.idp,
		in1: req.query.appid
	};
	service.operation(config.authwsdl(), 'getUserRoles', args, function(err, result) {
		res.json(result);
	});
}