var moment = require('moment');
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

exports.nc = function() {
    return "N/D";
}

var expedientwsdl = exports.expedientwsdl = function() {
	return nconf.get('wsdl:expedient');
}

var dadesacademiqueswsdl = exports.dadesacademiqueswsdl = function() {
    return nconf.get('wsdl:dadesacademiques');
}

var infoacademicawsdl = exports.infoacademicawsdl = function() {
	return nconf.get('wsdl:infoacademica');
}

var racwsdl = exports.racwsdl = function() {
	return nconf.get('wsdl:rac');
}

var authwsdl = exports.authwdsl = function() {
	return nconf.get('wsdl:auth');
}

var aulaca = exports.aulaca = function() {
    return nconf.get('wsdl:aulaca');
}

var aulacas = exports.aulacas = function() {
    return nconf.get('wsdl:aulacas');
}

var lrs = exports.lrs = function() {
    return nconf.get('wsdl:lrs');
}

var cv = exports.cv = function() {
    return nconf.get('wsdl:cv');
}

var phpbb = exports.phpbb = function() {
    return nconf.get('wsdl:phpbb');
}

var myway = exports.myway = function() {
    return nconf.get('wsdl:myway');
}

/**
 * [debug description]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
var debug = exports.debug = function(msg) {
    if (nconf.get('entorn') != 'PRO') {
        console.log(util.format("%s: ", moment().format("YYYY/MM/DD HH:mm:ss"), msg));
    }
}

/**
 * [log description]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
var log = exports.log = function(msg) {    
    console.log(util.format("%s: ", moment().format("YYYY/MM/DD HH:mm:ss"), msg));
}

/**
 * [error description]
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
var error = exports.error = function(err) {
    console.log(util.format("%s: ", moment().format("YYYY/MM/DD HH:mm:ss"), err.stack));
}

/**
 * [idpadmin description]
 * @return {[type]} [description]
 */
var idpadmin = exports.idpadmin = function() {
    return '30000020';
}

/**
 * [lng description]
 * @return {[type]} [description]
 */
var lng = exports.lng = function() {
    return i18next.lng();
}

/**
 * [getAppLang description]
 * @return {[type]} [description]
 */
var getAppLang = exports.getAppLang = function() {
    return lng() == 'ca' ? 'a' : lng() == 'es' ? 'b' : 'c';
}

/**
 * [getAppActiva description]
 * @return {[type]} [description]
 */
var getAppActiva = exports.getAppActiva = function() {
    return 'UOC';
}