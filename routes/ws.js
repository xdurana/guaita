var soap = require('soap');

exports.getAssignaturaByCodi = function(req, res) {
	var url = 'http://sa.uoc.es/infoacademica-ws/services/InfoacademicaService?WSDL';
	soap.createClient(url, function(err, client) {
	  client.getAssignaturaByCodi({codAssignatura: req.query.codAssignatura}, function(err, result) {
	    res.json(result);
	  });
	});
}

exports.getUserRoles = function(req, res) {
	
	var url = 'http://sa.uoc.es/remoteinterface/services/AuthService?WSDL';
	var args = {
		in0: req.query.idp,
		in1: null
	};

	soap.createClient(url, function(err, client) {
	  client.getUserRoles(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}

exports.isUserAuthenticated = function(req, res) {
	
	var url = 'http://sa.uoc.es/remoteinterface/services/AuthService?WSDL';
	var args = {in0: req.query.s};

	soap.createClient(url, function(err, client) {
	  client.isUserAuthenticated(args, function(err, result) {
	  	console.log(err);	  	
	    res.json(result.out);
	  });
	});
}