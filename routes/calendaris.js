var async = require('async');
var moment = require('moment');
var calendar = require('node-calendar');

var config = require('../config');
var ws = require('../ws');
var widget = require('../routes/widget');
var activitats = require('../routes/activitats');

var Event = require('../models/event');
var Activity = require('../models/activity');
var Classroom = require('../models/classroom');

/**
 * [docent description]
 * @param  {[type]}   s      [description]
 * @param  {[type]}   idp    [description]
 * @param  {[type]}   perfil [description]
 * @param  {Function} next   [description]
 * @return {[type]}          [description]
 */
var docent = exports.docent = function(s, idp, perfil, next) {

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
}

/**
 * [estudiant description]
 * @param  {[type]}   s    [description]
 * @param  {[type]}   idp  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var estudiant = exports.estudiant = function(s, idp, next) {
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
}

function build(classrooms, idp, s, next) {

    var mostraAula = function(aula, next) {
        async.parallel([
            function(next) {
                widget.one(aula.anyAcademic, aula.codiAssignatura, aula.domainFatherId, aula.numeralAula, aula.domainId, aula.domainCode.slice(0, -3), idp, [], false, s, function(err, result) {
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
                            aula.activitats.push(activitat);
                        });
                    }
                    return next();
                });
            },
        ], function(err, results) {
            return next(err);
        });
    }

    if (classrooms && classrooms.length > 0) {
        async.each(classrooms, mostraAula, function(err) {
            if (err) return next(err);
            show(classrooms, idp, s, function(err, result) {
                return next(err, result);
            });
        });
    } else {
        return next(null, {
            s: s,
            idp: idp,
            classrooms: [],
            events: [],
            items: {},
            calendar: []
        });
    }
}

function show(classrooms, s, idp, next) {

    var struct = {
        s: s,
        idp: idp,
        classrooms: classrooms,
        events: [],
        calendar: []
    };

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

    return next(null, struct);
}