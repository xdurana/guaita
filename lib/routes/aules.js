var config = require(__base + '/config');
var ws = require(__base + '/lib/services/ws');

var indicadors = require(__base + '/lib/routes/indicadors');
var activitats = require(__base + '/lib/routes/activitats');
var aules = require(__base + '/lib/routes/aules');
var estudiants = require(__base + '/lib/routes/estudiants');
var consultors = require(__base + '/lib/routes/consultors');
var assignatures = require(__base + '/lib/routes/assignatures');
var widget = require(__base + '/lib/routes/widget');

var Event = require(__base + '/lib/models/event');
var Activity = require(__base + '/lib/models/activity');
var Consultor = require(__base + '/lib/models/consultor');

var async = require('async');

var all = exports.all = function(anyAcademic, codAssignatura, subjectId, idp, s, perfil, next) {

    var struct = {
        s: s,
        idp: idp,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: subjectId,
        subjectId: subjectId,
        dataLliurament: config.nc(),
        linkfitxaassignatura: config.util.format("http://cv.uoc.edu/tren/trenacc/web/GAT_EXP.PLANDOCENTE?any_academico=%s&cod_asignatura=%s&idioma=CAT&pagina=PD_PREV_PORTAL&cache=S", anyAcademic, codAssignatura),
        isAulaca: false,
        aules: [
        ]
    }

    ws.aulaca.getAulesAssignatura(subjectId, idp, s, function(err, aules) {
        if (err) return next(err);
        async.parallel([
            function (next) {
                if (aules) {
                    async.each(aules, procesa.bind(null, anyAcademic, codAssignatura, idp, s, perfil), function(err) {
                        if (err) return next(err);
                        struct.aules.sort(ordenaAules);
                        struct.linkedicioaula = getLinkDissenyAula(s, struct.aules.length > 0 ? struct.aules[0].isAulaca : true, subjectId, subjectId);
                        return next();
                    });
                } else return next();
            }
        ], function(err, result) {
            return next(err, struct);
        });
    }); 

    /**
     * [procesa description]
     * @param  {[type]}   anyAcademic    [description]
     * @param  {[type]}   codAssignatura [description]
     * @param  {[type]}   idp            [description]
     * @param  {[type]}   s              [description]
     * @param  {[type]}   perfil         [description]
     * @param  {[type]}   classroom      [description]
     * @param  {Function} next       [description]
     * @return {[type]}                  [description]
     */
    var procesa = function(anyAcademic, codAssignatura, idp, s, perfil, classroom, next) {

        classroom.isAulaca = isAulaca(classroom);
        classroom.codAula = classroom.domainCode.slice(-1);
        classroom.color = 'FF2600';
        classroom.codAssignatura = classroom.codi;
        classroom.subjectId = classroom.domainFatherId;
        classroom.classroomId = classroom.domainId;
        classroom.link = aules.getLinkAula(s, classroom.isAulaca, classroom.subjectId, classroom.classroomId, classroom.domainCode);
        classroom.linkdetall = config.util.format(
            '/app/guaita/assignatures/%s/%s/%s/aules/%s/%s/%s?s=%s&idp=%s',
            anyAcademic,
            classroom.codAssignatura,
            classroom.subjectId,
            classroom.codAula,
            classroom.classroomId,
            classroom.domainCode,
            s,
            idp
        );

        Consultor.aula(anyAcademic, codAssignatura, classroom.codAula, idp, s, function(err, result) {
            if (err) return next(null, classroom);
            classroom.consultor = result;
            struct.aules.push(classroom);
            if (perfil == 'pra' || classroom.consultor.idp == idp) {
                resum(s, idp, anyAcademic, codAssignatura, classroom, classroom.codAula, function(err, result) {
                    if (err) return next(null, classroom);
                    consultors.getResumEines(classroom, s, function(err, result) {
                        return next(null, classroom);
                    });
                });
            } else next(null, classroom);
        });
    }

    var ordenaAules = function(a, b) {
        return a.codAula < b.codAula ? -1 : b.codAula < a.codAula ? 1 : 0;
    }
}

var resum = exports.resum = function(s, idp, anyAcademic, codAssignatura, classroom, codAula, next) {

    classroom.resum = {
        estudiants: {
            total: config.nc(),
            repetidors: config.nc()
        },
        comunicacio: {
            clicsAcumulats: config.nc(),
            lecturesPendentsAcumulades: config.nc(),
            lecturesPendents: config.nc(),
            participacions: config.nc()
        },
        avaluacio: {
            seguiment: config.nc(),
            superacio: config.nc(),
            dataLliurament: config.nc()
        }
    };

    async.parallel([
        function (next) {
            ws.rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
                if (err) return next();
                classroom.resum.estudiants.total = result.out.numPlacesAssignades;
                return next();
            });
        },
        function (next) {
            ws.rac.calcularIndicadorsAula('RAC_PRA_2', codAssignatura, anyAcademic, codAula, codAula, '0', '0', function(err, result) {
                if (err) return next();
                classroom.resum.estudiants.repetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
                return next();
            });
        },
        function (next) {
            ws.rac.calcularIndicadorsAula('RAC_CONSULTOR_AC', codAssignatura, anyAcademic, codAula, codAula, '0', '0', function(err, result) {
                if (err) return next();
                classroom.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
                classroom.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
                return next();
            });
        },
        function (next) {
            ws.lrs.byclassroom(classroom.domainId, s, function(err, result) {
                if (err) return next();
                classroom.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return next();
            });
        },
        function (next) {
            ws.aulaca.getGroupServlet(classroom.domainCode, s, function(err, result) {
                if (err) return next();
                try {
                    classroom.resum.comunicacio.lecturesPendents = result[0]['$']['numMsgPendents'];
                    classroom.color = result[0].color[0];
                } catch(e) {
                }
                return next();
            });
        }
    ], function(err, result) {
        if (err) return next(err);
        classroom.resum.avaluacio.seguimentpercent = indicadors.getPercent(classroom.resum.avaluacio.seguiment, classroom.resum.estudiants.total);
        classroom.resum.avaluacio.superaciopercent = indicadors.getPercent(classroom.resum.avaluacio.superacio, classroom.resum.estudiants.total);
        return next();
    });
}

/**
 * [one description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   domainId       [description]
 * @param  {[type]}   codAula        [description]
 * @param  {[type]}   classroomId   [description]
 * @param  {[type]}   domainCode     [description]
 * @param  {[type]}   idp            [description]
 * @param  {[type]}   s              [description]
 * @param  {Function} next           [description]
 * @return {[type]}                  [description]
 */
var one = exports.one = function(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, s, next) {

	var struct = {
		s: s,
		anyAcademic: anyAcademic,
		codAssignatura: codAssignatura,
        domainId: subjectId,
        subjectId: subjectId,
		codAula: codAula,
		classroomId: classroomId,
        domainCode: domainCode,
        totalEstudiants: 0,
        link: '#',
        linkedicioaula: '#',
        color: 'FF2600',
		consultor: {
		},
		estudiants: [
		]
	}

	async.parallel([
        function (next) {
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
                if (err) return next();
                try {
                    struct.color = result[0].color[0];
                    struct.isAulaca = result ? result[0]['$']['idTipoPresent'] == 'AULACA' : false;
                    struct.link = aules.getLinkAula(s, struct.isAulaca, subjectId, classroomId, domainCode);
                    struct.linkedicioaula = aules.getLinkDissenyAula(s, struct.isAulaca, subjectId, classroomId);
                } catch(e) {
                }
                return next();
            });
        },
        function (next) {
            ws.infoacademica.getAssignaturaByCodi(anyAcademic, codAssignatura, function(err, result) {
                if (err) return next(err);
                struct.nomAssignatura = result.out.descAssignatura;
                return next();
            });
        },
		function (next) {
			estudiants.all(anyAcademic, codAssignatura, codAula, classroomId, idp, s, function(err, result) {
				if (err) return next(err);
                struct.estudiants = result;
                struct.totalEstudiants = struct.estudiants ? struct.estudiants.length : 0;
				return next();
			});
		},
        function (next) {
            Consultor.aula(anyAcademic, codAssignatura, codAula, idp, s, function(err, result) {
                if (err) return next(err);
                struct.consultor = result;
                return next();
            });
        }
	], function(err, results) {
		next(err, struct);
	});
}

/**
 * [avaluacio description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   subjectId       [description]
 * @param  {[type]}   codAula        [description]
 * @param  {[type]}   classroomId   [description]
 * @param  {[type]}   domainCode     [description]
 * @param  {[type]}   idp            [description]
 * @param  {[type]}   s              [description]
 * @param  {Function} next           [description]
 * @return {[type]}                  [description]
 */
var avaluacio = exports.avaluacio = function(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, s, next) {

    var struct = {
        s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: subjectId,
        subjectId: subjectId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
        totalEstudiants: 0,
        link: '#',
        linkedicioaula: '#',
        color: 'FF2600',
        consultor: {
        },
        estudiants: [
        ]
    }

    async.parallel([
        function (next) {
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
                if (err) return next();
                try {
                    struct.color = result[0].color[0];
                    struct.isAulaca = result ? result[0]['$']['idTipoPresent'] == 'AULACA' : false;
                    struct.link = aules.getLinkAula(s, struct.isAulaca, subjectId, classroomId, domainCode);
                    struct.linkedicioaula = aules.getLinkDissenyAula(s, struct.isAulaca, subjectId, classroomId);
                } catch(e) {
                }
                return next();
            });
        },
        function (next) {
            ws.infoacademica.getAssignaturaByCodi(anyAcademic, codAssignatura, function(err, result) {
                if (err) return next(err);
                struct.nomAssignatura = result.out.descAssignatura;
                return next();
            });
        },
        function (next) {
            Consultor.aula(anyAcademic, codAssignatura, codAula, idp, s, function(err, result) {
                if (err) return next(err);
                struct.consultor = result;
                return next();
            });
        },
        function (next) {
            estudiants.ultimaPACEntregada(anyAcademic, codAssignatura, codAula, function(err, result) {
                if (err) return next(err);
                struct.estudiants = result;
                return next();
            });
        }
    ], function(err, results) {
        next(err, struct);
    });
}

/**
 * [isAulaca description]
 * @param  {[type]}  aula [description]
 * @return {Boolean}      [description]
 */
var isAulaca = exports.isAulaca = function(aula) {
    return aula.presentation == 'AULACA';
}

/**
 * [getLinkAula description]
 * @param  {[type]}  s          [description]
 * @param  {Boolean} isAulaca   [description]
 * @param  {[type]}  domainId   [description]
 * @param  {[type]}  domainCode [description]
 * @return {[type]}             [description]
 */
var getLinkAula = exports.getLinkAula = function(s, isAulaca, subjectId, classroomId, domainCode) {
    return isAulaca ?
    config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&subjectId=%s&classroomId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        classroomId,
        subjectId,
        classroomId
    ) :
    config.util.format(
        '%s/webapps/classroom/081_common/jsp/iniciAula.jsp?s=%s&domainId=%s&domainCode=%s&img=aules&preview=1&idLang=a&ajax=true',
        config.cv(),
        s,
        classroomId,
        domainCode
    );
}

/**
 * [getLinkActivitat description]
 * @param  {[type]}  s          [description]
 * @param  {Boolean} isAulaca   [description]
 * @param  {[type]}  domainId   [description]
 * @param  {[type]}  domainCode [description]
 * @param  {[type]}  eventId [description]
 * @return {[type]}             [description]
 */
var getLinkActivitat = exports.getLinkActivitat = function(s, isAulaca, subjectId, classroomId, domainCode, eventId) {
    return isAulaca ?
    config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&subjectId=%s&classroomId=%s&activityId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        classroomId,
        subjectId,
        classroomId,
        eventId
    ) :
    getLinkAula(s, isAulaca, subjectId, classroomId, domainCode);
}

/**
 * [getLinkDissenyAula description]
 * @param  {[type]}  s        [description]
 * @param  {Boolean} isAulaca [description]
 * @param  {[type]}  domainId [description]
 * @return {[type]}           [description]
 */
var getLinkDissenyAula = exports.getLinkDissenyAula = function(s, isAulaca, subjectId, classroomId) {
    return isAulaca ?
    config.util.format(
        '%s/Edit.action?s=%s&domainId=%s&subjectId=%s&classroomId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        classroomId,
        subjectId,
        classroomId
    ) :
    config.util.format(
        '%s/webapps/classroom/classroom.do?nav=dissenydomini_inici&s=%s&domainId=%s&domainTypeId=AULA&idLang=a&ajax=true',
        config.cv(),
        s,
        classroomId
    );
}