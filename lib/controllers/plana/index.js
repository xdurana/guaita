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
    app.get('/app/guaita/plana', config.user.admin, function (req, res, next) {

        var idp = req.query.idp;
        var perfil = req.query.perfil;
        var s = req.query.s;

        if (perfil == null) return next("Manca el parametre [perfil] a la crida");
        if (idp == null) return next("Manca el parametre [idp] a la crida");

        return assignatures.byidpdocent(s, idp, perfil, function (err, result) {
            if (err) return next(err);
            res.render('planaaules/consultor.html', result);
        });
    });
};