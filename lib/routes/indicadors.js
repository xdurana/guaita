var config = require(__base + '/config');
var encoder = require(__base + '/lib/routes/encoder');
var moment = require('moment');

/**
 * Objecte base de comunicació
 * @returns {{comunicacio: {clicsAcumulats: *, lecturesPendents: *, participacions: *, ultimaConnexioCampus: *, ultimaConnexioWidget: *, ultimaConnexio: *}}}
 */
exports.getObjectComunicacio = function() {
    return {
        comunicacio: {
            clicsAcumulats: config.nc(),
            lecturesPendents: config.nc(),
            participacions: config.nc(),
            ultimaConnexioCampus: config.nc(),
            ultimaConnexioWidget: config.nc(),
            ultimaConnexio: config.nc()
        }
    }
};

/**
 * Retorna el primer valor dins d'un array o el valor mateix
 * @param object
 * @returns {*}
 */
exports.getValor = function(object) {
    return Array.isArray(object) ? object[0] : object;
};

/**
 * Retorna el tant per cent donats dos valors
 * @param actual
 * @param total
 * @returns {*}
 */
exports.getPercent = function(actual, total) {
    actual = parseInt(actual) || 0;
    total = parseInt(total) || 0;
    if (actual == 0) return 0;
    if (total == 0) return 0;
    return (100*actual/total).toFixed(2);
};

/**
 * Nom complet d'un tercer
 * @param tercer
 * @returns {string}
 */
exports.getNomComplert = function(tercer) {
    var complert = '';
    try {
        var t = exports.getValor(tercer);
        complert = config.util.format('%s %s',
            exports.getValor(t.nom),
            exports.getValor(t.primerCognom)
        );

    	if (typeof exports.getValor(t.segonCognom) == 'string') {
    		complert += ' ' + exports.getValor(t.segonCognom);
    	}
    	if (typeof exports.getValor(t.tercerCognom) == 'string') {
    		complert += ' ' + exports.getValor(t.tercerCognom);
    	}
    } catch(e) {
    }
    return complert;
};

/**
 * [getUrlRAC description]
 * @param  {[type]} s        [description]
 * @param  {[type]} domainId [description]
 * @param  {[type]} docent   [description]
 * @return {[type]}          [description]
 */
var getUrlRAC = exports.getUrlRAC = function(s, domainId, docent) {
    return config.util.format('%s/webapps/rac/%s.action?s=%s&domainId=%s', config.cv(), docent ? 'RacInici' : 'listEstudiant', s, domainId)
}

/**
 * [getTotalAules description]
 * @param  {[type]} AulaVO [description]
 * @return {[type]}        [description]
 */
var getTotalAules = exports.getTotalAules = function(AulaVO) {
	return AulaVO ? AulaVO.length : 0;
}

/**
 * [getUltimaConnexio description]
 * @param  {[type]} object [description]
 * @return {[type]}        [description]
 */
var getUltimaConnexio = exports.getUltimaConnexio = function(object) {
    return exports.getValor(object.value) ? formatDate(exports.getValor(object.value).stored) : config.nc();
}

/**
 * [formatDate description]
 * @param  {[type]} date [description]
 * @return {[type]}      [description]
 */
var formatDate = exports.formatDate = function(date) {
    return date && moment(date).isValid() ? moment(date).format("DD/MM/YYYY") : config.nc();
}

/**
 * [decodeHtmlEntity description]
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
var decodeHtmlEntity = exports.decodeHtmlEntity = function(html) {
    return Encoder.htmlDecode(html);
};

/**
 * [getDataLliurament description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
var getDataLliurament = exports.getDataLliurament = function(data) {
    return formatDate(exports.getValor(data));
}

/**
 * [getIndicador description]
 * @param  {[type]} indicadors [description]
 * @param  {[type]} nom        [description]
 * @return {[type]}            [description]
 */
var getIndicador = exports.getIndicador = function(indicadors, nom) {
    var total = config.nc();
	if (indicadors) {
		indicadors.forEach(function(item) {
			if (exports.getValor(exports.getValor(item.indicador).codIndicador) == nom) {
				total = /^(\d+)*/g.exec(exports.getValor(item.valor))[0];
                total = (parseInt(total) || 0);
			}
		})
	}
    return total;
}

/**
 * [getIndicadorTantPerCent description]
 * @param  {[type]} indicadors [description]
 * @param  {[type]} nom        [description]
 * @return {[type]}            [description]
 */
var getIndicadorTantPerCent = exports.getIndicadorTantPerCent = function(indicadors, nom) {
    var total = config.nc();
	if (indicadors) {
		indicadors.forEach(function(item) {
			if (exports.getValor(exports.getValor(item.indicador).codIndicador) == nom) {
				total = /^\d+ \( (\d+([\.\,]\d+)*) \% \)/g.exec(exports.getValor(item.valor));
                total = total[1].replace(',', '.');
                total = (parseInt(total) || 0).toFixed(2);
			}
		})
	}
	return total;
}

/**
 * [getTotalEstudiantsTotal description]
 * @param  {[type]} indicadors [description]
 * @return {[type]}            [description]
 */
var getTotalEstudiantsTotal = exports.getTotalEstudiantsTotal = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_TOTAL');
}

/**
 * [getTotalEstudiantsRepetidors description]
 * @param  {[type]} indicadors [description]
 * @return {[type]}            [description]
 */
var getTotalEstudiantsRepetidors = exports.getTotalEstudiantsRepetidors = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_REPITE');
}

/**
 * [getTotalEstudiantsPrimeraMatricula description]
 * @param  {[type]} indicadors [description]
 * @return {[type]}            [description]
 */
var getTotalEstudiantsPrimeraMatricula = exports.getTotalEstudiantsPrimeraMatricula = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_1A_MATR');
}

/**
 * [getSeguimentACAulaPercent description]
 * @param  {[type]} indicadors [description]
 * @return {[type]}            [description]
 */
var getSeguimentACAulaPercent = exports.getSeguimentACAulaPercent = function(indicadors) {
    return getIndicadorTantPerCent(indicadors, 'ESTUD_PARTICIPA_AC');
}

/**
 * [getSuperacioACAulaPercent description]
 * @param  {[type]} indicadors [description]
 * @return {[type]}            [description]
 */
var getSuperacioACAulaPercent = exports.getSuperacioACAulaPercent = function(indicadors) {
    return getIndicadorTantPerCent(indicadors, 'ESTUD_SUPERA_AC');
}

/**
 * [getSeguimentACAula description]
 * @param  {[type]} indicadors [description]
 * @return {[type]}            [description]
 */
var getSeguimentACAula = exports.getSeguimentACAula = function(indicadors) {
    return getIndicador(indicadors, 'ESTUD_PARTICIPA_AC');
}

/**
 * [getSuperacioACAula description]
 * @param  {[type]} indicadors [description]
 * @return {[type]}            [description]
 */
var getSuperacioACAula = exports.getSuperacioACAula = function(indicadors) {
    return getIndicador(indicadors, 'ESTUD_SUPERA_AC');
}