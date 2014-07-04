var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

var async = require('async');

/**
 * Indica si un idp és docent en un domainId
 * @param s
 * @param idp
 * @param domainId
 * @param next
 */
function isDocentAlternative(s, idp, domainId, next) {
    var docent = false;
    var url = config.util.format('%s/assignatures?s=%s&idp=%s',
        config.aulaca(),
        s,
        idp
    );
    service.json(url, function(err, object) {
        if (err) return next(err);
        if (object && object.subjects) {
            object.subjects.forEach(function(assignatura) {
                docent = docent || domainId == assignatura.domainId;
            });
        }
        return next(null, docent);
    });
}

/**
 * Indica si un idp és docent en un domainId
 * @param s
 * @param idp
 * @param domainId
 * @param next
 */
exports.isDocent = function(s, idp, domainId, next) {
    var url = config.util.format('%s/persones/%s/aula/%s/permisos?s=%s',
        config.aulaca(),
        idp,
        domainId,
        s
    );
    service.json(url, function(err, object) {
        object.teacher = object.teacher || false;
        if (!err) return next(err, object.teacher);
        isDocentAlternative(s, idp, domainId, function(err, result) {
            return next(err, result);
        });
    });
};

/**
 * Llista d'assignatures per idp i perfil
 * @param s
 * @param idp
 * @param perfil
 * @param next
 */
exports.getAssignaturesPerIdpPerfil = function(s, idp, perfil, next) {

    var userTypeId = perfil === 'pra' ? 'CREADOR' : 'RESPONSABLE';
    var url = config.util.format('%s/assignatures?s=%s&idp=%s',
        config.aulaca(),
        s,
        idp
    );

    service.json(url, function(err, object) {
        object.subjects = object.subjects || [];
        object.assignments = object.assignments || [];
        if (object.subjects && object.assignments) {
            async.filter(object.subjects,
                function(subject, next) {
                    async.detect(object.assignments,
                        function(assignment, next) {
                            assignment.userTypeId = assignment.userTypeId || null;
                            assignment.assignmentId = assignment.assignmentId || null;
                            return next(assignment.userTypeId == userTypeId && assignment.assignmentId.domainId == subject.domainId);
                        },
                        function(result) {
                            return next(typeof(result) != "undefined");
                        }
                    );
                },
                function(filtered) {
                    object.subjects = filtered;
                    return next(null, object);
                }
            );
        } else {
            return next(null, object);
        }
    });
};

/**
 * Llista d'aules per assignatura
 * @param domainId
 * @param idp
 * @param s
 * @param next
 */
exports.getAulesAssignatura = function(domainId, idp, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules?s=%s&idp=%s',
        config.aulaca(),
        domainId,
        s,
        idp
    );
    service.json(url, function(err, object) {
        object.classrooms = object.classrooms || [];
        return next(err, object.classrooms);
    });
};

/**
 * Llista d'activitats de l'aula
 * @param domainId
 * @param classroomId
 * @param s
 * @param next
 */
exports.getActivitatsAula = function(domainId, classroomId, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules/%s/activitats?s=%s',
        config.aulaca(),
        domainId,
        classroomId,
        s
    );
    service.json(url, function(err, object) {
        object.activities = object.activities || [];
        return next(err, object.activities);
    });
};

/**
 * Llista d'eines per activitat
 * @param domainId
 * @param classroomId
 * @param eventId
 * @param s
 * @param next
 */
exports.getEinesPerActivitat = function(domainId, classroomId, eventId, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules/%s/activitats/%s/eines?s=%s',
        config.aulaca(),
        domainId,
        classroomId,
        eventId,
        s
    );
    service.json(url, function(err, object) {
        object.tools = object.tools || [];
        return next(err, object.tools);
    });
};

/**
 * Llista d'eines per aula
 * @param domainId
 * @param classroomId
 * @param s
 * @param next
 */
exports.getEinesPerAula = function(domainId, classroomId, s, next) {
    var url = config.util.format('%s/assignatures/%s/aules/%s/eines?s=%s',
        config.aulaca(),
        domainId,
        classroomId,
        s
    );
    service.json(url, function(err, object) {
        object.tools = object.tools || [];
        return next(err, object.tools);
    });
};

/**
 * Llista d'aules per estudiant
 * @param idp
 * @param s
 * @param next
 */
exports.getAulesEstudiant = function(idp, s, next) {
    var url = config.util.format(
        '%s/estudiant/%s/aules?s=%s',
        config.aulaca(),
        idp,
        s
    );
    service.json(url, function(err, object) {
        return next(err, object ? object : []);
    });
};

/**
 * GroupServlet
 * @param domainCode
 * @param s
 * @param next
 */
exports.getGroupServlet = function(domainCode, s, next) {
    var url = config.util.format(
        '%s/webapps/classroom/servlet/GroupServlet?dtId=DOMAIN&s=%s&dUId=ALL&dCode=%s',
        config.cv(),
        s,
        domainCode
    );
    service.xml(url, function(err, object) {
        if (err) return next(err);
        return object && object.Dominis.domini ? next(err, object.Dominis.domini) : next("No s'ha trobat el domini");
    });
};

/**
 * Obtenir identificador userid a partir de l'idp
 * @param idp
 * @param s
 * @param next
 */
exports.getUserIdPerIdp = function(idp, s, next) {
    var url = config.util.format(
        '%s/usuaris/%s/id?s=%s',
        config.aulaca(),
        idp,
        s
    );
    service.json(url, function(err, object) {
        object.userId = object.userId || -1;
        return next(err, object.userId);
    });
};

/**
 * Última connexió al campus
 * @param idp
 * @param s
 * @param next
 */
exports.getUltimaConnexioCampus = function(idp, s, next) {
    var url = config.util.format(
        '%s/persones/%s/connexio?s=%s',
        config.aulaca(),
        idp,
        s
    );
    service.json(url, function(err, object) {
        object.lastConnectionToCampus = object.lastConnectionToCampus || config.nc();
        return next(err, object.lastConnectionToCampus);
    });
};

/**
 * Llista de sales assignades a un idp
 * @param idp
 * @param s
 * @param next
 */
exports.getSales = function(idp, s, next) {
    var url = config.util.format(
        '%s/estudiant/%s/sales?s=%s',
        config.aulaca(),
        idp,
        s
    );
    service.json(url, function(err, object) {
        object.rooms = object.rooms || [];
        return next(err, object.rooms);
    });
};

/**
 * Llista de fonts d'informació per assignatura
 * @param anyAcademic
 * @param codAssignatura
 * @param s
 * @param next
 */
exports.getFontsInformacioAssignatura = function(anyAcademic, codAssignatura, s, next) {
    var url = config.util.format(
        '%s/anyacademic/%s/codiassignatura/%s/fontsinformacio?s=%s',
        config.aulaca(),
        anyAcademic,
        codAssignatura,
        s
    );
    service.json(url, function(err, object) {
        object.informationSources = object.informationSources || [];
        return next(err, object.informationSources);
    });
};

/**
 * Nou servei pel widget v2 de l'aula
 * @param subjectid
 * @param classroomid
 * @param s
 * @param next
 */
exports.getWidgetAula = function(subjectid, classroomid, s, next) {
    var url = config.util.format(
        '%s/assignatures/%s/aules/%s/widget?s=%s',
        config.aulaca(),
        subjectid,
        classroomid,
        s
    );    
    service.json(url, function(err, object) {
        return next(err, object);
    });
};

/**
 * Indicadors de missatges per eina
 * @param subjectid
 * @param classroomid
 * @param resourceid
 * @param s
 * @param next
 */
exports.getIndicadorsEines = function(subjectid, classroomid, resourceid, s, next) {
    var url = config.util.format(
        '%s/LoadResource.action?s=%s&classroomId=%s&subjectId=%s&sectionId=-1&resourceId=%s&pageSize=0&pageCount=0',
        config.aulaca(),
        s,
        classroomid,
        subjectid,
        resourceid
    );    
    service.json(url, function(err, object) {
        return next(err, object);
    });
};

/**
 * Enllaç de la fitxa d'una assignatura
 * @param anyAcademic
 * @param codAssignatura
 */
exports.getFitxaAssignatura = function(anyAcademic, codAssignatura) {
    return config.util.format(
        '%s/tren/trenacc/web/GAT_EXP.PLANDOCENTE?any_academico=%s&cod_asignatura=%s&idioma=CAT&pagina=PD_PREV_PORTAL&cache=S',
        config.cv(),
        anyAcademic,
        codAssignatura
    );
};

/**
 * Indica si l'aula és una aula nova
 * @param aula
 * @returns {boolean}
 */
exports.isAulaca = function(aula) {
    return aula.presentation == 'AULACA';
};

/**
 * Enllaç a l'aula
 * @param s
 * @param isAulaca
 * @param subjectId
 * @param classroomId
 * @param domainCode
 * @returns {*}
 */
exports.getLinkAula = function(s, isAulaca, subjectId, classroomId, domainCode) {
    return isAulaca ? config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&subjectId=%s&classroomId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        classroomId,
        subjectId,
        classroomId
    ) : config.util.format(
        '%s/webapps/classroom/081_common/jsp/iniciAula.jsp?s=%s&domainId=%s&domainCode=%s&img=aules&preview=1&idLang=a&ajax=true',
        config.cv(),
        s,
        classroomId,
        domainCode
    );
};

/**
 * Enllaç a l'activitat d'una aula
 * @param s
 * @param isAulaca
 * @param subjectId
 * @param classroomId
 * @param domainCode
 * @param eventId
 * @returns {*}
 */
exports.getLinkActivitat = function(s, isAulaca, subjectId, classroomId, domainCode, eventId) {
    return isAulaca ? config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&subjectId=%s&classroomId=%s&activityId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        classroomId,
        subjectId,
        classroomId,
        eventId
    ) : getLinkAula(s, isAulaca, subjectId, classroomId, domainCode);
};

/**
 * Enllaç al disseny d'una aula
 * @param s
 * @param isAulaca
 * @param subjectId
 * @param classroomId
 * @returns {*}
 */
exports.getLinkDissenyAula = function(s, isAulaca, subjectId, classroomId) {
    return isAulaca ? config.util.format(
        '%s/Edit.action?s=%s&domainId=%s&subjectId=%s&classroomId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        classroomId,
        subjectId,
        classroomId
    ) : config.util.format(
        '%s/webapps/classroom/classroom.do?nav=dissenydomini_inici&s=%s&domainId=%s&domainTypeId=AULA&idLang=a&ajax=true',
        config.cv(),
        s,
        classroomId
    );
};

/**
 * Enllaç a la sala amb dret d'examen
 * @param s
 * @param domainId
 * @returns {*}
 */
exports.getLinkSala = function(s, domainId) {
    return config.util.format('%s/webapps/classroom/sala.do?nav=sala_inici&s=%s&domainId=%s', config.cv(), s, domainId);
};
