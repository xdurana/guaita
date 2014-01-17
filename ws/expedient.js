var AGRUPACIO_INICIATIVES = 'ESTUDIANT';
var INCLOURE_NO_DEFINITS = 'N';

/**
 * [getAgrupacionsIniciativesByEstudiant description]
 * @param  {[type]}   idp
 * @param  {[type]}   idioma
 * @param  {[type]}   config
 * @param  {Function} callback
 * @return {[type]}
 */
var getAgrupacionsIniciativesByEstudiant = exports.getAgrupacionsIniciativesByEstudiant = function(idp, idioma, config, callback) {
    var args = {
        in0: idp,
        in1: AGRUPACIO_INICIATIVES,
        in2: idioma,
        in3: INCLOURE_NO_DEFINITS
    }
    service.operation(config.expedientwsdl(), 'getAgrupacionsIniciativesByEstudiant', args, function(err, result) {
        if(err) { console.log(err); callback(err); return; }
        callback(null, result);
    });
}