var async = require('async');
var moment = require('moment');
var calendar = require('node-calendar');

var indicadors = require('./indicadors');
var activitats = require('./activitats');
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
                
                //TODO GUAITA-46
                //struct.sort(ordenaEstudiants);

    			return callback(null, struct);
    		});
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
	});

    var ordenaEstudiants = function(a, b) {
        da = new Date(a.resum.comunicacio.ultimaConnexio);
        db = new Date(b.resum.comunicacio.ultimaConnexio);
        return da < db ? -1 : da > db ? 1 : 0;
    }  

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
        events: [
        ],
        items: {
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
        if (struct.classrooms && struct.classrooms.length > 0) {
            async.each(struct.classrooms, getCalendariAula.bind(null, s), function(err) {
                buildCalendari(function(err, result) {
                    if (err) { console.log(err); return callback(null, struct); }
                    return callback(null, struct);
                });
            });
        } else {
            return callback(null, struct);
        }
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

            struct.events.sort(ordenaEvents);
            return callback();
        });
    }

    var ordenaEvents = function(a, b) {
        return a.data < b.data ? -1 : b.data < a.data ? 1 : 0;
    }

    var setEventCalendari = function(calendari, activitat, esdeveniment, data) {
        if (data) {
            struct.events.push({
                tipus: esdeveniment,
                activitat: activitat,
                data: moment(data).format("YYYY-MM-DD")
            });
        }
    }

    var buildCalendari = function(callback) {

        var inici = moment(struct.events[0].data);
        var fi = moment(struct.events[struct.events.length - 1].data);

        struct.calendari = new calendar.Calendar(2).monthdatescalendar(moment().year(), moment().month() + 1);
        struct.calendari.forEach(function(week) {
            week.forEach(function(day) {
                date = moment(day).format("YYYY-MM-DD");
                struct.items[date] = new Array(struct.events.filter(function(event) {
                    return event.data === date;
                }));
            });
        });

        return callback();
    }
}