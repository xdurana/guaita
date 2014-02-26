var async = require('async');
var moment = require('moment');
var calendar = require('node-calendar');
//var icalendar = require('icalendar');

var indicadors = require('./indicadors');
var activitats = require('./activitats');
var usuaris = require('./usuaris');
var aules = require('./aules');
var widget = require('./widget');
var config = require('../config');
var ws = require('../ws');

/**
 * Estudiants d'una aula
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 */
exports.all = function(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, callback) {

	var struct = [
	];

	ws.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
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
        da = moment(a.resum.comunicacio.ultimaConnexio, "DD/MM/YYYY");
        db = moment(b.resum.comunicacio.ultimaConnexio, "DD/MM/YYYY");

        if (da.isValid() && db.isValid()) {
            return da.isBefore(db) ? -1 : db.isBefore(da) ? 1 : 0;
        } else {
            return da.isValid() ? 1 : db.isValid() ? -1 : 0;
        }
    }  

	var getResumEstudiant = function(estudiant, callback) {
		estudiant.nomComplert = indicadors.getNomComplert(estudiant.tercer);
        estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
        estudiant.resum = indicadors.getObjectComunicacio();
        async.parallel([
            function(callback) {
                usuaris.getFitxa(estudiant.idp, idp, s, function(err, url) {
                    if (err) { console.log(err); return callback(); }
                    estudiant.fitxa = url;
                    return callback();
                });
            },
            function(callback) {
                ws.lrs.byidpandclassroom(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    estudiant.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return callback();
                });
            },
            function(callback) {
                ws.lrs.byidpandclassroomlast(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    estudiant.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    return callback();
                });
            },
            function(callback) {
                //TODO GUAITA-55
                estudiant.resum.comunicacio.ultimaConnexioCampus = config.nc();
                return callback();
            },
            function(callback) {
                ws.lrs.byidpandclassroomandwidgetlast(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    estudiant.resum.comunicacio.ultimaConnexioWidget = indicadors.getUltimaConnexio(result);
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
 * Estudiants d'una aula (minimalistic version)
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 * @param idp
 * @param s
 */
exports.minimum = function(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, callback) {

    var struct = [
    ];

    ws.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
        if (err) return callback(err, result);
        if (result.out.EstudiantAulaVO) {
            struct = result.out.EstudiantAulaVO;
            async.each(struct, getResumEstudiant, function(err) {
                return callback(err, struct);
            });
        } else {
            return callback(null, struct);
        }
    });

    var getResumEstudiant = function(estudiant, callback) {
        async.parallel([
            function(callback) {
                estudiant.nomComplert = indicadors.getNomComplert(estudiant.tercer);
                estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
                estudiant.resum = indicadors.getObjectComunicacio();
                usuaris.getFitxa(estudiant.idp, idp, s, function(err, url) {
                    if (err) return callback(err, url);
                    estudiant.fitxa = url;
                    return callback();
                });
            }
        ], function(err, results) {
            return callback(err, results);
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

    ws.aulaca.getAulesEstudiant(idp, s, function(err, object) {
        if (err) { console.log(err); return callback(null, struct); }

        struct.classrooms = object.classrooms;
        struct.assignments = object.assignments;
        struct.subjects = object.subjects;
        if (struct.classrooms && struct.classrooms.length > 0) {
            async.each(struct.classrooms, aules.events.bind(null, struct, s), function(err) {
                buildCalendari(function(err, result) {
                    if (err) { console.log(err); return callback(null, struct); }
                    return callback(null, struct);
                });
            });
        } else {
            return callback(null, struct);
        }
    });

    var buildCalendari = function(callback) {

        if (struct.events.length == 0) return callback();

        var today = moment();
        var inici = moment(struct.events[0].data);
        var fi = moment(struct.events[struct.events.length - 1].data);
        fi = today.isAfter(fi) ? today : fi;

        var onward = true;
        var actual = inici;

        struct.actual = {
            year: today.year(),
            month: {
                number: today.month() + 1,
                name: today.format('MMMM')
            }
        }

        while (onward) {
            var monthc = new calendar.Calendar(0).monthdatescalendar(actual.year(), actual.month() + 1);
            var page = {
                year: actual.year(),
                month: {
                    number: actual.month() + 1,
                    name: actual.lang(config.lng()).format('MMMM')
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
                        actual: actual.isSame(date, 'month'),
                        thismonth: actual.isSame(date, 'month') ? '' : 'off',
                        today: moment().isSame(date, 'day') ? 'today' : '',
                        events: day_events,
                        multiple: day_events.length > 1 ? 'multiple' : '',
                        color: day_events.length > 1 ? 'c_neutral' : ''
                    });
                });
                page.weeks.push(week);
            });

            struct.calendar.push(page);
            onward = actual.isBefore(fi);
            actual = actual.add('months', 1);
        }

        struct.ical = geticalendar();

        return callback();
    }
}

var geticalendar = function() {
/*
    var ical = new icalendar.iCalendar();

    var event = new icalendar.VEvent('cded25be-3d7a-45e2-b8fe-8d10c1f8e5a9');

    event.setSummary("Test calendar event");
    event.setDate(new Date(2011,11,1,17,0,0), new Date(2011,11,1,18,0,0));
    event.toString();

    ical.addComponent(event);
    return ical.events();
*/
}