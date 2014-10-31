module.exports = function(app, config) {

    /**
     * Assignatures matriculades d'un estudiant
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/sala', config.user.admin, function (req, res, next) {

        var assignaturesEstudiant = [];
        var anyAcademic = req.query.anyAcademic;
        var idp = req.query.idp;
        var s = req.query.s;

        if (!idp) return next("Manca l'idp");
        config.services.dadesexpedient.getExpedientsByEstudiant(idp, function(err, expedients) {
            config.async.each(expedients, getAssignatures, function(err) {
                if (err) return next(err);
                return res.json(assignaturesEstudiant);
            });
        });

        /**
         * Assignatures per expedient
         * @param expedient
         * @param next
         */
        var getAssignatures = function(expedient, next) {
            config.services.matricula.getAssignaturesDocenciaMatriculadesEstudiant(expedient.numExpedient, anyAcademic, function(err, assignatures) {
                return next(err, assignatures);
            });
        };
    });
}