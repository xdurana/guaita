var soap = require('soap');

exports.operation = function(url, service, args, callback) {
	soap.createClient(url, function(err, client) {
	  client[service](args, function(err, result) {
	  	return callback(err, result);
	  });
	});
}