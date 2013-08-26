var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var phpbb = require('../ws/phpbb');
var aulaca = require('../ws/aulaca');

exports.activitat = function(domainId, domainIdAula, eventId, s, callback) {

    var struct = {
        domainId: domainId,
        domainIdAula: domainIdAula,
        eventId: eventId,
        eines: [
        ]
    };

    //TODO
	var getResumComunicacio = function (eina, callback) {
		eina.nom = eina.description;
		eina.resum = {
			comunicacio: {
				clicsAcumulats: 0,
				lecturesPendentsAcumulades: 0,
				lecturesPendents: 0,
				participacions: 0
			}
		}
		callback(null, eina);
	}    

    aulaca.getEinesPerActivitat(domainId, domainIdAula, eventId, s, function(err, result) {
		if (err) { console.log(err); callback(err); return; }
		struct.eines = result;
		async.each(struct.eines, getResumComunicacio, function(err) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, struct);
		});
    });
}

exports.aula = function(domainId, domainIdAula, s, callback) {

	var struct = {
		domainId: domainId,
		domainIdAula: domainIdAula,
		eines: [
		]
	};

	//TODO
	var getResumComunicacio = function (eina, callback) {
		eina.nom = eina.description;
		eina.resum = {
			comunicacio: {
				clicsAcumulats: 0,
				lecturesPendentsAcumulades: 0,
				lecturesPendents: 0,
				participacions: 0
			}
		}
		callback(null, eina);
	}

	aulaca.getEinesPerAula(domainId, domainIdAula, s, function(err, result) {
		if (err) { console.log(err); callback(err); return; }
		struct.eines = result;
		async.each(struct.eines, getResumComunicacio, function(err) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, struct);
		});
	});
}

exports.phpBB3 = function(domainId, forumId, callback) {
	phpbb.one(domainId, forumId, s, function(err, result) {
		if (error) { console.log(err); callback(err); return; }
		callback(null, struct);
	});
}