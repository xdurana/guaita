var config = require('../config');
var request = require('request');

exports.getClicksByIdp = function(idp, s, callback) {
    callback();
    return;
    var url = config.lrs() + "xapi/statements/filter/idp/" + idp;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(null);
        }
        var object = JSON.parse(body);
        callback(null, object);
    });
}

exports.getLastConnectionByIdp = function(idp, s, callback) {
    //TODO
    callback();
    return;
    var url = config.lrs() + "xapi/statements/filter/idp/" + idp;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(null);
        }
        var object = JSON.parse(body);
        callback(null, object);
    });
}

exports.getClicksBySubject = function(domainId, s, callback) {
    callback();
    return;
    var url = config.lrs() + "xapi/statements/filter/subject/" + domainId;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(null);
        }
        var object = JSON.parse(body);
        callback(null, object);
    });
}

exports.getClicksByClassroom = function(domainId, s, callback) {
    callback();
    return;
    var url = config.lrs() + "xapi/statements/filter/classroom/" + domainId;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(null);
        }
        var object = JSON.parse(body);
        callback(null, object);
    });
}