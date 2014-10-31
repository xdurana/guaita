module.exports = function(app, config) {

    return {
        authorize: function (req, res, next) {
            if (req.query.s == null) return next("Manca el parametre [s] a la crida");
            config.services.campus.getUserBySession(req.query.s, function (err, user) {
                if (err) return next("La sessió no és valida o ha caducat");
                req.query.idp = (req.query.idp && user.idp == config.idpadmin()) ? req.query.idp : user.idp;
                req.query.userid = (req.query.userid && user.userid == config.idpadmin()) ? req.query.userid : user.userid;
                return next();
            });
        },
        admin: function (req, res, next) {
            if (req.query.s == null) return next("Manca el parametre [s] a la crida");
            config.services.campus.getUserBySession(req.query.s, function (err, user) {
                if (err) return next("La sessió no és valida o ha caducat");
                if (user.idp != config.idpadmin()) return next("Permis denegat");
                return next();
            });
        },
        bytool: function (req, res, next) {
            return next();
        }
    }
}