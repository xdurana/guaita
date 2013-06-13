var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, codAula, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/estudiants

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		estudiants: []
	}

	async.series([
		function(callback) {
			rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
				if(err) { console.log(err); callback(true); return; }
				struct.estudiants = result.out.EstudiantAulaVO;
				callback();
			});
		},
	  function(callback) {
	  	async.each(struct.estudiants, function (estudiant, callback) {
	  		var ordre = '2';
	  		rac.getActivitatsByEstudiantAulaOrdre(struct.anyAcademic, struct.codAssignatura, struct.numAula, ordre, estudiant.numExpedient, function(err, result) {
	  			if(err) { console.log(err); callback(true); return; }
					estudiant.darreraNota = result.out.codQualificacio;
					callback();
				});
	  	}, function(err) {
	  		if(err) { console.log(err); callback(true); return; }
				callback();
			});
	  }
	], function(err, results) {
		if(err) { console.log(err); callback(true); return; }
		callback(null, struct);
	});
}

exports.one = function(codAssignatura, anyAcademic, codAula, numExpedient, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/estudiants/476981

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		numExpedient: numExpedient,
		estudiant: {
		}
	}

	rac.getActivitatsByEstudiantAula(anyAcademic, codAssignatura, codAula, numExpedient, function(err, result) {
		if(err) { console.log(err); return; }
		struct.estudiant.activitats = result.out;
		callback(null, struct);
	});
}