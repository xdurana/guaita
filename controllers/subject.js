var aules = require('../routes/aules');
var indicadors = require('../routes/indicadors');
var config = require('../config');

/**
 * [getClassroom description]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 * @return {[type]}
 */
var getClassroom = exports.getClassroom = function (req, res, next) {
    if (req.query.perfil == null) {
        return next("Manca el parametre [perfil] a la crida");
    }
    return aules.all(
        req.params.anyAcademic,
        req.params.codAssignatura,
        req.params.domainId,
        req.query.idp,
        req.query.s,
        req.query.perfil,
        function (err, result) {
        if(err) { console.log(err); next(); return; }
        if (req.query.format) {
            res.json(result);
        } else {
            result.s = req.query.s;
            result.idp = req.query.idp;
            result.linkfitxaassignatura = config.util.format("http://cv.uoc.edu/tren/trenacc/web/GAT_EXP.PLANDOCENTE?any_academico=%s&cod_asignatura=%s&idioma=CAT&pagina=PD_PREV_PORTAL&cache=S", req.params.anyAcademic, req.params.codAssignatura);

            var isAulaca = result.aules.length > 0 ? result.aules[0].isAulaca : true;
            result.linkedicioaula = indicadors.getLinkDissenyAula(req.query.s, isAulaca, req.params.domainId);

            res.render(req.query.perfil == 'pra' ? 'tabs_pra.html' : 'tabs_consultor.html', { assignatura: result });
        }
    });
}