var soap = require('soap');
var request = require('request');
var util = require('util');
var xml2js = require('xml2js');

var config = require('../config');
var parser = new xml2js.Parser();

exports.operation = function(url, service, args, callback) {
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

exports.json = function(url, callback) {
    try {
        config.debug({
            url: url
        });
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

exports.xml = function(url, callback) {
    try {
        config.debug({
            url: url
        });
        request({
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
        config.debug({
            url: url,
            data: data
        });
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