module.exports = function(app, config) {

    /**
     * Materials propis d'una assignatura
     * @param req
     * @param res
     * @param next
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/materials', config.user.authorize, function(req, res, next) {

        var s = req.query.s;
        var idp = req.query.idp;
        var codAssignatura = req.params.codAssignatura;
        var anyAcademic = req.params.anyAcademic;
        var format = req.query.format;
        var userId = req.query.userid;

        config.services.mymat.listMaterialsAjax(s, codAssignatura, userId, function (err, object) {

            if (err) return next(err);
            var materials = object.dades || [];

            var o = {
                anyAcademic: anyAcademic,
                codiAssignatura: codAssignatura,
                materials: materials,
                idp: idp,
                s: s,
                cv: config.cv()
            };

            return format ? res.json(o) : res.render('materials.html', o);
        });
    });

    /**
     * Fonts d'una assignatura
     * @param req
     * @param res
     * @param next
     */
    app.get('/app/guaita/assignatures/:anyAcademic/:codAssignatura/fonts', config.user.authorize, function(req, res, next) {

        var s = req.query.s;
        var idp = req.query.idp;
        var codAssignatura = req.params.codAssignatura;
        var anyAcademic = req.params.anyAcademic;
        var format = req.query.format;
        var userId = req.query.userid;

        var recursos = [];
        var processa = function(nodevo) {
            if (nodevo.recursVOList[0] != '') {
                recursos = recursos.concat(nodevo.recursVOList[0].RecursVO);
                nodevo.recursVOList[0].RecursVO.forEach(function(r) {
                    r.url[0] = r.url[0].replace('$SESSIONID$', s);
                });
            }
            if (nodevo.nodeVOList[0] != '') {
                nodevo.nodeVOList.forEach(function(nodevochild) {
                    processa(nodevochild);
                });
            }
        };

        config.services.dadesacademiques.getRecursosByAssignatura(req.params.codAssignatura, req.params.anyAcademic, function (err, object) {
            if (err) return next(err);
            var nodes = object || [];
            nodes.forEach(function(node) {
                processa(node);
            });
            recursos.sort(function(a, b) {
                return a.titol[0] < b.titol[0] ? -1 : b.titol[0] < a.titol[0] ? 1 : 0;
            });
            if (req.query.format) {
                res.json(recursos);
            } else {
                res.render('fonts-informacio.html', {
                    anyAcademic: anyAcademic,
                    codiAssignatura: codAssignatura,
                    fonts: recursos,
                    idp: idp,
                    s: s,
                    cv: config.cv()
                });
            }
        });
    });

    /**
     * Materials HTML5
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/materials/:pid', config.user.admin, function(req, res, next) {

        var pid = req.params.pid;
        var idp = req.query.idp;
        var login = req.query.login;
        var role = req.query.role;
        var subject = req.query.subject;
        var classroom = req.query.classroom;
        var language = req.query.language;
        var app = req.query.app;
        var eventId = req.query.eventId;
        var url = req.query.url;
        var s = req.query.s;

        if (!(pid && idp && login && role && subject && classroom && language)) return next("No s'ha pogut obtenir la URL del material");
        config.services.myway.getHTML5Format(idp, login, role, subject, classroom, pid, language, function (err, format) {
            if (err) return next(err);
            config.services.lrs.registraHTML5(idp, app, subject, classroom, eventId, pid, url, s);
            return res.redirect(format);
        });
    });
}