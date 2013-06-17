var nconf = require('nconf');
nconf.argv().env().file({ file: 'config_' + process.env.NODE_ENV + '.json' });

exports.get = function(param) {
	return nconf.get(param);
}

exports.port = function() {
	return process.env.PORT || 3000;
}

exports.dadesacademiqueswsdl = function() {
	return nconf.get('wsdl:dadesacademiques') || "http://sa-pre.uoc.es/dades-academiques-ws/services/DadesAcademiquesService?WSDL";
}

exports.infoacademicawsdl = function() {
	return nconf.get('wsdl:infoacademica') || "http://sa-pre.uoc.es/infoacademica-ws/services/InfoacademicaService?WSDL";
}

exports.racwsdl = function() {
	return nconf.get('wsdl:rac') || "http://sa-pre.uoc.es/rac-ws/services/RacService?WSDL";
}

exports.authwdsl = function() {
	return nconf.get('wsdl:auth') || "http://sa-pre.uoc.es/remoteinterface/services/AuthService?WSDL";
}