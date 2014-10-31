module.exports = function(app, config) {

    /**
     * Error handler for console output
     * @param  {[type]}   err
     * @param  {[type]}   req
     * @param  {[type]}   res
     * @param  {Function} next
     * @return {[type]}
     */
    app.use(function (err, req, res, next) {
        config.log(err);
        next(err);
    });

    /**
     * 404
     * @param  {[type]}   req
     * @param  {[type]}   res
     * @param  {Function} next
     * @return {[type]}
     */
    app.use(function (req, res, next) {
        res.json({
            status: 404,
            url: req.url
        });
    });

    /**
     * 500
     * @param  {[type]}   err  [description]
     * @param  {[type]}   req  [description]
     * @param  {[type]}   res  [description]
     * @param  {Function} next [description]
     * @return {[type]}        [description]
     */
    app.use(function (err, req, res, next) {
        res.status(500);
        res.json({
            status: 500,
            url: req.url,
            error: err
        });
    });
}