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
        estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
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
                indicadors.getFitxa(estudiant.idp, idp, s, function(err, url) {
                    if (err) { console.log(err); return callback(); }
                    estudiant.fitxa = url;
                    return callback();
                });
            },
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
        s: s,
        idp: idp,
        calendari: {
        }
    };

    aulaca.getAulesEstudiant(idp, s, function(err, object) {
        if (err) { console.log(err); return callback(null, struct); }

        if (object.classrooms) {
            object.classrooms.forEach(function(classroom) {

                //TODO GUAITA-31
                var isAulaca = true;
                //classroom.link = indicadors.getLinkAula(s, isAulaca, classroom.domainId, classroom.domainCode);

                //TODO GUAITA-35
                var defaultColor = '66AA00';
                classroom.color = defaultColor;

                classroom.codiAssignatura = classroom.codi;
                classroom.nom = classroom.title;
                //clasroom.codAula = classroom.domainCode.slice(-1);

                if (object.assignments) {
                    object.assignments.forEach(function(assignment) {
                        if (assignment.assignmentId.domainId == classroom.domainFatherId) {
                            classroom.color = assignment.color;
                        }
                    });
                }
            });
        }

        struct.classrooms = object.classrooms;
        async.each(struct.classrooms, getCalendariAula.bind(null, s), function(err) {
            buildCalendari(struct.calendari, function(err, result) {
                if (err) { console.log(err); return callback(null, struct); }
                return callback(null, struct);
            });
        });
    });

    var getCalendariAula = function(s, aula, callback) {
        activitats.aula(aula.domainFatherId, aula.domainId, s, false, function(err, result) {
            if (err) { console.log(err); return callback(); }
            aula.activitats = result.activitats;
            if (aula.activitats) {
                aula.activitats.forEach(function(activitat) {
                    //TODO GUAITA-34
                    setEventCalendari(struct.calendari, activitat, 'inici', activitat.startDate);
                    setEventCalendari(struct.calendari, activitat, 'fi', activitat.deliveryDate);
                    setEventCalendari(struct.calendari, activitat, 'solució', activitat.solutionDate);
                    setEventCalendari(struct.calendari, activitat, 'qualificació', activitat.qualificationDate);
                });
            }
            return callback();
        });
    }

    var setEventCalendari = function(calendari, activitat, esdeveniment, data) {
        if (data) {
            calendari[data] = calendari[data] ? calendari[data] : [];
            calendari[data].push({
                esdeveniment: esdeveniment,
                activitat: activitat
            });
        }
    }

    var getMesInicial = function(calendari) {
        var primer = Object.keys(calendari)[0];
        return {
            data: primer,
            mes: primer.substring(5, 7),
            any: primer.substring(0, 4)
        }
    }

    var getMesFinal = function(calendari) {
        var ultim = Object.keys(calendari)[Object.keys(calendari).length - 1];
        return {
            data: ultim,
            mes: ultim.substring(5, 7),
            any: ultim.substring(0, 4)
        }
    }

    var buildCalendari = function(calendari, callback) {

        var inici = getMesInicial(struct.calendari);
        var fi = getMesFinal(struct.calendari);

        config.debug(inici);
        config.debug(fi);

        config.debug(inici.any);
        config.debug(inici.mes);

        var cal = new calendar.Calendar(1);
        config.debug(cal.monthDates(
            parseInt(inici.any),
            parseInt(inici.mes),
            function(d) {return (' '+d.getDate()).slice(-2)}
        ));
        return callback();
    }
}