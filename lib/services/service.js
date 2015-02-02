var soap = require('soap');
var config = require(__base + '/config');
var iconv = require('iconv');

var http = require('http');
http.globalAgent.maxSockets = 100;
var request = require('request');
//var agent = new http.Agent();
//agent.maxSockets = 15;
var agent = http.globalAgent;

var sockets = {
    inUse: function(agent) {
        var httpPool = 0;
        var socketList = agent.sockets;
        for (var socket in socketList) {
            if (socketList.hasOwnProperty(socket)) {
                httpPool += socketList[socket].length;
            }
        }

        return httpPool;
    }
};

var gethttp = function(url, next) {
    config.debug(url);
    var req = http.request(url, function(res) {

        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function(data) {
            responseString += data;
        });

        res.on('end', function() {
            next(null, res, responseString);
        });
    });

    console.log(sockets.inUse(http.globalAgent));
    req.end();
};

var get = function(url, next) {
    config.debug(url);
    var options = {
        method: 'GET',
        pool: agent
    };
    options.url = url;
    request(options, function (err, response, body) {
        return next(err, response, body);
    });
};

/**
 * Crida a un WS SOAP
 * @param url
 * @param service
 * @param args
 * @param next
 * @returns {*}
 */
exports.operation = function(url, service, args, next) {
    soap.createClient(url, function(err, client) {
        if (err) return next(err);
        client[service](args, function(err, result) {
            return next(err, result);
        });
    });
};

/**
 * Crida AJAX amb retorn JSON
 * @param url
 * @param next
 */
exports.json = function(url, next) {
    gethttp(url, function (err, response, body) {
        if (err) return next(err);
        body = JSON.parse(body);
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
    gethttp(url, function (err, response, xml) {
        if (err) return next(err);
        parser.parseString(xml, function (err, object) {
            if (err) return next(err);
            return next(null, object);
        });
    });
};

/**
 * Crida AJAX amb retorn JSON
 * @param url
 * @param next
 */
exports.jsonLatin1 = function(url, next) {
    config.debug(url);
    request({
        url: url,
        timeout: 80*1000,
        method: "GET",
        encoding: null
    }, function (err, response, body) {
        if (err) return next(err);
        try {
            var ic = new iconv.Iconv('iso-8859-1', 'utf-8');
            var buf = ic.convert(body);
            var buffer = buf.toString('utf-8');
            body = JSON.parse(buffer);
        } catch(ex) {
        }
        return next(null, body);
    });
};

/**
 * Post
 * @param url
 * @param data
 * @param next
 */
exports.post = function(url, data, next) {
    request({
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