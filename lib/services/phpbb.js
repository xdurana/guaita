var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * [one description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   forumId  [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var one = exports.one = function(domainId, forumId, next) {
    var url = config.util.format('%s/service.php?domainId=%s&forumId=%s&type=SEGUIMENT',
        config.phpbb(),
        domainId,
        forumId
    );
    service.json(url, function(err, result) {
        next(err, result);
    });
}

/**
 * [total description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   forumId  [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var total = exports.total = function(domainId, forumId, next) {
    var url = config.util.format('%s/totales.php?domainId=%s&userId=-1&forumId=%s',
        config.phpbb(),
        domainId,
        forumId
    );
    service.json(url, function(err, result) {
        next(err, result);
    });
}

/**
 * [alert description]
 * @param  {[type]}   domainId [description]
 * @param  {[type]}   forumId  [description]
 * @param  {[type]}   idp      [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
var alert = exports.alert = function(domainId, forumId, idp, next) {
    var url = config.util.format('%s/totales.php?domainId=%s&userId=%s&forumId=%s',
        config.phpbb(),
        domainId,
        idp,
        forumId
    );
    service.json(url, function(err, result) {
        next(err, result);
    });
}
