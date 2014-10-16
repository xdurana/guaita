var async = require('async');
var moment = require('moment');
var calendar = require('node-calendar');

var config = require(__base + '/config');
var ws = require(__base + '/lib/services/ws');

var icalg = require(__base + '/lib/routes/ical-generator');
var widget = require(__base + '/lib/routes/widget');
var activitats = require(__base + '/lib/routes/activitats');

var Activity = require(__base + '/lib/models/activity');
var Classroom = require(__base + '/lib/models/classroom');

/**
 * Calendari en format iCal
 * @param object
 * @returns {*}
 */
exports.getiCal = function(object) {
    object.ical = icalg();
    object.ical.setDomain('uoc.edu').setName('calendari aules');
    object.events.forEach(function(e) {
        var date = moment(e.data, "YYYY-MM-DD").format("YYYYMMDD");
        var summary = config.util.format('%s [%s] (%s)', e.activitat.name, e.activitat.aula, e.tooltip);
        object.ical.addEvent({
            start: date,
            summary: summary
        });
    });
    return object.ical.toString();
};

/**
 * Calendari del docent
 * @param s
 * @param idp
 * @param perfil
 * @param next
 */
exports.docent = function(s, idp, perfil, next) {

    ws.aulaca.getAssignaturesPerIdpPerfil(s, idp, perfil, function(err, object) {
        if (err) return next(err);
        var assignatures = object.subjects || [];
        async.each(assignatures, getaules.bind(null, object.assignments), function(err) {
            if (err) return next(err);
            var classrooms = [];
            assignatures.forEach(function(assignatura) {
                classrooms = classrooms.concat(assignatura.aules);
            });
            build(classrooms, idp, s, function(err, object) {
                return next(err, object);
            });
        });
    });

    var getaules = function(assignments, assignatura, next) {
        assignatura.aules = [];
        ws.aulaca.getAulesAssignatura(assignatura.domainId, idp, s, function(err, object) {
            if (err) return next(err);
            if (object) {
                object.forEach(function(c) {
                    var classroom = new Classroom(c, s, assignments);
                    assignatura.aules.push(classroom);
                });
            }
            return next();
        });
    }
};

/**
 * Calendari de l'estudiant
 * @param s
 * @param idp
 * @param next
 */
exports.estudiant = function(s, idp, next) {
    var classrooms = [];
    ws.aulaca.getAulesEstudiant(idp, s, function(err, object) {
        if (err) return next(err);
        if (object.classrooms) {
            object.classrooms.forEach(function(c) {
                classrooms.push(new Classroom(c, s, object.assignments));
            });
        }
        build(classrooms, idp, s, function(err, object) {
            return next(err, object);
        });
    });
};

/**
 * Construir estructura per mostrar el calendari
 * @param classrooms
 * @param idp
 * @param s
 * @param next
 */
var build = function(classrooms, idp, s, next) {

    var struct = {
        s: s,
        idp: idp,
        classrooms: classrooms,
        aulaca: config.aulaca(),
        events: [],
        calendar: []
    };

    /**
     * Construir els widgets de les aules
     * @param aula
     * @param next
     */
    var mostraAula = function(aula, next) {
        async.parallel([
            function(next) {
                var domainCodeAula = aula.domainCode.split('_');
                domainCodeAula.pop();
                domainCodeAula = domainCodeAula.join('_');
                widget.two(aula.anyAcademic, aula.codiAssignatura, aula.domainFatherId, aula.numeralAula, aula.domainId, domainCodeAula, idp, [], false, s, function(err, result) {
                    if (err) return next(err);
                    aula.widget = result;
                    return next();
                });
            },
            function(next) {
                activitats.aula(aula.anyAcademic, aula.codiAssignatura, aula.domainFatherId, aula.codAula, aula.domainId, aula.domainCode, s, false, function(err, result) {
                    if (err) return next(err);
                    if (result.activitats) {
                        result.activitats.forEach(function(a) {
                            var activitat = new Activity(a, aula, s);
                            if (activitat.eventTypeId == 28 || activitat.eventTypeId == 29) {
                                aula.activitats.push(activitat);
                            }
                        });
                    }
                    return next();
                });
            }
        ], function(err) {
            return next(err);
        });
    };

    ws.aulaca.getSales(idp, s, function(err, rooms) {
        if (err) return next(err);

        if (rooms) {
            struct.rooms = rooms;
            rooms.forEach(function(room) {
                room.url = ws.aulaca.getLinkSala(s, room.domainId);
            });
        }

        if (classrooms && classrooms.length > 0) {
            async.each(classrooms, mostraAula, function(err) {
                if (err) return next(err);
                show(classrooms, idp, s, struct, function(err, result) {
                    return next(err, result);
                });
            });
        } else {
            return next(null, {
                s: s,
                idp: idp,
                classrooms: [],
                rooms: rooms,
                events: [],
                items: {},
                calendar: []
            });
        }
    });
};

/**
 * Mostrar calendari semestral i mensual
 * @param classrooms
 * @param s
 * @param idp
 * @param struct
 * @param next
 * @returns {*}
 */
var show = function(classrooms, s, idp, struct, next) {

    if (classrooms) {
        classrooms.forEach(function(classroom) {
            if (classroom.activitats) {
                classroom.activitats.forEach(function(activity) {
                    struct.events = struct.events.concat(activity.events);
                });
            }
        });
    }

    if (struct.events.length == 0) return next(null, struct);
    struct.events.sort(function(a, b) {
        return a.data < b.data ? -1 : b.data < a.data ? 1 : 0;
    });

    var today = moment();
    var inici = moment(struct.events[0].data);
    var fi = moment(struct.events[struct.events.length - 1].data);
    fi = today.isAfter(fi) ? today : fi;

    inici = inici.isBefore(moment().subtract(5, 'years')) ? moment().subtract(5, 'years') : inici;
    fi = fi.isAfter(moment().add(5, 'years')) ? moment().add(5, 'years') : fi;

    var onward = true;
    var actual = inici;

    struct.actual = {
        year: today.year(),
        month: {
            number: today.month() + 1,
            name: today.format('MMMM')
        }
    };

    while (onward) {
        var monthc = new calendar.Calendar(0).monthdatescalendar(actual.year(), actual.month() + 1);
        var page = {
            year: actual.year(),
            month: {
                number: actual.month() + 1,
                name: actual.lang(config.lng()).format('MMMM')
            },
            weeks: []
        };

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

    return next(null, struct);
};