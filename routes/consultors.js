var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var usuaris = require('./usuaris');
var ws = require('../ws');

/**
 * [all description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {Function} callback       [description]
 * @return {[type]}                  [description]
 */
exports.all = function(codAssignatura, anyAcademic, callback) {
	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		consultors: []
	}
	ws.infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		if (err) { console.log(err); return callback(); }
        if (result.out.AulaVO) {
    		async.each(result.out.AulaVO, getConsultantStats, function(err) {
    			if (err) { console.log(err); return callback(null, struct); }
                return callback(null, struct);
    		});
        }
        return callback(null, struct);
	});
	var getConsultantStats = function(item, callback) {
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
 * @param  {Function} callback       [description]
 * @return {[type]}                  [description]
 */
exports.aula = function(anyAcademic, codAssignatura, codAula, idp, s, callback) {
    var consultor = {
        nomComplert: config.nc(),
        fitxa: '#'
    };
	ws.rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
		if (err) { console.log(err); return callback(null, consultor); }
        try {
            if (result.out.consultors) {
                consultor = indicadors.getValor(indicadors.getValor(result.out.consultors).ConsultorAulaVO);
                consultor.nomComplert = indicadors.getNomComplert(consultor.tercer);
                consultor.idp = indicadors.getValor(indicadors.getValor(consultor.tercer).idp);
                usuaris.getFitxa(consultor.idp, idp, s, function(err, url) {
                    if (err) { console.log(err); }
                    consultor.fitxa = err ? '#' : url;
                });
            }
        } catch(e) {
            console.log(e.message);
        }
        return callback(null, consultor);
	});
}

/**
 * [getResumEines description]
 * @param  {[type]}   aula     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.getResumEines = function(aula, callback) {
	aula.consultor.resum = indicadors.getObjectComunicacio();
    async.parallel([
        function (callback) {
            ws.lrs.byidpandclassroom(aula.consultor.idp, aula.domainId, aula.s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                aula.consultor.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return callback();
            });
        },        
        function (callback) {            
            ws.lrs.byidpandclassroomlast(aula.consultor.idp, aula.domainId, aula.s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                aula.consultor.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                return callback();
            });
        },        
        function (callback) {            
            ws.lrs.byidpandclassroomandwidgetlast(aula.consultor.idp, aula.domainId, aula.s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                aula.consultor.resum.comunicacio.ultimaConnexioWidget = indicadors.getUltimaConnexio(result);
                return callback();
            });
        }
    ], function(err, result) {
        if (err) { console.log(err); }
        return callback();
    });
}