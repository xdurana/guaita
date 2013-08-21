var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.activitat = function(domainId, domainIdAula, domainIdActivitat, s, callback) {
	var request = require("request");
	var struct = {
		domainId: domainId,
		domainIdAula: domainIdAula,
		domainIdActivitat: domainIdActivitat,
		eines: [
		]
	};

	domainId = '382784';
	domainIdAula = '382785';
	domainIdActivitat = '697120';

	request({
	  url: "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures/" + domainId + "/aules/" + domainIdAula + "/activitats/" + domainIdActivitat + "/eines?s=" + s,
	  method: "GET"
	}, function (error, response, body) {
		if (error) { console.log(err); callback(true); return; }
		if (response.statusCode == '200') {
			var object = JSON.parse(body);
			struct.eines = object.tools;
			struct.eines.forEach(function(eina) {
				eina.nom = eina.description;
				eina.resum = {
					comunicacio: {
						clicsAcumulats: 0,
						lecturesPendentsAcumulades: 0,
						lecturesPendents: 0,
						participacions: 0
					}
				}
			});
		}
		console.log(struct);
		callback(null, struct);
	});
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