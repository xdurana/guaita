module.exports = function(app, config) {

    /**
     * Calendari d'un usuari
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    app.get('/app/guaita/calendari', config.user.authorize, function (req, res, next) {

        var calendaris = require(__base + '/lib/routes/calendaris');

        if (req.query.idp == null) return next("Manca el parametre [idp] a la crida");
        if (req.query.perfil == null) return next("Manca el parametre [perfil] a la crida");
        if (req.query.perfil == 'estudiant') {
            calendaris.estudiant(req.query.s, req.query.idp, function (err, object) {
                if (err) return next(err);
                pinta(object);
            });
        } else {
            calendaris.docent(req.query.s, req.query.idp, req.query.perfil, function(err, object) {
                if (err) return next(err);
                pinta(object);
            });
        }

        var pinta = function(object) {
            object.icalurl = config.util.format('/app/guaita/calendari?idp=%s&perfil=%s&s=%s&format=ical', req.query.idp, req.query.perfil, req.query.s);
            if (req.query.format === 'ical') {
                var ical = calendaris.getiCal(object);
                res.attachment('uoc.ical');
                res.setHeader('Content-Type', 'text/calendar');
                res.end(ical);
            } else if (req.query.format) {
                res.json(object);
            } else {
                object.perfil = req.query.perfil === 'estudiant' ? 'student' : req.query.perfil;
                res.render('calendari.html', {
                    object: object
                });
            }
        }
    });
}