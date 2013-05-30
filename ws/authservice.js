var soap = require('soap');
var url = 'http://sa.uoc.es/remoteinterface/services/AuthService?WSDL';

//http://cv.uoc.edu/~grc_8842_w01/ws/html/wsdl/AuthService.xml

exports.getContextBySessionId = function(req, res) {

	//http://localhost:3000/ws/getContextBySessionId?in0=<session>

	var args = {
		in0: req.query.in0	//ID de la sessió
	};
	soap.createClient(url, function(err, client) {
	  client.getContextBySessionId(args, function(err, result) {
	  	console.log(err);	  	
	    res.json(result);
	  });
	});
}

exports.isUserAuthenticated = function(req, res) {

	//http://localhost:3000/ws/isUserAuthenticated?in0=<session>

	var args = {
		in0: req.query.in0	//ID de la sessió
	};
	soap.createClient(url, function(err, client) {
	  client.isUserAuthenticated(args, function(err, result) {
	  	console.log(err);	  	
	    res.json(result);
	  });
	});
}

exports.getUserRoles = function(req, res) {


	
	var args = {
		in0: req.query.in0,	//IDP de l'usuari a consultar
		in1: req.query.in1	//Identificador de l'aplicació per la qual es vol saber els rols d'entrada
	};
	soap.createClient(url, function(err, client) {
	  client.getUserRoles(args, function(err, result) {
	  	console.log(err);
	    res.json(result);
	  });
	});
}