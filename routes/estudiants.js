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
            getCalendari(function(err, result) {
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
            }

            return callback();
        });
    }

    var getCalendari = function(callback) {
        var cal = new calendar.Calendar(1);
        /*
        config.debug(cal);
        config.debug(cal.monthDates(
            2013,
            8,
            function(d) {return (' '+d.getDate()).slice(-2)}
        ));
        */
        return callback();
    }    
}