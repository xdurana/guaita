var config = require('../config');

/**
 * SOAP
 * @param  {[type]}   url
 * @param  {[type]}   service
 * @param  {[type]}   args
 * @param  {Function} next
 * @return {[type]}
 */
var operation = exports.operation = function(url, service, args, next) {
    var soap = require('soap');
    config.debug(url + service);
    soap.createClient(url, function(err, client) {
        if (err) return next(err);
        client[service](args, function(err, result) {
            return next(err, result);
        });
    });
}

/**
 * HTTP GET JSON
 * @param  {[type]}   url
 * @param  {Function} next
 * @return {[type]}
 */
var json = exports.json = function(url, next) {
    config.debug(url);
    config.request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) return next(err);
        try {
            return next(null, JSON.parse(body));
        } catch (e) {
            return next(null, body);
        }
    });
}

/**
 * HTTP POST
 * @param  {[type]}   url
 * @param  {[type]}   data
 * @param  {Function} next
 * @return {[type]}
 */
var post = exports.post = function(url, data, next) {
    config.debug(url);
    config.request({
      url: url,
      method: "POST",
      json: data
    }, function (err, response, body) {
        if (err) return next(err);
        try {
            return next(null, JSON.parse(body));
        } catch (e) {
            return next(null, body);
        }
    });
}

/**
 * HTTP GET XML
 * @param  {[type]}   url
 * @param  {Function} next
 * @return {[type]}
 */
var xml = exports.xml = function(url, next) {
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser;
    config.debug(url);
    config.request({
      url: url,
      method: "GET"
    }, function (err, response, xml) {
        if (err) return next(err);
        parser.parseString(xml, function (err, object) {
            if (err) return next(err);
            return next(null, object);
        });
    });
}