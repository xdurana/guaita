var async = require('async');
var config = require(__base + '/config');
var indicadors = require(__base + '/lib/routes/indicadors');
var ws = require(__base + '/lib/services/ws');

/**
 * Constructor
 * @param tercer
 * @constructor
 */
function Tercer(tercer) {

    this.dni = indicadors.getValor(tercer.dni);
    this.idp = indicadors.getValor(tercer.idp);
    this.nom = indicadors.getValor(tercer.nom);
    this.primerCognom = indicadors.getValor(tercer.primerCognom);
    this.segonCognom = indicadors.getValor(tercer.segonCognom);
    this.tercerCognom = indicadors.getValor(tercer.tercerCognom);
    this.userIdCampus = indicadors.getValor(tercer.userIdCampus);
    this.userLogin = indicadors.getValor(tercer.userLogin);
    this.userPhotoFile = indicadors.getValor(tercer.userPhotoFile);
    this.nomComplert = tercer.nomComplert ? indicadors.getValor(tercer.nomComplert) : this.getNomComplert(this.nom, this.primerCognom, this.segonCognom, this.tercerCognom);
}

/**
 * Nom complert d'un tercer
 * @param nom
 * @param primerCognom
 * @param segonCognom
 * @param tercerCognom
 * @returns {*|string}
 */
Tercer.prototype.getNomComplert = function(nom, primerCognom, segonCognom, tercerCognom) {
    return config.util.format('%s %s', nom, primerCognom, (typeof indicadors.getValor(segonCognom) == 'string' ? segonCognom : ""), (typeof indicadors.getValor(tercerCognom) == 'string' ? tercerCognom : "")).trim();
};

/**
 * Fitxa d'usuari d'un tercer
 * @param idp
 * @param s
 * @param next
 */
Tercer.prototype.getFitxa = function(idp, s, next) {
    ws.aulaca.getUserIdPerIdp(this.idp, s, function(err, userid) {
        if (err) return next(null, '#');
        return next(err, config.util.format(
            '%s/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=%s&appId=UOC&idLang=a&s=%s&l=a&id_usuario_conectado=%s',
            config.cv(),
            userid,
            s,
            idp
        ));
    });
};

/**
 * Fitxa d'usuari d'un tercer donat un userid
 * @param userid
 * @param idp
 * @param s
 * @param next
 * @returns {*}
 */
Tercer.prototype.getFitxaUserId = function(userid, idp, s, next) {
    return next(null, config.util.format(
        '%s/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=%s&appId=UOC&idLang=a&s=%s&l=a&id_usuario_conectado=%s',
        config.cv(),
        userid,
        s,
        idp
    ));
};

/**
 * Resum de l'activitat de l'aula d'un tercer
 * @param idp
 * @param classroomId
 * @param s
 * @param next
 */
Tercer.prototype.getResumActivitatAula = function(idp, classroomId, s, next) {

    var resum = indicadors.getObjectComunicacio();

    async.parallel([
        function(next) {
            ws.lrs.byidpandclassroom(idp, classroomId, s, function(err, result) {
                if (err) return next(err);
                resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return next();
            });
        },
        function(next) {
            ws.lrs.byidpandclassroomlast(idp, classroomId, s, function(err, result) {
                if (err) return next(err);
                resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                return next();
            });
        },
        function(next) {
            ws.aulaca.getUltimaConnexioCampus(idp, s, function(err, result) {
                if (err) return next(err);
                resum.comunicacio.ultimaConnexioCampus = indicadors.formatDate(result);
                return next();
            });
        },
        function(next) {
            ws.lrs.byidpandclassroomfromwidgetlast(idp, classroomId, s, function(err, result) {
                if (err) return next(err);
                resum.comunicacio.ultimaConnexioWidget = indicadors.getUltimaConnexio(result);
                return next();
            });
        }
    ], function(err) {
        return next(err, resum);
    });
};

module.exports = Tercer;