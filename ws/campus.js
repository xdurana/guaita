var config = require('../config');
var service = require('./service');

/**
 * [getIdpBySession description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next [description]
 * @return {[type]}            [description]
 */
exports.getIdpBySession = function(s, next) {
    var url = config.util.format('%s/webapps/campusGateway/sessions/%s.xml',
        config.cv(),
        s
    );
    service.xml(url, function(err, object) {
        if (err) return next(err);
        return object && object.session && object.session.authenticated && object.session.userNumber && object.session.authenticated[0] === 'true' ?
        next(null, object.session.userNumber[0]) :
        next(config.util.format("(campusGateway) No s'ha pogut comprovar la sessió [%s]", url));
    });
}