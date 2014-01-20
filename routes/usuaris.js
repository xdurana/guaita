var config = require('../config');
var ws = require('../ws');

/**
 * [esDocent description]
 * @param  {[type]}   s        [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   domainId [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var esDocent = exports.esDocent = function(s, idp, domainId, callback) {
    var docent = false;
    ws.aulaca.getAssignaturesPerIdp(s, idp, function(err, result) {
        if (err) { console.log(err); return callback(null, false); }
        result.forEach(function(assignatura) {
            docent = docent || domainId == assignatura.domainId;
        });
        return callback(null, docent);
    });
}

/**
 * [getFitxa description]
 * @param  {[type]}   useridp  [description]
 * @param  {[type]}   idp      [description]
 * @param  {[type]}   s        [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var getFitxa = exports.getFitxa = function(useridp, idp, s, callback) {
    ws.aulaca.getUserIdPerIdp(useridp, s, function(err, userid) {
        if (err) {
            console.log(err);
            return callback(null, '#');
        } else {
            return callback(
                null,
                config.util.format(
                    '%s/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=%s&appId=UOC&idLang=a&s=%s&l=a&id_usuario_conectado=%s',
                    config.cv(),
                    userid,
                    s,
                    idp
                )
            );
        }
    });
}