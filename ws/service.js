var soap = require('soap');
var request = require('request');
var util = require('util');

var config = require('../config');

exports.operation = function(url, service, args, callback) {
    soap.createClient(url, function(err, client) {
        client[service](args, function(err, result) {
            return callback(err, result);
        });
    });
}

exports.json = function(url, callback) {
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        //config.debug(url);
        if (err) { console.log(err); return callback(err); }
        try {
            var body = JSON.parse(body);
        } catch(e) {
        }
        return callback(null, body);
    });
}