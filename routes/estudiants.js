var async = require('async');

var indicadors = require('./indicadors');
var activitats = require('./activitats');
var calendar = require('./calendar');
var config = require('../config');
var rac = require('../ws/rac');
var lrs = require('../ws/lrs');
var aulaca = require('../ws/aulaca');

/**
 * Estudiants d'una aula
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 */
exports.all = function(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, callback) {

	var struct = [
	];

	rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if (err) { console.log(err); return callback(null, struct); }        
		struct = result.out.EstudiantAulaVO;
        try {
    		async.each(struct, getResumEstudiant, function(err) {
    			if (err) { console.log(err); }
    			return callback(null, struct);
    		});
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
	});

	var getResumEstudiant = function(estudiant, callback) {
		estudiant.nomComplert = indicadors.getNomComplert(estudiant.tercer);
        estudiant.idp = estudiant.tercer[0].idp[0];
        estudiant.fitxa = indicadors.getFitxa(estudiant.idp, idp, s);
		estudiant.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		};

        async.parallel([
            function(callback) {
                lrs.byidpandclassroom(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    estudiant.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return callback();
                });
            },
            function(callback) {
                lrs.byidpandclassroomlast(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    estudiant.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    return callback();
                });
            }
        ], function(err, results) {
            if (err) { console.log(err); }
            return callback();
        });
	}
}

/**
 * Aules per estudiant
 * @param idp
 * @param s
 */
exports.aules = function(idp, s, callback) {
    var struct = {
        calendari: {
        }
    };

    var getCalendariAula = function(s, aula, callback) {
        activitats.aula(aula.domainId, aula.domainIdAula, s, false, function(err, result) {
            if (err) { console.log(err); return callback(); }
            aula.activitats = result.activitats;

            aula.activitats.forEach(function(activitat) {

                //TODO

                var inici = {
                    esdeveniment: 'inici',
                    activitat: activitat
                }
                var fi = {
                    esdeveniment: 'fi',
                    activitat: activitat
                }
                var solucio = {
                    esdeveniment: 'solució',
                    activitat: activitat
                }
                var qualificacio = {
                    esdeveniment: 'qualificació',
                    activitat: activitat
                }
                if (activitat.startDate) {
                    struct.calendari[activitat.startDate] = struct.calendari[activitat.startDate] ? struct.calendari[activitat.startDate] : [];
                    struct.calendari[activitat.startDate].push(inici);
                }
                if (activitat.deliveryDate) {
                    struct.calendari[activitat.deliveryDate] = struct.calendari[activitat.deliveryDate] ? struct.calendari[activitat.deliveryDate] : [];
                    struct.calendari[activitat.deliveryDate].push(fi);
                }
                if (activitat.solutionDate) {
                    struct.calendari[activitat.solutionDate] = struct.calendari[activitat.solutionDate] ? struct.calendari[activitat.solutionDate] : [];
                    struct.calendari[activitat.solutionDate].push(solucio);
                }
                if (activitat.qualificationDate) {
                    struct.calendari[activitat.qualificationDate] = struct.calendari[activitat.qualificationDate] ? struct.calendari[activitat.qualificationDate] : [];
                    struct.calendari[activitat.qualificationDate].push(qualificacio);
                }
            });

            return callback();
        });
    }

    var getCalendari = function(callback) {
        var cal = new calendar.Calendar(1);
        config.debug(cal);
        config.debug(cal.monthDates(
            2013,
            8,
            function(d) {return (' '+d.getDate()).slice(-2)}
        ));
        return callback();
    }

    aulaca.getAulesEstudiant(idp, s, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        async.each(result.aules, getCalendariAula.bind(null, s), function(err) {
            struct.idp = idp;
            struct.aules = result.aules;
            getCalendari(function(err, result) {
                if (err) { console.log(err); return callback(null, struct); }
                return callback(null, struct);
            });
        });
    });
}