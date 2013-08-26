var request = require('request');

exports.one = function(domainId, forumId, callback) {

    request({
      url: "http://cv-test.uoc.edu/app/phpBB3/service.php?domainId=" + domainId + "&forumId=" + forumId + "&type=SEGUIMENT",
      method: "GET"
    }, function (error, response, body) {
        if (error) { console.log(err); callback(err); return; }
        var object = JSON.parse(body);
        callback(null, object);
    });
}