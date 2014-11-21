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
    app.get('/app/guaita/monitor', config.user.admin, function (req, res, next) {

        var idp = req.query.idp;
        var perfil = req.query.perfil;
        var s = req.query.s;

        if (perfil == null) return next("Manca el parametre [perfil] a la crida");
        if (idp == null) return next("Manca el parametre [idp] a la crida");

        return assignatures.byidpdocent(s, idp, perfil, function (err, result) {
            if (err) return next(err);
            result.idp = idp;
            return res.render('monitor/consultor.html', result);
        });
    });

    /**
     * Aules per assignatura
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/monitor/:anyAcademic/:codAssignatura/:subjectId/aules', config.user.authorize, function(req, res, next) {

        var idp = req.query.idp;
        var perfil = req.query.perfil;
        var s = req.query.s;
        var anyAcademic = req.params.anyAcademic;
        var codAssignatura = req.params.codAssignatura;
        var subjectId = req.params.subjectId;

        if (perfil == null) return next("Manca el parametre [perfil] a la crida");

        return aules.all(anyAcademic, codAssignatura, subjectId, idp, s, perfil, function (err, result) {
            if (err) return next(err);
            return res.json({
                "id" : "03_515",
                "title" : "CAT - 03.515 Dret financer i tributari I",
                "updated" : "18-11-2014. 14:19 h.",
                "lnk_card" : "#",
                "lnk_design" : "#",
                "aulas" : [
                    {
                        "id" : 1,
                        "name" : "Aula 1",
                        "color" : "C31A8A",
                        "students" : {"total": 143, "is_rep": 9, "is_new": 1},
                        "days_off" : {"7": 7, "15": 5, "30": 3},
                        "pac_undelivered" : 23,
                        "pac_unpassed" : 36
                    },
                    {
                        "id" : 2,
                        "name" : "Aula 2",
                        "color" : "30A600",
                        "students" : {"total": 98, "is_rep": 0, "is_new": 5},
                        "days_off" : {"7": 12, "15": 3, "30": 9},
                        "pac_undelivered" : 45,
                        "pac_unpassed" : 52
                    },
                    {
                        "id" : 3,
                        "name" : "Aula 3",
                        "color" : "339DCC",
                        "students" : {"total": 56, "is_rep": 1, "is_new": 1},
                        "days_off" : {"7": 5, "15": 3, "30": 0},
                        "pac_undelivered" : 12,
                        "pac_unpassed" : 13
                    }
                ]
            });
        });
    });
};