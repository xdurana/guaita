var soap = require('soap');
var request = require('request');
var util = require('util');

var config = require('../config');

exports.operation = function(url, service, args, callback) {
    soap.createClient(url, function(err, client) {
        if (err) { console.log(err); return callback(err); }
        client[service](args, function(err, result) {
            return callback(err, result);
        });
    });
}

exports.json = function(url, callback) {
    try {
        config.debug(url);
        request({
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
        var err = util.format('Error en la crida [%s]', url);
        console.log(err); return callback(err);
    }
}