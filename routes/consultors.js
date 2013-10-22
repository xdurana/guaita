var async = require('async');
var util = require('util');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var lrs = require('../ws/lrs');

exports.all = function(codAssignatura, anyAcademic, callback) {

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		consultors: []
	}

	infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		if (err) { console.log(err); return callback(); }
        try {
    		async.each(result.out.AulaVO, getConsultantStats, function(err) {
    			if (err) { console.log(err); return callback(null, struct); }
    		});
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
	});

	var getConsultantStats = function(item, callback) {
		struct.consultors.push({
            idp: indicadors.getValor(item.idpConsultor),
            codAssignatura: indicadors.getValor(item.codAssignatura),
            codAula: indicadors.getValor(item.codAula)
		});
	}
}

exports.aula = function(anyAcademic, codAssignatura, codAula, idp, s, callback) {

    var consultor = {};
	rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
		if (err) { console.log(err); return callback(); }
        try {
            consultor = indicadors.getValor(indicadors.getValor(result.out.consultors).ConsultorAulaVO);
            consultor.nomComplert = indicadors.getNomComplert(consultor.tercer);
            consultor.idp = indicadors.getValor(indicadors.getValor(consultor.tercer).idp);
            indicadors.getFitxa(consultor.idp, idp, s, function(err, url) {
                if (err) { console.log(err); }
                consultor.fitxa = err ? '#' : url;
            });
        } catch(e) {
            console.log(e.message);
            consultor.nomComplert = config.nc(),
            consultor.fitxa = '#';
        }
        return callback(null, consultor);
	});
}

exports.getResumEines = function(aula, callback) {

	aula.consultor.resum = {
		comunicacio: {
			clicsAcumulats: config.nc(),
			lecturesPendentsAcumulades: config.nc(),
			participacions: config.nc(),
			ultimaConnexio: config.nc()
		}
	}

    async.parallel([
        function (callback) {
            lrs.byidpandclassroom(aula.consultor.idp, aula.domainId, aula.s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                aula.consultor.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return callback();
            });
        },
        function (callback) {            
            lrs.byidpandclassroomlast(aula.consultor.idp, aula.domainId, aula.s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                aula.consultor.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                return callback();
            });
        }
    ], function(err, result) {
        if (err) { console.log(err); }
        return callback();
    });
}