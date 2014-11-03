module.exports = function(app, config) {

    var assignatures = require(__base + '/lib/models/subject')(config);

    /**
     * Llista d'assignatures d'un usuari
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures', config.user.authorize, function (req, res, next) {

        var idp = req.query.idp;
        var perfil = req.query.perfil;
        var s = req.query.s;
        var format = req.query.format;

        if (perfil == null) return next("Manca el parametre [perfil] a la crida");
        if (idp == null) return next("Manca el parametre [idp] a la crida");

        if (perfil == 'estudiant') {
            return res.redirect(config.util.format('/app/guaita/calendari/?idp=%s&perfil=estudiant&s=%s', idp, s));
        }
        return assignatures.byidp(s, idp, perfil, function (err, result) {
            if (err) return next(err);
            if (format) {
                res.json(result);
            } else {
                result.s = s;
                result.idp = idp;
                if (perfil == 'pra') {
                    result.retorn = config.util.format(
                        '%s/webapps/classroom/081_common/jsp/aulespra.jsp?s=%s',
                        config.cv(),
                        s
                    );
                    res.render('pra.html', { object: result });
                } else {
                    result.retorn = config.util.format(
                        '%s/UOC/a/cgi-bin/hola?s=%s&tmpl=p://cv.uoc.edu/%s/%s/ext_breakcam_0.htm?s=%s&ACCIO=B_AULES&t=docencia/responsable_aula.tmpl',
                        config.cv(),
                        s,
                        config.getAppActiva(),
                        config.getAppLang(),
                        s
                    );
                    res.render('consultor.html', { object: result });
                }
            }
        });
    });

    /**
     * Estadístiques d'accés d'una aula
     * Registre de l'activitat d'una eina
     * @param req
     * @param res
     * @param next
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode/estadistiques', config.user.admin, function(req, res, next) {
        var estadistiques = {
            s: req.query.s,
            anyAcademic: req.params.anyAcademic,
            codAssignatura: req.params.codAssignatura,
            domainId: req.params.domainId,
            codAula: req.params.codAula,
            classroomId: req.params.classroomId,
            domainCode: req.params.domainCode
        };

        if (req.query.idp) {
            estadistiques.idp = req.query.idp;
            config.async.parallel([
                function (next) {
                    config.services.lrs.byidpandclassroom(estadistiques.idp, estadistiques.classroomId, estadistiques.s, function (err, result) {
                        estadistiques.totals = result.value;
                        return next();
                    });
                },
                function (next) {
                    config.services.lrs.byidpandclassroomfromwidget(estadistiques.idp, estadistiques.classroomId, estadistiques.s, function (err, result) {
                        estadistiques.widget = result.value;
                        return next();
                    });
                }
            ], function (err, results) {
                return res.json(estadistiques);
            });
        } else {
            config.async.parallel([
                function (next) {
                    config.services.lrs.byclassroom(estadistiques.classroomId, estadistiques.s, function (err, result) {
                        estadistiques.totals = result.value;
                        return next();
                    });
                },
                function (next) {
                    config.services.lrs.byclassroomfromwidget(estadistiques.classroomId, estadistiques.s, function (err, result) {
                        estadistiques.widget = result.value;
                        return next();
                    });
                }
            ], function (err, results) {
                return res.json(estadistiques);
            });
        }
    });

    /**
     * Estadístiques de connexió d'una aula
     * @param req
     * @param res
     * @param next
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/estadistiques', config.user.admin, function(req, res, next) {
        config.services.lrs.bysubjectall(req.params.domainId, req.query.s, function (err, result) {
            if (err) return next(err);
            config.async.map(result.value, apply, function(err, statements) {
                if (err) return next(err);
                return req.query.format ? res.json(statements) : res.render('estadistiques.html', { estadistiques: statements });
            });
        });
    });

    /**
     * Registre de l'activitat a les aules
     * @param req
     * @param res
     * @param next
     */
    app.post('/app/guaita/bocamoll', config.user.bytool, function(req, res, next) {
        var event = req.body;
        config.services.lrs.registraEina(event, function(err, result) {
            return res.json(result);
        });
    });
};