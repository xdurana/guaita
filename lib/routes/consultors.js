var async = require('async');

var config = require(__base + '/config');
var indicadors = require(__base + '/lib/routes/indicadors');
var ws = require(__base + '/ws');

var Tercer = require(__base + '/lib/models/tercer');

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