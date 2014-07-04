var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');
var async = require('async');

/**
 * Llista de materials d'una assignatura
 * @param s
 * @param codAssig
 * @param userId
 * @param next
 */
exports.listMaterialsAjax = function(s, codAssig, userId, next) {
    var url = config.util.format('%s/webapps/mymat/listMaterialsAjax.action?s=%s&idLang=ca&userId=%s&codAssig=%s',
        config.cv(),
        s,
        userId,
        codAssig
    );
    service.json2(url, function(err, object) {
        if (err) return next(err);
        return next(err, object);
    });
};