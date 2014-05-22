var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * [getHTML5Format description]
 * @param  {[type]}   idp       [description]
 * @param  {[type]}   login     [description]
 * @param  {[type]}   role      [description]
 * @param  {[type]}   subject   [description]
 * @param  {[type]}   language  [description]
 * @param  {[type]}   classroom [description]
 * @param  {[type]}   pid       [description]
 * @param  {Function} next      [description]
 * @return {[type]}             [description]
 */
var getHTML5Format = exports.getHTML5Format = function(idp, login, role, subject, classroom, pid, language, next) {
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
}

/**
 * [getCrypt description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   login    [description]
 * @param  {[type]}   role     [description]
 * @param  {[type]}   subject  [description]
 * @param  {[type]}   language [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
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
}