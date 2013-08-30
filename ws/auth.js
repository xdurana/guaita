var config = require('../config');
var service = require('./service');

exports.getContextBySessionId = function(s, callback) {
  var args = {
    in0: s
  }
  service.operation(config.authwdsl(), 'getContextBySessionId', args, function(err, result) {
    if(err) { console.log(err); callback(err); return; }
    callback(null, result);
  });
}