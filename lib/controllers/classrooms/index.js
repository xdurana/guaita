module.exports = function(app, config) {

    var aules = require(__base + '/lib/models/classroom')(config);
    var activitats = require(__base + '/lib/models/activity')(config);
    var estudiants = require(__base + '/lib/models/student')(config);
    var eines = require(__base + '/lib/models/tool')(config);
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
     * Aules per assignatura
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules', config.user.authorize, function(req, res, next) {
        if (req.query.perfil == null) return next("Manca el parametre [perfil] a la crida");
        return aules.all(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.query.idp, req.query.s, req.query.perfil, function (err, result) {
            if (err) return next(err);
            return req.query.format ? res.json(result) : res.render(req.query.perfil == 'pra' ? 'tabs_pra.html' : 'tabs_consultor.html', { assignatura: result });
        });
    });

    /**
     * Dades d'una aula
     * @param req
     * @param res
     * @param next
     * @returns {*|type[]}
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode', config.user.authorize, function (req, res, next) {
        if (!req.query.quick) return aules.one(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.query.idp,
            req.query.s,
            function (err, result) {
                if (err) {
                    return next("No s'ha pogut obtenir la informació de l'aula");
                }
                if (req.query.format) {
                    res.json(result);
                } else {
                    result.s = req.query.s;
                    res.render('aula.html', { aula: result });
                }
            });
    });

    /**
     * Eines de l'aula
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode/eines', config.user.authorize, function (req, res, next) {

        if (req.query.perfil) {
            return eines.aulaidp(
                req.params.anyAcademic,
                req.params.codAssignatura,
                req.params.domainId,
                req.params.codAula,
                req.params.classroomId,
                req.params.domainCode,
                req.query.idp,
                req.query.s,
                true,
                function (err, result) {
                    if (err) {
                        return next("No s'ha pogut obtenir la informació de les eines de l'aula");
                    }
                    if (req.query.format) {
                        res.json(result);
                    } else {
                        result.s = req.query.s;
                        res.render(req.query.perfil == 'consultor' ? 'eines-aula-estudiant.html' : 'eines-aula-consultor.html', { aula: result });
                    }
                });
        } else {
            return eines.aula(
                req.params.anyAcademic,
                req.params.codAssignatura,
                req.params.domainId,
                req.params.codAula,
                req.params.classroomId,
                req.params.domainCode,
                req.query.idp,
                req.query.s,
                function (err, result) {
                    if (err) {
                        return next("No s'ha pogut obtenir la informació de les eines de l'aula");
                    }
                    if (req.query.format) {
                        res.json(result);
                    } else {
                        result.s = req.query.s;
                        res.render('eines-estudiants.html', { aula: result });
                    }
                })
        }
    });

    /**
     * Activitats de l'aula
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode/activitats', config.user.authorize, function(req, res, next) {
        if (req.query.perfil) {
            return activitats.idp(
                req.params.anyAcademic,
                req.params.codAssignatura,
                req.params.domainId,
                req.params.codAula,
                req.params.classroomId,
                req.params.domainCode,
                req.query.idp,
                req.query.s,
                function (err, result) {
                    if (err) {
                        return next("No s'ha pogut obtenir la informació de les activitats de l'aula");
                    }
                    if (req.query.format) {
                        res.json(result);
                    } else {
                        result.s = req.query.s;
                        res.render(req.query.perfil == 'consultor' ? 'activitats-consultors.html' : 'activitats-aula.html', { aula: result });
                    }
                })
        } else {
            return activitats.aula(
                req.params.anyAcademic,
                req.params.codAssignatura,
                req.params.domainId,
                req.params.codAula,
                req.params.classroomId,
                req.params.domainCode,
                req.query.s,
                true,
                function (err, result) {
                    if (err) {
                        return next("No s'ha pogut obtenir la informació de les activitats de l'aula");
                    }
                    if (req.query.format) {
                        res.json(result);
                    } else {
                        result.s = req.query.s;
                        res.render('activitats-estudiants.html', { aula: result });
                    }
                });
        }
    });

    /**
     * Eines de l'activitat d'una aula
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode/activitats/:eventId/eines', config.user.authorize, function (req, res, next) {
        if (req.query.perfil == 'estudiant') {
            return eines.activitatidp(
                req.params.anyAcademic,
                req.params.codAssignatura,
                req.params.domainId,
                req.params.codAula,
                req.params.classroomId,
                req.params.domainCode,
                req.params.eventId,
                req.query.idp,
                req.query.s,
                function (err, result) {
                    if (err) {
                        return next("No s'ha pogut obtenir la informació de les eines de l'activitat");
                    }
                    if (req.query.format) {
                        res.json(result);
                    } else {
                        result.s = req.query.s;
                        res.render('eines-activitat-estudiant.html', { activitat: result });
                    }
                });
        } else {
            return eines.activitat(
                req.params.anyAcademic,
                req.params.codAssignatura,
                req.params.domainId,
                req.params.codAula,
                req.params.classroomId,
                req.params.domainCode,
                req.params.eventId,
                req.query.idp,
                req.query.s,
                function (err, result) {
                    if (err) {
                        return next("No s'ha pogut obtenir la informació de les activitats de l'aula");
                    }
                    if (req.query.format) {
                        res.json(result);
                    } else {
                        result.s = req.query.s;
                        res.render('eines-activitats-estudiants.html', { activitat: result });
                    }
                })
        }
    });

    /**
     * Avaluació dels estudiants de l'aula
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode/avaluacio', config.user.authorize, function (req, res, next) {
        return activitats.avaluacio(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.classroomId,
            req.params.domainCode,
            req.query.s,
            function (err, result) {
                if (err) {
                    return next("No s'ha pogut obtenir la informació de l'avaluació dels estudiants de l'aula");
                }
                if (req.query.format) {
                    res.json(result);
                } else {
                    result.s = req.query.s;
                    res.render('avaluacio-estudiants.html', { aula: result });
                }
            });
    });

    /**
     * Estudiants per aula amb llur indicadors
     * @param req
     * @param res
     * @param next
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode/estudiants', config.user.admin, function(req, res, next) {
        return estudiants.aula(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.codAula,
            req.params.classroomId,
            req.params.dies,
            req.query.s,
            function (err, result) {
                if (err) return next(err);
                return res.json(result);
            }
        );
    });
}