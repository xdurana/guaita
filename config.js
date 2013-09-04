var nconf = require('nconf');
nconf.argv().env().file({ file: process.env.NODE_CONFIG });

exports.get = function(param) {
	return nconf.get(param);
}

exports.port = function() {
	return process.env.PORT || 3000;
}

exports.dadesacademiqueswsdl = function() {
	return nconf.get('wsdl:dadesacademiques');
}

exports.infoacademicawsdl = function() {
	return nconf.get('wsdl:infoacademica');
}

exports.racwsdl = function() {
	return nconf.get('wsdl:rac');
}

exports.authwdsl = function() {
	return nconf.get('wsdl:auth');
}

exports.aulaca = function() {
    return nconf.get('wsdl:aulaca');
}

exports.lrs = function() {
    return nconf.get('wsdl:lrs');
}