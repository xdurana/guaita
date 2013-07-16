var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, codAula, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/eines

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		eines: []
	}

	//TODO llista d'eines d'una aula
	callback(null, struct);
}

exports.one = function(codAssignatura, anyAcademic, codAula, codEina, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/eines/717635

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		codEina: codEina
	}

	//TODO indicadors de l'eina
	callback(null, struct);
}

exports.activitat = function(codAssignatura, anyAcademic, codAula, codActivitat, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/activitats/696566/eines

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		codActivitat: codActivitat,
		eines: []
	}

	//TODO llista d'eines d'una aula
	callback(null, struct);
}

exports.phpBB3 = function(domainId, forumId, callback) {

	//http://localhost:3333/assignatures/phpBB3?domainId=321292&forumId=50591

	var struct = {
		domainId: domainId,
		forumId: forumId,
		participacions: 0,		
		pendents: 0,
		pendents_mitjana: 0,
		pendents_percentatge: 0,
		estudiants: {
			nombre: 0
		}
	}

	var request = require("request");
	request({
	  url: "http://cv-test.uoc.edu/app/phpBB3/service.php?domainId=" + domainId + "&forumId=" + forumId + "&type=SEGUIMENT",
	  method: "GET"
	}, function (error, response, body) {
		if (error) { console.log(err); callback(true); return; }
		if (response.statusCode == '200') {
			var object = JSON.parse(body);
			struct.pendents = object.totalPendingUsersByClassroom;
			for (var key in object.postUserByClassroom) {
				struct.participacions += parseInt(object.postUserByClassroom[key].count_post);
				struct.estudiants.nombre += 1;
			}
			struct.pendents_mitjana = struct.pendents/struct.estudiants.nombre;
			struct.pendents_percentatge = (100 * (1 - ((struct.participacions - struct.pendents_mitjana)/struct.participacions))).toFixed(2);
		}
		callback(null, struct);
	});
}