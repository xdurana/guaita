var config = require('../config');
var service = require('./service');

/**
 * [getIdpBySession description]
 * @param  {[type]}   s        [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getIdpBySession = function(s, callback) {
    var url = config.util.format('%s/webapps/campusGateway/sessions/%s.xml',
        config.cv(),
        s
    );
    service.xml(url, function(err, object) {
        if (err) { console.log(err); callback(); return; }
        return object.session.authenticated[0] === 'true' ?
        callback(null, object.session.userNumber[0]) :
        callback(config.util.format("(campusGateway) No s'ha pogut comprovar la sessió [%s]", url));
    });
}