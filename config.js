var nconf = require('nconf');
nconf.argv().env().file({ file: process.env.NODE_CONFIG });

exports.get = function(param) {
	return nconf.get(param);
}

exports.port = function() {
	return process.env.PORT || 3000;
}

exports.dadesacademiqueswsdl = function() {
	return nconf.get('wsdl:dadesacademiques') || "http://sa-test.uoc.es/dades-academiques-ws/services/DadesAcademiquesService?WSDL";
}

exports.infoacademicawsdl = function() {
	return nconf.get('wsdl:infoacademica') || "http://sa-test.uoc.es/infoacademica-ws/services/InfoacademicaService?WSDL";
}

exports.racwsdl = function() {
	return nconf.get('wsdl:rac') || "http://sa-test.uoc.es/rac-ws/services/RacService?WSDL";
}

exports.authwdsl = function() {
	return nconf.get('wsdl:auth') || "http://sa-test.uoc.es/remoteinterface/services/AuthService?WSDL";
}