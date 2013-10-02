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
            //TODO
			//idp: item.idpConsultor[0],
            idp: indicadors.getValor(item.idpConsultor),
            //TODO
            //codAssignatura: item.codAssignatura[0],
            codAssignatura: indicadors.getValor(item.codAssignatura),
            //TODO
			//codAula: item.codAula[0]
            codAula: indicadors.getValor(item.codAula)
		});
	}
}

exports.aula = function(anyAcademic, codAssignatura, codAula, idp, s, callback) {

    var consultor = {};
	rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
		if (err) { console.log(err); return callback(); }
        try {
            //TODO
            //consultor = result.out.consultors[0].ConsultorAulaVO[0];
            consultor = indicadors.getValor(indicadors.getValor(result.out.consultors).ConsultorAulaVO);
            consultor.nomComplert = indicadors.getNomComplert(consultor.tercer);
            //TODO
            //consultor.idp = consultor.tercer[0].idp[0];
            consultor.idp = indicadors.getValor(indicadors.getValor(consultor.tercer).idp);
            consultor.fitxa = indicadors.getFitxa(consultor.idp, idp, s);
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