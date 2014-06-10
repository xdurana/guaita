var config = require(__base + '/config');

/**
 * SOAP
 * @param  {[type]}   url
 * @param  {[type]}   service
 * @param  {[type]}   args
 * @param  {Function} next
 * @return {[type]}
 */
var operation = exports.operation = function(url, service, args, next) {

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

    var soap = require('soap');
    soap.createClient(url, function(err, client) {
        if (err) return next(err);
        client[service](args, function(err, result) {

            if (config.useCache()) {
                cache.put(h, result);
            }
            
            return next(err, result);
        });
    });
}

/**
 * [hash description]
 * @param  {[type]} object [description]
 * @return {[type]}        [description]
 */
var hash = function(key) {
    var crypto = require('crypto');
    return crypto.createHash('md5').update(key).digest('hex');
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
}

/**
 * HTTP GET JSON
 * @param  {[type]}   url
 * @param  {Function} next
 * @return {[type]}
 */
var json2 = exports.json2 = function(url, next) {
    config.debug(url);
    config.request({
        url: url,
        method: "GET",
        headers: {  
            'Content-Type': 'application/json; charset=iso-8859-1'
        }
    }, function (err, response, body) {
        if (err) return next(err);
        try {
            config.debug(response);
            body = JSON.parse(body);
        } catch(ex) {
        }
        return next(null, body);
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
    var inici = new Date();
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
        //config.debug(data);
        //config.debug(new Date() - inici);
        return next(null, body);
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
      timeout: 80*1000,
      method: "GET"
    }, function (err, response, xml) {
        if (err) return next(err);
        parser.parseString(xml, function (err, object) {
            if (err) return next(err);
            return next(null, object);
        });
    });
}