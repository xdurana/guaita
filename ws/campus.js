var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.getIdpBySession = function(s, callback) {

    var url = util.format('%s/webapps/campusGateway/sessions/%s.xml',
        config.cv(),
        s
    );

    service.xml(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        try {
            return callback(null, object.session.userNumber[0]);
        } catch(e) {
            callback(util.format("(campusGateway) No s'ha pogut comprovar la sessió [%s]", url));
        }
    });
}