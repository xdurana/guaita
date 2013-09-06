var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var phpbb = require('../ws/phpbb');
var aulaca = require('../ws/aulaca');
var lrs = require('../ws/lrs');

exports.aula = function(domainId, domainIdAula, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		eines: [
		]
	};

	var getResumComunicacio = function (eina, callback) {
		eina.nom = eina.description;
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc()
			}
		}

        lrs.bytool(eina.resourceId, s, function(err, result) {
            if (err) { console.log(err); callback(err); return; }
            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return callback();
        });
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

exports.activitat = function(domainId, domainIdAula, eventId, s, callback) {

    var struct = {
    	s: s,
        domainId: domainId,
        domainIdAula: domainIdAula,
        eventId: eventId,
        eines: [
        ]
    };

	var getResumComunicacio = function (eina, callback) {
		eina.nom = eina.description;
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc()
			}
		}

        lrs.bytool(eina.resourceId, s, function(err, result) {
            if (err) { console.log(err); callback(err); return; }
            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return callback();
        });
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

exports.activitatEstudiant = function(domainId, domainIdAula, eventId, idp, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		eventId: eventId,
		idp: idp,
		eines: [
		]
	};

	var getResumComunicacioEstudiant = function (eina, callback) {
		eina.nom = eina.description;
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		}

        lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
            if (err) { console.log(err); callback(err); return; }
            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return callback();
        });
	}

	aulaca.getEinesPerActivitat(domainId, domainIdAula, eventId, s, function(err, result) {
		if (err) { console.log(err); callback(err); return; }		
		struct.eines = result;
		async.each(struct.eines, getResumComunicacioEstudiant, function(err) {
			if(err) { console.log(err); callback(err); return; }
			callback(null, struct);
		});
	});
}

exports.aulaidp = function(domainId, domainIdAula, idp, s, callback) {

	var struct = {
		domainId: domainId,
		domainIdAula: domainIdAula,
		idp: idp,
		eines: [
		]
	};

	var getResumComunicacioIdp = function (eina, callback) {
		eina.nom = eina.description;
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		}
        async.parallel([
            function(callback) {
                lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
                    if (err) { console.log(err); callback(err); return; }
                    eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return callback();
                });
            },
            function(callback) {
                lrs.byidpandtoollast(idp, eina.resourceId, s, function(err, result) {
                    if (err) { console.log(err); callback(err); return; }
                    eina.resum.comunicacio.ultimaConnexio = result ? result.value : config.nc();
                    return callback();
                });
            }
        ], function(err, results) {
            if(err) { console.log(err); callback(err); return; }
            callback();
        });
	}

	aulaca.getEinesPerAula(domainId, domainIdAula, s, function(err, result) {
		if (err) { console.log(err); callback(err); return; }
		struct.eines = result;
		async.each(struct.eines, getResumComunicacioIdp, function(err) {
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