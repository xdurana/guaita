var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.one = function(domainId, forumId, callback) {

    var url = util.format('%s/service.php?domainId=%s&forumId=%s&type=SEGUIMENT',
        config.phpbb(),
        domainId,
        forumId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); callback(err); return; }
        callback(err, result);
    });
}

exports.total = function(domainId, forumId, callback) {

    var url = util.format('%s/totales.php?domainId=%s&userId=-1&forumId=%s',
        config.phpbb(),
        domainId,
        forumId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); callback(err); return; }
        callback(err, result);
    });
}

exports.alert = function(domainId, forumId, idp, callback) {

    var url = util.format('%s/totales.php?domainId=%s&userId=%s&forumId=%s',
        config.phpbb(),
        domainId,
        idp,
        forumId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); callback(err); return; }
        callback(err, result);
    });
}
