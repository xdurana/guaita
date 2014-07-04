var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Obtenir enllaç a un material en format HTML5
 * @param idp
 * @param login
 * @param role
 * @param subject
 * @param classroom
 * @param pid
 * @param language
 * @param next
 */
exports.getHTML5Format = function(idp, login, role, subject, classroom, pid, language, next) {
    getCrypt(idp, login, role, subject, language, function (err, result) {
        if (result) return next(err,
            config.util.format('%s/%s/%s/%s/index.html',
                config.myway(),
                result[0].crypt,
                classroom,
                pid
            )
        );
        return next("No s'ha pogut obtenir l'enllaç del material");
    });
};

/**
 * Obtenir credencials per accedir a un material HTML5 amb accés a les anotacions
 * @param idp
 * @param login
 * @param role
 * @param subject
 * @param language
 * @param next
 */
var getCrypt = function(idp, login, role, subject, language, next) {
    var url = config.util.format('%s/%s/%s/%s/%s/%s/credentials',
        config.myway(),
        idp,
        login,
        role,
        subject,
        language
    );
    service.json(url, function(err, result) {
        next(err, result);
    });
};