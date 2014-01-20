var nconf = require('nconf');

var util = exports.util = require('util');
var i18next = exports.i18next = require('i18next');
var request = exports.request = require('request');

nconf.argv().env().file({ file: process.env.NODE_CONFIG });
i18next.init({
    lng: 'ca'
});

exports.get = function(param) {
	return nconf.get(param);
}

exports.port = function() {
	return process.env.PORT || 3000;
}

exports.expedientwsdl = function() {
	return nconf.get('wsdl:expedient');
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

/**
 * [debug description]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
var debug = exports.debug = function(msg) {
    if (nconf.get('entorn') != 'PRO') {
        console.log(msg);
    }
}

/**
 * [idpadmin description]
 * @return {[type]} [description]
 */
var idpadmin = exports.idpadmin = function() {
    return '30000020';
}

/**
 * [getAppLang description]
 * @return {[type]} [description]
 */
var getAppLang = exports.getAppLang = function() {
    return i18next.lng() == 'ca' ? 'a' : i18next.lng() == 'es' ? 'b' : 'c';
}

/**
 * [getAppActiva description]
 * @return {[type]} [description]
 */
var getAppActiva = exports.getAppActiva = function() {
    return 'UOC';
}