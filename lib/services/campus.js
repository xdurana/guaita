var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Usuari corresponent a una sessió determinada
 * @param s
 * @param next
 */
exports.getUserBySession = function(s, next) {
    var url = config.util.format('%s/webapps/campusGateway/sessions/%s.xml',
        config.cv(),
        s
    );
    service.xml(url, function(err, object) {
        if (err) return next(err);
        return object && object.session && object.session.authenticated && object.session.userNumber && object.session.authenticated[0] === 'true' ?
        next(null, {
            idp: object.session.userNumber[0],
            userid: object.session.userId[0]
        }) :
        next(config.util.format("(campusGateway) No s'ha pogut comprovar la sessió [%s]", url));
    });
};