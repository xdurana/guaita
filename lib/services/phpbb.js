var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Indicadors d'un forum PHPBB
 * @param domainId
 * @param forumId
 * @param next
 */
exports.one = function(domainId, forumId, next) {
    var url = config.util.format('%s/service.php?domainId=%s&forumId=%s&type=SEGUIMENT',
        config.phpbb(),
        domainId,
        forumId
    );
    service.json(url, function(err, result) {
        next(err, result);
    });
};

/**
 * Missatges totals d'un forum PHPBB
 * @param domainId
 * @param forumId
 * @param next
 */
exports.total = function(domainId, forumId, next) {
    var url = config.util.format('%s/totales.php?domainId=%s&userId=-1&forumId=%s',
        config.phpbb(),
        domainId,
        forumId
    );
    service.json(url, function(err, result) {
        next(err, result);
    });
};

/**
 * Missatges pendents de llegir d'un forum PHPBB
 * @param domainId
 * @param forumId
 * @param idp
 * @param next
 */
exports.alert = function(domainId, forumId, idp, next) {
    var url = config.util.format('%s/totales.php?domainId=%s&userId=%s&forumId=%s',
        config.phpbb(),
        domainId,
        idp,
        forumId
    );
    service.json(url, function(err, result) {
        next(err, result);
    });
};