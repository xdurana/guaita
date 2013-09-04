var config = require('../config');
var request = require('request');

exports.getClicksByIdp = function(idp, s, callback) {

    var url = config.lrs() + "xapi/statements/filter/idp/" + idp;
    request({
      url: url,
      method: "GET"
    }, function (err, response, body) {
        if (err) { console.log(err); callback(err); return; }
        if (response.statusCode != '200') {
            callback(url);
        }
        var object = JSON.parse(body);
        callback(null, object);
    });
}