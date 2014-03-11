var config = require('../config');
var encoder = require('./encoder');
var moment = require('moment');

/**
 * [getResumComunicacio description]
 * @return {[type]} [description]
 */
var getObjectComunicacio = exports.getObjectComunicacio = function() {
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
}

/**
 * [getValor description]
 * @param  {[type]} object [description]
 * @return {[type]}        [description]
 */
var getValor = exports.getValor = function(object) {
    return Array.isArray(object) ? object[0] : object;
};

/**
 * [getPercent description]
 * @param  {[type]} actual [description]
 * @param  {[type]} total  [description]
 * @return {[type]}        [description]
 */
var getPercent = exports.getPercent = function(actual, total) {
    actual = parseInt(actual) || 0;
    total = parseInt(total) || 0;
    if (actual == 0) return 0;
    if (total == 0) return 0;
    return (100*actual/total).toFixed(2);
}

/**
 * [getNomComplert description]
 * @param  {[type]} tercer [description]
 * @return {[type]}        [description]
 */
var getNomComplert = exports.getNomComplert = function(tercer) {
    var complert = '';
    try {
        var t = getValor(tercer);
        complert = config.util.format('%s %s',
            getValor(t.nom),
            getValor(t.primerCognom)
        );

    	if (typeof getValor(t.segonCognom) == 'string') {
    		complert += ' ' + getValor(t.segonCognom);
    	}
    	if (typeof getValor(t.tercerCognom) == 'string') {
    		complert += ' ' + getValor(t.tercerCognom);
    	}
    } catch(e) {
    }
    return complert;
}

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
    return getValor(object.value) ? formatDate(getValor(object.value).stored) : config.nc();
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
    if (!data) {
        return config.nc();
    }
    try {
        var dt = new Date(getValor(data));
        return config.util.format('%s-%s-%s',
            dt.getDate(),
            dt.getMonth() + 1,
            dt.getFullYear()
        );
    } catch(e) {
        return config.nc();
    }
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
			if (getValor(getValor(item.indicador).codIndicador) == nom) {
				total = /^(\d+)*/g.exec(getValor(item.valor))[0];
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
			if (getValor(getValor(item.indicador).codIndicador) == nom) {
				total = /^\d+ \( (\d+([\.\,]\d+)*) \% \)/g.exec(getValor(item.valor));                
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