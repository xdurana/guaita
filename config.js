var nconf = require('nconf');
nconf.argv().env().file({ file: process.env.NODE_CONFIG });

exports.get = function(param) {
	return nconf.get(param);
}

exports.port = function() {
	return process.env.PORT || 3000;
}

exports.dadesacademiqueswsdl = function() {
	return nconf.get('wsdl:dadesacademiques') || "http://sa.uoc.es/dades-academiques-ws/services/DadesAcademiquesService?WSDL";
}

exports.infoacademicawsdl = function() {
	return nconf.get('wsdl:infoacademica') || "http://sa.uoc.es/infoacademica-ws/services/InfoacademicaService?WSDL";
}

exports.racwsdl = function() {
    return "http://sa.uoc.es/rac-ws/services/RacService?WSDL";
	//return nconf.get('wsdl:rac') || "http://sa.uoc.es/rac-ws/services/RacService?WSDL";
}

exports.authwdsl = function() {
	return nconf.get('wsdl:auth') || "http://sa.uoc.es/remoteinterface/services/AuthService?WSDL";
}

exports.aulaca = function() {
    return nconf.get('wsdl:aulaca') || "http://cv.uoc.edu/webapps/aulaca/classroom/";
}