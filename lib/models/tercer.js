module.exports = function(config) {

    var describe = function (tercer) {

        var o = {
            dni: config.indicadors.getValor(tercer.dni),
            idp: config.indicadors.getValor(tercer.idp),
            nom: config.indicadors.getValor(tercer.nom),
            primerCognom: config.indicadors.getValor(tercer.primerCognom),
            segonCognom: config.indicadors.getValor(tercer.segonCognom),
            tercerCognom: config.indicadors.getValor(tercer.tercerCognom),
            userIdCampus: config.indicadors.getValor(tercer.userIdCampus),
            userLogin: config.indicadors.getValor(tercer.userLogin),
            userPhotoFile: config.indicadors.getValor(tercer.userPhotoFile),
        };

        o.nomComplert = tercer.nomComplert ? config.indicadors.getValor(tercer.nomComplert) : getNomComplert(o.nom, o.primerCognom, o.segonCognom, o.tercerCognom);

        return o;
    };

   /**
     * Nom complert d'un tercer
     * @param nom
     * @param primerCognom
     * @param segonCognom
     * @param tercerCognom
     * @returns {*|string}
     */
    var getNomComplert = function (nom, primerCognom, segonCognom, tercerCognom) {
        return config.util.format('%s %s', nom, primerCognom, (typeof config.indicadors.getValor(segonCognom) == 'string' ? segonCognom : ""), (typeof config.indicadors.getValor(tercerCognom) == 'string' ? tercerCognom : "")).trim();
    };

    /**
     * Fitxa d'usuari d'un tercer
     * @param idp
     * @param idp_tercer
     * @param s
     * @param next
     */
    var getFitxa = function (idp_tercer, idp, s, next) {
        config.services.aulaca.getUserIdPerIdp(idp_tercer, s, function (err, userid) {
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
    var getFitxaUserId = function (userid, idp, s, next) {
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
    var getResumActivitatAula = function (idp, classroomId, s, next) {

        var resum = config.indicadors.getObjectComunicacio();

        config.async.parallel([
            function (next) {
                config.services.lrs.byidpandclassroom(idp, classroomId, s, function (err, result) {
                    if (err) return next(err);
                    resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return next();
                });
            },
            function (next) {
                config.services.lrs.byidpandclassroomlast(idp, classroomId, s, function (err, result) {
                    if (err) return next(err);
                    resum.comunicacio.ultimaConnexio = config.indicadors.getUltimaConnexio(result);
                    return next();
                });
            },
            function (next) {
                config.services.aulaca.getUltimaConnexioCampus(idp, s, function (err, result) {
                    if (err) return next(err);
                    resum.comunicacio.ultimaConnexioCampus = config.indicadors.formatDate(result);
                    return next();
                });
            },
            function (next) {
                config.services.lrs.byidpandclassroomfromwidgetlast(idp, classroomId, s, function (err, result) {
                    if (err) return next(err);
                    resum.comunicacio.ultimaConnexioWidget = config.indicadors.getUltimaConnexio(result);
                    return next();
                });
            }
        ], function (err) {
            return next(err, resum);
        });
    };

    return {
        describe: describe,
        getFitxa: getFitxa
    }
};