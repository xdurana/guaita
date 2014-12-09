module.exports = function(app, config) {

    /**
     * Widget de l'aula
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:classroomId/:domainCode/widget', config.user.authorize, function (req, res, next) {
        if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
        var libs = req.query.libs ? req.query.libs.split(",") : [];
        var widget = require(__base + '/lib/models/widget')(config);
        return widget.createWidget(req.params.anyAcademic, req.params.codAssignatura, req.params.domainId, req.params.codAula, req.params.classroomId, req.params.domainCode, req.query.idp, libs, req.query.up_maximized, req.query.s, function (err, result) {
            if (err) return next(err);
            if (!result) return next(err);
            result.contrast = req.query.hp_theme == "true";
            if (req.query.format) {
                res.json(result);
            } else {
                res.render(result.isAulaca ? 'widget.html' : 'widget_antic.html', {
                    widget: result
                });
            }
        });
    });

    /**
     * Widget de l'aula (URL simplificada)
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/assignatures/:subjectId/aules/:classroomId/widget', config.user.authorize, function (req, res, next) {
        if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
        var libs = req.query.libs ? req.query.libs.split(",") : [];
        var widget = require(__base + '/lib/models/widget')(config);
        return widget.createWidget(null, null, req.params.subjectId, null, req.params.classroomId, null, req.query.idp, libs, req.query.up_maximized, req.query.s, function (err, result) {
            if (err) return next(err);
            if (!result) return next(err);
            result.contrast = req.query.hp_theme == "true";
            if (req.query.format) {
                res.json(result);
            } else {
                res.render(result.isAulaca ? 'widget.html' : 'widget_antic.html', {
                    widget: result
                });
            }
        });
    });
};
