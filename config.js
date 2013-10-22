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

exports.cv = function() {
    return nconf.get('wsdl:cv');
}

exports.phpbb = function() {
    return nconf.get('wsdl:phpbb');
}

exports.nc = function() {
    return "N/D";
}

exports.debug = function(msg) {
    if (nconf.get('entorn') != 'PRO') {
        console.log(msg);
    }
}

exports.base = function() {
    return '/app/guaita';
}

exports.idpadmin = function() {
    return '30000020';
}