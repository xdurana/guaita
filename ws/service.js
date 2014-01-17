var config = require('../config');

/**
 * SOAP
 * @param  {[type]}   url
 * @param  {[type]}   service
 * @param  {[type]}   args
 * @param  {Function} callback
 * @return {[type]}
 */
var operation = exports.operation = function(url, service, args, callback) {
    var soap = require('soap');
    config.debug({
        url: url,
        service: service,
        data: args
    });
    soap.createClient(url, function(err, client) {
        if (err) { console.log(err); return callback(err); }
        client[service](args, function(err, result) {
            return callback(err, result);
        });
    });
}

/**
 * HTTP GET JSON
 * @param  {[type]}   url
 * @param  {Function} callback
 * @return {[type]}
 */
var json = exports.json = function(url, callback) {
    try {
        config.debug({
            url: url
        });
        config.request({
          url: url,
          method: "GET"
        }, function (err, response, body) {
            if (err) { console.log(err); return callback(err); }
            try {
                var object = JSON.parse(body);
                return callback(null, object);
            } catch (e) {
                return callback(null, body);
            }
        });
    } catch (e) {
        var err = config.util.format('Error en la crida [%s]', url);
        console.log(err); return callback(err);
    }
}

/**
 * HTTP GET XML
 * @param  {[type]}   url
 * @param  {Function} callback
 * @return {[type]}
 */
var xml = exports.xml = function(url, callback) {
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser;
    try {
        config.debug({
            url: url
        });
        config.request({
          url: url,
          method: "GET"
        }, function (err, response, xml) {
            if (err) { console.log(err); return callback(err); }
            parser.parseString(xml, function (err, object) {
                if (err) { console.log(err); return callback(err); }
                return callback(null, object);
            });
        });
    } catch (e) {
        var err = config.util.format('Error en la crida [%s]', url);
        console.log(err); return callback(err);
    }
}

/**
 * HTTP POST
 * @param  {[type]}   url
 * @param  {[type]}   data
 * @param  {Function} callback
 * @return {[type]}
 */
var post = exports.post = function(url, data, callback) {
    try {
        config.debug({
            url: url,
            data: data
        });
        config.request({
          url: url,
          method: "POST",
          json: data
        }, function (err, response, body) {
            if (err) { console.log(err); return callback(err); }
            try {
                var object = JSON.parse(body);
                return callback(null, object);
            } catch (e) {
                return callback(null, body);
            }
        });
    } catch (e) {
        var err = config.util.format('Error en la crida [%s]', url);
        console.log(err); return callback(err);
    }
}