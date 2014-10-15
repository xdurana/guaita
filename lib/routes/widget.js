var async = require('async');

var indicadors = require(__base + '/lib/routes/indicadors');
var activitats = require(__base + '/lib/routes/activitats');
var aules = require(__base + '/lib/routes/aules');
var eines = require(__base + '/lib/routes/eines');
var config = require(__base + '/config');
var ws = require(__base + '/lib/services/ws');

/**
 * Widget de l'aula v2
 * @param anyAcademic
 * @param codAssignatura
 * @param subjectId
 * @param codAula
 * @param classroomId
 * @param domainCode
 * @param idp
 * @param libs
 * @param up_maximized
 * @param s
 * @param next
 */
exports.two = function(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, libs, up_maximized, s, next) {

    var struct = {
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: subjectId,
        subjectId: subjectId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
        idp: idp,
        s: s,
        libs: libs,
        style: up_maximized == 'false' ? 'display:none' : 'display:block',
        lang: config.lng(),
        docent: false,
        missatgesPendents: 0,
        contrast: false
    };

    struct.link = config.util.format(
        '%s/app/guaita/assignatures/%s/%s/%s/aules/%s/%s/%s/widget?idp=%s&s=%s',
        config.cv(),
        anyAcademic,
        codAssignatura,
        subjectId,
        codAula,
        classroomId,
        domainCode,
        idp,
        s
    );

    var setEina = function(eina, docent, indicadors) {
        var e = {};
        e.viewItemsUrl = eina.viewItemsUrl;
        e.nom = eina.translatedDescription;
        e.resourceId = eina.resourceId;
        e.idTipoLink = eina.idTipoLink;
        e.mostrar = (eina.visible == 0 || eina.visible == 1 && docent);
        return e;
    };

    var getIndicadorsEines = function(eina, next) {
        ws.aulaca.getIndicadorsEines(subjectId, classroomId, eina.resourceId, s, function(err, indicadors) {
            if (err) return next(err);
            if (indicadors.resource) {
                eina.num_msg_pendents = Math.max(indicadors.resource.newItems, 0);
                eina.num_msg_totals = indicadors.resource.totalItems;
                struct.missatgesPendents += eina.num_msg_pendents;
                eina.num_msg_pendents_class = eina.num_msg_pendents > 0 ? 'nous' : 'nous cap';
            }
            return next();
        });
    };

    ws.aulaca.isDocent(s, idp, subjectId, function(err, result) {
        if (err) return next();
        struct.docent = result;

        ws.aulaca.getWidgetAula(subjectId, classroomId, s, function(err, result) {

            if (err) return next(err);
            if (!(result.widget && result.widget.classroom)) return next("No s'ha pogut carregar el widget de l'aula");

            struct.nomAssignatura = result.widget.classroom.widgetTitle.replace("´","'");
            struct.isAulaca = result.widget.classroom.presentation == 'AULACA';

            struct.color = result.widget.color;
            struct.urlAula = result.widget.classroomAccessUrl;
            struct.connectedStudentsAccessUrl = result.widget.connectedStudentsAccessUrl;

            if (result.widget.assessmentSystems && result.widget.assessmentSystems.length > 0) {
                struct.avaluacio = result.widget.assessmentSystems[0].links;
            }

            struct.consultor = null;
            result.widget.referenceUsers.forEach(function(ru) {
                struct.consultor = {
                    fitxa: ru.userResume,
                    nomComplert: ru.fullName
                }
            });

            struct.activa = {
                link: result.widget.currentActivity.accessUrl,
                name: result.widget.currentActivity.name,
                startDateStr: result.widget.currentActivity.startDateStr,
                deliveryDateStr: result.widget.currentActivity.deliveryDateStr,
                eines: []
            };

            result.widget.currentActivity.resources.forEach(function(eina) {
                struct.activa.eines.push(setEina(eina, struct.docent));
            });
//            async.each(struct.activa.eines, getIndicadorsEines);

            struct.connectats = 0;
            result.widget.studentUsers.forEach(function(student) {
                struct.connectats += student.connected ? 1 : 0;
            });

            struct.eines = [];
            result.widget.classroomResources.forEach(function(eina) {
                struct.eines.push(setEina(eina, struct.docent));
            });

            return next(null, struct);
            async.each(struct.eines, getIndicadorsEines, function(err) {
                return next(null, struct);
            });
        });
    });
};
