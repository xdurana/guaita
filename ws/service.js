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

exports.count = function(data, callback) {
    post(util.format('%s/guaita/count', config.lrs()), data, function (err, data) {
        callback(null, data);
    });
}

exports.last = function(data, callback) {
    post(util.format('%s/guaita/all/1', config.lrs()), data, function (err, data) {
        callback(null, data);
    });
}

var post = function(url, data, callback) {
    try {
        config.debug(url);
        config.debug(data);
        request({
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
        var err = util.format('Error en la crida [%s]', url);
        console.log(err); return callback(err);
    }
}