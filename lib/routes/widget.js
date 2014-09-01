var async = require('async');

var indicadors = require(__base + '/lib/routes/indicadors');
var activitats = require(__base + '/lib/routes/activitats');
var aules = require(__base + '/lib/routes/aules');
var eines = require(__base + '/lib/routes/eines');
var config = require(__base + '/config');
var ws = require(__base + '/lib/services/ws');

var Tercer = require(__base + '/lib/models/tercer');

/**
 * Widget de l'aula v1 (GroupServlet version)
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
exports.one = function(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, libs, up_maximized, s, next) {

    if (domainCode.indexOf('ibp') == 0 || domainCode.indexOf('fc') == 0) {
        domainCode = config.util.format('%s_%s', domainCode, codAula);
    } else {
        domainCode = config.util.format('%s_%s', domainCode, parseInt(codAula) > 9 ? codAula : "0" + codAula);
    }

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
        lang: config.lng()
    };

    async.parallel([
        function (next) {
            eines.aulaidp(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, s, false, function(err, result) {
                if (err) return next();
                struct.eines = result.eines;                
                return next();
            });
        },
        function (next) {
            activitats.actives(subjectId, classroomId, s, function(err, result) {
                if (err) return next();
                struct.actives = result.activitats;
                return next();
            });
        },
        function (next) {
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {

                //GUAITA-199
                //Mostrar el widget encara que no respongui el GroupServlet
                if (err) {
                    struct.missatgesPendents = '?';
                    struct.connectats = '?';
                    struct.color = '90AA11';
                    ws.infoacademica.getAssignaturaByCodi(anyAcademic, codAssignatura, function(err, result) {
                        if (err) return next();
                        struct.nomAssignatura = result.out.descAssignatura;
                        return next();
                    });
                } else {
                    struct.nomAssignatura = indicadors.decodeHtmlEntity(result[0].titol[0]);
                    struct.recursos = result ? result[0].recurs : [];
                    struct.missatgesPendents = result[0]['$']['numMsgPendents'];
                    struct.connectats = result[0]['$']['conectats'];
                    struct.domainCode = result[0]['$']['code'];

                    var idTipoPresent = result[0]['$']['idTipoPresent'];
                    struct.isAulaca = idTipoPresent.match(/AULACA/) ? true : false;
                    struct.urlAula = ws.aulaca.getLinkAula(s, struct.isAulaca, subjectId, classroomId, domainCode);

                    struct.color = result[0].color[0];
                    struct.perfils = result ? (result[0].perfils ? result[0].perfils : []) : [];

                    struct.perfils.forEach(function(perfil) {
                        if (perfil['$']['tipus'] === 'CREADOR' && perfil.user) {
                            struct.consultor = new Tercer({
                                idp: perfil.user[0]['$']['id'],
                                nomComplert: indicadors.decodeHtmlEntity(perfil.user[0]['$']['nom'])
                            });
                            struct.consultor.getFitxaUserId(struct.consultor.idp, idp, s, function(err, url) {
                                struct.consultor.fitxa = url;
                            });
                        }
                    });

                    struct.perfils.forEach(function(perfil) {
                        if (perfil['$']['tipus'] === 'RESPONSABLE' && perfil.user) {
                            struct.consultor = new Tercer({
                                idp: perfil.user[0]['$']['id'],
                                nomComplert: indicadors.decodeHtmlEntity(perfil.user[0]['$']['nom'])
                            });
                            struct.consultor.getFitxaUserId(struct.consultor.idp, idp, s, function(err, url) {
                                struct.consultor.fitxa = url;
                            });
                        }
                    });

                    return next();
                }
            });
        },
        function (next) {
            ws.aulaca.isDocent(s, idp, subjectId, function(err, result) {
                if (err) {
                    struct.docent = false;
                }
                struct.docent = result;
                struct.urlAvaluacio = indicadors.getUrlRAC(s, classroomId, struct.docent);
                return next();
            });
        }
    ], function(err, results) {
        if (err) return next(err);
        calcularIndicadorsEines(struct.eines, struct.recursos);
        if (true && struct.actives && struct.actives.length > 0) {
            async.each(struct.actives, getEinesActivitat, function(err) {
                return next(err, struct);
            });
        } else {
            return next(null, struct);
        }
    });

    var calcularIndicadorsEines = function(eines, recursos) {
        if (eines) {
            eines.forEach(function(eina) {
                eina.num_msg_pendents = "-";
                eina.num_msg_totals = "-";
                if (eina.viewItemsUrl.indexOf("http") < 0) {
                    eina.viewItemsUrl = config.util.format('%s%s', config.cv(), eina.viewItemsUrl);
                }

                eina.viewItemsUrl = eina.viewItemsUrl.replace("$PREVIEW$", '1');
                eina.mostrar = (eina.visible == 0 || eina.visible == 1 && struct.docent);
                if (recursos) {
                    recursos.forEach(function(recurs) {
                        try {
                            if (recurs['$'].resourceId == eina.resourceId || (recurs['$'].tipus === 'GROUPFATHER' && eina.idTipoLink === 'GROUPFATHER')) {
                                eina.viewItemsUrl = (eina.idTipoLink == 'MICROBLOG' && struct.isAulaca ? struct.urlAula : eina.viewItemsUrl);
                                eina.num_msg_pendents = Math.max(recurs.num_msg_pendents[0], -1);
                                eina.num_msg_totals = Math.max(recurs.num_msg_totals[0], recurs.num_msg_pendents[0]);
                            }
                        } finally {
                        }
                    });
                }
                eina.num_msg_pendents_class = eina.num_msg_pendents > 0 ? 'nous' : 'nous cap';
            });
        }
    };

    var getEinesActivitat = function(activitat, next) {
        activitat.link = ws.aulaca.getLinkActivitat(s, struct.isAulaca, subjectId, classroomId, struct.domainCode, activitat.eventId);
        return next();
        calcularIndicadorsEines(activitat.eines, struct.recursos);
        ws.aulaca.getEinesPerActivitat(subjectId, classroomId, activitat.eventId, s, function(err, result) {
            if (err) return next(err);
            activitat.eines = result;
            activitat.startDateStr = activitat.startDateStr.replace(/-/g, '/');
            activitat.deliveryDateStr = activitat.deliveryDateStr.replace(/-/g, '/');
            return next();
        });
    }
};

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
        missatgesPendents: 0
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

            struct.nomAssignatura = result.widget.classroom.widgetTitle.replace("´","'");
            struct.isAulaca = result.widget.classroom.presentation == 'AULACA';

            struct.color = result.widget.color;
            struct.urlAula = result.widget.classroomAccessUrl;
            struct.urlAula = ws.aulaca.getLinkAula(s, struct.isAulaca, subjectId, classroomId, domainCode);
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
                link: result.widget.currentActivityAccessUrl,
                name: result.widget.currentActivity.name,
                startDateStr: result.widget.currentActivity.startDateStr,
                deliveryDateStr: result.widget.currentActivity.deliveryDateStr,
                eines: []
            };

            if (!struct.activa.link ) {
                ws.aulaca.getLinkActivitat(s, struct.isAulaca, subjectId, classroomId, domainCode, result.widget.currentActivity.eventId);
            }

            struct.connectats = 0;
            result.widget.studentUsers.forEach(function(student) {
                struct.connectats += student.connected ? 1 : 0;
            });

            struct.urlAvaluacio = indicadors.getUrlRAC(s, classroomId, struct.docent);

            struct.eines = [];
            result.widget.classroomResources.forEach(function(eina) {
                struct.eines.push(setEina(eina, struct.docent));
            });
            async.each(struct.eines, getIndicadorsEines, function(err) {
                return next(null, struct);
            });
        });
    });
};
