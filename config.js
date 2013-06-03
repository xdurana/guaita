var nconf = require('nconf');
nconf.argv().env().file({ file: 'config_' + process.env.NODE_ENV + '.json' });

exports.get = function(param) {
	return nconf.get(param);
}

exports.port = function() {
	return process.env.PORT || nconf.get('http:port') || 3000;
}

exports.dadesacademiqueswsdl = function() {
	return nconf.get('wsdl:dadesacademiques') || "http://esb.uoc.es/dades-academiques-ws/services/DadesAcademiquesService?WSDL";
}

exports.racwsdl = function() {
	return nconf.get('wsdl:rac') || "http://esb.uoc.es/rac-ws/services/RacService?WSDL";
}