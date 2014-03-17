var config = require('../config');
var ws = require('../ws');

/**
 * [getFitxa description]
 * @param  {[type]}   useridp  [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next [description]
 * @return {[type]}            [description]
 */
var getFitxa = exports.getFitxa = function(useridp, idp, s, next) {
    ws.aulaca.getUserIdPerIdp(useridp, s, function(err, userid) {
        return next(
            err,
            config.util.format(
                '%s/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=%s&appId=UOC&idLang=a&s=%s&l=a&id_usuario_conectado=%s',
                config.cv(),
                userid,
                s,
                idp
            )
        );
    });
}

/**
 * [getFitxaUserId description]
 * @param  {[type]}   userid   [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} next [description]
 * @return {[type]}            [description]
 */
var getFitxaUserId = exports.getFitxaUserId = function(userid, idp, s, next) {
    return next(null,
        config.util.format(
            '%s/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=%s&appId=UOC&idLang=a&s=%s&l=a&id_usuario_conectado=%s',
            config.cv(),
            userid,
            s,
            idp
        )
    );
}