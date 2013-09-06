var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.getClicksByIdp = function(idp, s, callback) {

    var url = util.format('%s/xapi/statements/filter/idp/%s',
        config.lrs(),
        idp
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(result);
    });
}

exports.getLastConnectionByIdp = function(idp, s, callback) {
    //TODO
    return callback();
}

exports.getClicksBySubject = function(domainId, s, callback) {

    var url = util.format('%s/xapi/statements/filter/subject/%s',
        config.lrs(),
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(result);
    });
}

exports.getClicksByClassroom = function(domainId, s, callback) {

    var url = util.format('%s/xapi/statements/filter/classroom/%s',
        config.lrs(),
        domainId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); return callback(err); }
        return callback(result);
    });
}