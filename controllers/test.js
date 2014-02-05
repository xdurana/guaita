var config = require('../config');

/**
 * [pra description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var pra = exports.pra = function (req, res, next) {
    var idp = '282246';
    res.redirect(config.util.format('/app/guaita/assignatures/?idp=%s&perfil=pra&s=%s', idp, req.query.s));
}

/**
 * [consultor description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var consultor = exports.consultor = function (req, res, next) {
    var idp = '449732';
    res.redirect(config.util.format('/app/guaita/assignatures/?idp=%s&perfil=consultor&s=%s', idp, req.query.s));
}

/**
 * [estudiant description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var estudiant = exports.estudiant = function (req, res, next) {
    var idp = '674277';
    res.redirect(config.util.format('/app/guaita/assignatures?idp=%s&perfil=estudiant&s=%s', idp, req.query.s));
}

/**
 * [widget description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var widget = exports.widget = function (req, res, next) {
    var idp = '755089';
    res.redirect(config.util.format('/app/guaita/assignatures/20131/06.510/415940/aules/1/419029/131_06_510_01/widget?idp=%s&s=%s', idp, req.query.s));
}

/**
 * [aula description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var aula = exports.aula = function (req, res, next) {
    var idp = '282246';    
    res.redirect(config.util.format('/app/guaita/assignatures/20131/06.510/415940/aules/1/419029/131_06_510_01?idp=%s&s=%s', idp, req.query.s));
}