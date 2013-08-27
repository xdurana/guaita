var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, callback) {

	//http://localhost:3333/assignatures/05.002/20122/consultors

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		consultors: []
	}

	infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function(err, result) {
		if (err) return callback(err);
		async.each(result.out.AulaVO, getConsultantStats, function(err) {
			if (err) return callback(err);
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
	rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
		if (err) return callback(err);
		var consultor = result.out.consultors[0].ConsultorAulaVO[0];
		consultor.nomComplert = indicadors.getNomComplert(consultor.tercer);
		callback(null, consultor);
	});
}

exports.getResumEines = function(aula, callback) {
	//TODO
	aula.consultor.resum = {
		comunicacio: {
			clicsAcumulats: 0,
			lecturesPendentsAcumulades: 0,
			participacions: 0,
			ultimaConnexio: '01/01/2014'
		}		
	}
	callback(null);
}