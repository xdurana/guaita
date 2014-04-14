var config = require('../config');
var service = require('./service');
var async = require('async');

/**
 * [listMaterialsAjax description]
 * @param  {[type]}   s        [description]
 * @param  {[type]}   codAssig [description]
 * @param  {[type]}   userId   [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var listMaterialsAjax = exports.listMaterialsAjax = function(s, codAssig, userId, next) {
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
}