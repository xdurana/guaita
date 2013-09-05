var config = require('../config');
var service = require('./service');
var request = require('request');

exports.one = function(domainId, forumId, callback) {

    var url = util.format('%s/service.php?domainId=%s&forumId=%s&type=SEGUIMENT',
        config.phpbb(),
        domainId,
        forumId
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); callback(err); return; }
        callback(result);
    });
}