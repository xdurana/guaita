module.exports = function(app, config) {

    var aules = require(__base + '/lib/models/classroom')(config);
    var activitats = require(__base + '/lib/models/activity')(config);
    var estudiants = require(__base + '/lib/models/student')(config);
    var eines = require(__base + '/lib/models/tool')(config);

    /**
     * Nova plana aules
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/plana', config.user.admin, function (req, res, next) {
        res.render('planaaules/aulas_consultor.html', {});
    });
};