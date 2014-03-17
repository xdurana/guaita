var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var usuaris = require('./usuaris');
var ws = require('../ws');

/**
 * [all description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {Function} next       [description]
 * @return {[type]}                  [description]
 */
exports.all = function(codAssignatura, anyAcademic, next) {
	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		consultors: []
	}
	ws.infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		if (err) return next(err);
        if (result.out.AulaVO) {
    		async.each(result.out.AulaVO, getConsultantStats, function(err) {
                return next(err, struct);
    		});
        } else {
            return next(null, struct);
        }
	});
	var getConsultantStats = function(item, next) {
		struct.consultors.push({
            idp: indicadors.getValor(item.idpConsultor),
            codAssignatura: indicadors.getValor(item.codAssignatura),
            codAula: indicadors.getValor(item.codAula)
		});
	}
}

/**
 * [aula description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   codAula        [description]
 * @param  {[type]}   idp            [description]
 * @param  {[type]}   s              [description]
 * @param  {Function} next       [description]
 * @return {[type]}                  [description]
 */
exports.aula = function(anyAcademic, codAssignatura, codAula, idp, s, next) {
    var consultor = {
        nomComplert: config.nc(),
        fitxa: '#'
    };
	ws.rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
		if (err) return next(err);
        try {
            if (result.out.consultors) {
                consultor = indicadors.getValor(indicadors.getValor(result.out.consultors).ConsultorAulaVO);
                consultor.nomComplert = indicadors.getNomComplert(consultor.tercer);
                consultor.idp = indicadors.getValor(indicadors.getValor(consultor.tercer).idp);
                usuaris.getFitxa(consultor.idp, idp, s, function(err, url) {
                    if (err) return next(err);
                    consultor.fitxa = err ? '#' : url;
                });
            }
        } catch(e) {
        }
        return next(null, consultor);
	});
}

/**
 * [getResumEines description]
 * @param  {[type]}   aula     [description]
 * @param  {Function} next [description]
 * @return {[type]}            [description]
 */
exports.getResumEines = function(aula, s, next) {
	aula.consultor.resum = indicadors.getObjectComunicacio();
    async.parallel([
        function (next) {
            ws.lrs.byidpandclassroom(aula.consultor.idp, aula.domainId, s, function(err, result) {
                if (err) return next(err);
                aula.consultor.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return next();
            });
        },        
        function (next) {            
            ws.lrs.byidpandclassroomlast(aula.consultor.idp, aula.domainId, s, function(err, result) {
                if (err) return next(err);
                aula.consultor.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                return next();
            });
        },        
        function(next) {
            ws.aulaca.getUltimaConnexioCampus(aula.consultor.idp, s, function(err, result) {
                if (err) return next(err);
                aula.consultor.resum.comunicacio.ultimaConnexioCampus = indicadors.formatDate(result);
                return next();
            });
        },
        function (next) {            
            ws.lrs.byidpandclassroomandwidgetlast(aula.consultor.idp, aula.domainId, s, function(err, result) {
                if (err) return next(err);
                aula.consultor.resum.comunicacio.ultimaConnexioWidget = indicadors.getUltimaConnexio(result);
                return next();
            });
        }
    ], function(err, result) {
        return next(err);
    });
}