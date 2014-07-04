var soap = require('soap');
var config = require(__base + '/config');

/**
 * Crida a un WS SOAP
 * @param url
 * @param service
 * @param args
 * @param next
 * @returns {*}
 */
exports.operation = function(url, service, args, next) {
    if (config.useCache()) {
        var cache = require('memory-cache');
        var key = JSON.stringify({
            url: url,
            service: service,
            args: args
        });
        var h = hash(key);
        var r = cache.get(h);
        if (r) {
            return next(null, r);
        }
    }
    soap.createClient(url, function(err, client) {
        if (err) return next(err);
        client[service](args, function(err, result) {
            if (config.useCache()) {
                cache.put(h, result);
            }
            return next(err, result);
        });
    });
};

/**
 * Hash d'una clau
 * @param key
 * @returns {*}
 */
var hash = function(key) {
    var crypto = require('crypto');
    return crypto.createHash('md5').update(key).digest('hex');
};

/**
 * Crida AJAX amb retorn JSON
 * @param url
 * @param next
 */
exports.json = function(url, next) {
    config.debug(url);
    config.request({
      url: url,
      timeout: 80*1000,
      method: "GET"
    }, function (err, response, body) {
        if (err) return next(err);
        try {
            body = JSON.parse(body);
        } catch(ex) {
        }
        return next(null, body);
    });
};

/**
 * Crida AJAX amb retorn XML
 * @param url
 * @param next
 */
exports.xml = function(url, next) {
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser;
    config.debug(url);
    config.request({
      url: url,
      timeout: 80*1000,
      method: "GET"
    }, function (err, response, xml) {
        if (err) return next(err);
        parser.parseString(xml, function (err, object) {
            if (err) return next(err);
            return next(null, object);
        });
    });
};

/**
 * Post
 * @param url
 * @param data
 * @param next
 */
exports.post = function(url, data, next) {
    config.request({
        url: url,
        method: "POST",
        json: data
    }, function (err, response, body) {
        if (err) return next(err);
        try {
            body = JSON.parse(body);
        } catch (ex) {
        }
        config.debug(url);
        return next(null, body);
    });
};