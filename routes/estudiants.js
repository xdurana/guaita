var async = require('async');
var moment = require('moment');
var calendar = require('node-calendar');

var indicadors = require('./indicadors');
var activitats = require('./activitats');
var widget = require('./widget');
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
                struct.sort(ordenaEstudiants);
    			return callback(null, struct);
    		});
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
	});

    var ordenaEstudiants = function(a, b) {
        da = moment(a.resum.comunicacio.ultimaConnexio, "DD-MM-YYYY");
        db = moment(b.resum.comunicacio.ultimaConnexio, "DD-MM-YYYY");

        if (da.isValid() && db.isValid()) {
            return da.isBefore(db) ? -1 : db.isBefore(da) ? 1 : 0;
        } else {
            return da.isValid() ? 1 : db.isValid() ? -1 : 0;
        }
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
        events: [],
        items: {},
        calendar: []
    };

    aulaca.getAulesEstudiant(idp, s, function(err, object) {
        if (err) { console.log(err); return callback(null, struct); }
        struct.classrooms = object.classrooms;
        struct.assignments = object.assignments;
        struct.subjects = object.subjects;
        if (struct.classrooms && struct.classrooms.length > 0) {
            async.each(struct.classrooms, getAulaInfo.bind(null, struct, s), function(err) {
                buildCalendari(function(err, result) {
                    if (err) { console.log(err); return callback(null, struct); }
                    return callback(null, struct);
                });
            });
        } else {
            return callback(null, struct);
        }
    });

    var getAulaInfo = function(struct, s, aula, callback) {

        aula.link = indicadors.getLinkAula(s, indicadors.isAulaca(aula), aula.domainId, aula.domainCode);
        aula.color = '66AA00';
        aula.codiAssignatura = aula.codi;
        aula.nom = aula.title;
        aula.codAula = aula.domainCode.slice(-1);

        if (struct.assignments) {
            struct.assignments.forEach(function(assignment) {
                if (assignment.assignmentId.domainId == aula.domainFatherId) {
                    aula.color = assignment.color;
                }
            });
        }                

        //config.debug(struct);

        async.parallel([
            function(callback) {
                widget.one(
                    aula.anyAcademic,
                    aula.codiAssignatura,
                    aula.domainFatherId,
                    aula.codAula,
                    aula.domainId,
                    aula.domainCode,
                    idp,
                    s,
                    function(err, result) {
                        if (err) { console.log(err); return callback(); }
                        aula.widget = result;
                        return callback();
                    }
                );
            },
            function(callback) {
                activitats.aula(
                    aula.anyAcademic,
                    aula.codiAssignatura,
                    aula.domainFatherId,
                    aula.codAula,
                    aula.domainId,
                    aula.domainCode,
                    s,
                    false,
                    function(err, result) {
                        if (err) { console.log(err); return callback(); }
                        aula.activitats = result.activitats;
                        if (aula.activitats) {
                            aula.activitats.forEach(function(activitat) {
                                activitat.link = indicadors.getLinkActivitat(s, indicadors.isAulaca(aula), aula.domainId, aula.domainCode, activitat.eventId);
                                if (activitat.qualificationDate) {
                                    setEventCalendari(struct.calendari, activitat, 'PI', activitat.startDate);
                                    setEventCalendari(struct.calendari, activitat, 'PL', activitat.deliveryDate);
                                    setEventCalendari(struct.calendari, activitat, 'PS', activitat.solutionDate);
                                    setEventCalendari(struct.calendari, activitat, 'PQ', activitat.qualificationDate);
                                    activitat.aula = aula.nom;
                                    activitat.color = aula.color;
                                    activitat.name = indicadors.decodeHtmlEntity(activitat.name);
                                    activitat.domainId = aula.domainId;
                                }
                            });
                        }
                        struct.events.sort(ordenaEvents);
                        return callback();
                    }
                );
            },
        ], function(err, results) {
            if (err) { console.log(err); }
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
                data: moment(data).format("YYYY-MM-DD"),
                destacat: esdeveniment === 'PL' ? 'event-destacat' : 'event'
            });
        }
    }

    var buildCalendariAnt = function(callback) {

        var inici = moment(struct.events[0].data);
        var fi = moment(struct.events[struct.events.length - 1].data);
        
        var monthc = new calendar.Calendar(0).monthdatescalendar(moment().year(), moment().month() + 1);
        monthc.forEach(function(weekc) {
            var week = [];
            weekc.forEach(function(dayc) {
                var date = moment(dayc).format("YYYY-MM-DD");
                week.push({
                    date: date,
                    day: moment(dayc).format("DD"),
                    actual: moment().isSame(date, 'month') ? '' : 'off',
                    events: struct.events.filter(function(event) {
                        return event.data === date;
                    })
                });
            });
            struct.calendar.push(week);
        });

        return callback();
    }

    var buildCalendari = function(callback) {

        var inici = moment(struct.events[0].data);
        var fi = moment(struct.events[struct.events.length - 1].data);

        var onward = true;
        var actual = inici;

        struct.actual = {
            year: moment().year(),
            month: {
                number: moment().month() + 1,
                name: moment().format('MMMM')
            }
        }

        while (onward) {
            var monthc = new calendar.Calendar(0).monthdatescalendar(actual.year(), actual.month() + 1);
            var page = {
                year: actual.year(),
                month: {
                    number: actual.month() + 1,
                    name: actual.format('MMMM')
                },
                weeks: []
            }

            monthc.forEach(function(weekc) {
                var week = [];
                weekc.forEach(function(dayc) {
                    var date = moment(dayc).format("YYYY-MM-DD");
                    var day_events = struct.events.filter(function(event) {
                        return event.data === date;
                    });
                    week.push({
                        date: date,
                        day: moment(dayc).format("DD"),
                        actual: actual.isSame(date, 'month') ? '' : 'off',
                        events: day_events,
                        multiple: day_events.length > 1 ? 'multiple' : ''
                    });
                });
                page.weeks.push(week);
            });

            struct.calendar.push(page);
            actual = actual.add('months', 1);
            onward = actual.isBefore(fi);
        }

        //config.debug(struct.calendar[1]);

        return callback();
    }
}