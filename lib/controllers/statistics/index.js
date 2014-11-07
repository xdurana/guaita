module.exports = function(app, config) {

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