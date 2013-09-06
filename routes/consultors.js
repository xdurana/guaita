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
		if (err) { console.log(err); return callback(err); }
		async.each(result.out.AulaVO, getConsultantStats, function(err) {
			if (err) { console.log(err); return callback(err); }
		});
		callback(null, struct);
	});

	var getConsultantStats = function(item, callback) {
		struct.consultors.push({
			idp: item.idpConsultor[0],
			codAssignatura: item.codAssignatura[0],
			codAula: item.codAula[0]
		});
	}
}

exports.aula = function(anyAcademic, codAssignatura, codAula, callback) {

    var consultor = {};
	rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
		if (err) { console.log(err); return callback(err); }
        try {
            consultor = result.out.consultors[0].ConsultorAulaVO[0];
            consultor.nomComplert = indicadors.getNomComplert(consultor.tercer);
            consultor.idp = consultor.tercer[0].idp[0];
            //TODO
            consultor.fitxa = util.format('https://cv-test.uoc.edu/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=52347&appId=UOC&idLang=b&s=ad6e883da00b61dc2613226a9166363033ba80ea2892e1cd3efadbdf3b2e89fee01d855152f5a8ab5c4108a0881a92820ff5b24519633925cfbd14bd8384d276&l=b&id_usuario_conectado=281933')
        } catch(e) {
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
            lrs.byidp(aula.consultor.idp, aula.s, function(err, result) {
                if (err) { console.log(err); callback(err); return; }
                aula.consultor.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                callback();
            });
        },
        function (callback) {            
            lrs.byidplast(aula.consultor.idp, aula.s, function(err, result) {
                if (err) { console.log(err); callback(err); return; }
                aula.consultor.resum.comunicacio.ultimaConnexio = result ? result.value : config.nc();
                callback();
            });
        }
    ], function(err, result) {
        if (err) { console.log(err); callback(err); return; }
        return callback();
    });
}