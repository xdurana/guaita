var config = require(__base + '/config');
var ws = require(__base + '/lib/services/ws');

var indicadors = require(__base + '/lib/routes/indicadors');
var activitats = require(__base + '/lib/routes/activitats');
var estudiants = require(__base + '/lib/routes/estudiants');
var consultors = require(__base + '/lib/routes/consultors');
var assignatures = require(__base + '/lib/routes/assignatures');
var widget = require(__base + '/lib/routes/widget');

var Activity = require(__base + '/lib/models/activity');
var Consultor = require(__base + '/lib/models/consultor');

var async = require('async');

/**
 * Llista d'aules per assignatura
 * @param anyAcademic
 * @param codAssignatura
 * @param subjectId
 * @param idp
 * @param s
 * @param perfil
 * @param next
 */
exports.all = function(anyAcademic, codAssignatura, subjectId, idp, s, perfil, next) {

    var struct = {
        s: s,
        idp: idp,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: subjectId,
        subjectId: subjectId,
        dataLliurament: config.nc(),
        linkfitxaassignatura: ws.aulaca.getFitxaAssignatura(anyAcademic, codAssignatura),
        isAulaca: false,
        aules: [
        ]
    };

    ws.aulaca.getAulesAssignatura(subjectId, idp, s, function(err, aules) {
        if (err) return next(err);
        aules = aules || [];
        async.each(aules, procesa.bind(null, anyAcademic, codAssignatura, idp, s, perfil), function(err) {
            if (err) return next(err);
            struct.aules.sort(ordenaAules);
            struct.linkedicioaula = ws.aulaca.getLinkDissenyAula(s, struct.aules.length > 0 ? struct.aules[0].isAulaca : true, subjectId, subjectId);
            return next(err, struct);
        });
    });

    /**
     * Informació de l'aula
     * @param anyAcademic
     * @param codAssignatura
     * @param idp
     * @param s
     * @param perfil
     * @param classroom
     * @param next
     */
    var procesa = function(anyAcademic, codAssignatura, idp, s, perfil, classroom, next) {

        classroom.isAulaca = ws.aulaca.isAulaca(classroom);
        classroom.codAula = classroom.domainCode.slice(-1);
        classroom.color = 'FF2600';
        classroom.codAssignatura = classroom.codi;
        classroom.subjectId = classroom.domainFatherId;
        classroom.classroomId = classroom.domainId;
        classroom.link = ws.aulaca.getLinkAula(s, classroom.isAulaca, classroom.subjectId, classroom.classroomId, classroom.domainCode);
        classroom.linkdetall = getLinkDetallAssignatura(anyAcademic, classroom.codAssignatura, classroom.subjectId, classroom.codAula, classroom.classroomId, classroom.domainCode, s, idp);

        Consultor.aula(anyAcademic, codAssignatura, classroom.codAula, idp, s, function(err, result) {
            if (err) return next(null, classroom);
            classroom.consultor = result;
            struct.aules.push(classroom);
            if (perfil == 'pra' || classroom.consultor.idp == idp) {
                exports.resum(s, idp, anyAcademic, codAssignatura, classroom, classroom.codAula, function(err, result) {
                    if (err) return next(null, classroom);
                    consultors.getResumEines(classroom, s, function() {
                        return next(null, classroom);
                    });
                });
            } else next(null, classroom);
        });
    };

    /**
     * Enllaç al detall de l'assignatura
     * @param anyAcademic
     * @param codAssignatura
     * @param subjectId
     * @param codAula
     * @param classroomId
     * @param domainCode
     * @param s
     * @param idp
     * @returns {*}
     */
    var getLinkDetallAssignatura = function(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, s, idp) {
        return config.util.format(
            '/app/guaita/assignatures/%s/%s/%s/aules/%s/%s/%s?s=%s&idp=%s',
            anyAcademic,
            codAssignatura,
            subjectId,
            codAula,
            classroomId,
            domainCode,
            s,
            idp
        );
    };

    /**
     * Ordena les aules per codi
     * @param a
     * @param b
     * @returns {number}
     */
    var ordenaAules = function(a, b) {
        return a.codAula < b.codAula ? -1 : b.codAula < a.codAula ? 1 : 0;
    }
};

/**
 * Resum de l'activitat d'un idp a una aula
 * @param s
 * @param idp
 * @param anyAcademic
 * @param codAssignatura
 * @param classroom
 * @param codAula
 * @param next
 */
exports.resum = function(s, idp, anyAcademic, codAssignatura, classroom, codAula, next) {

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
                result.out = result.out || {};
                result.out.numPlacesAssignades = result.out.numPlacesAssignades || 0;
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
            //TODO GUAITA-222
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
    ], function(err) {
        if (err) return next(err);
        classroom.resum.avaluacio.seguimentpercent = indicadors.getPercent(classroom.resum.avaluacio.seguiment, classroom.resum.estudiants.total);
        classroom.resum.avaluacio.superaciopercent = indicadors.getPercent(classroom.resum.avaluacio.superacio, classroom.resum.estudiants.total);
        return next();
    });
};

/**
 * Informació d'una aula
 * @param anyAcademic
 * @param codAssignatura
 * @param subjectId
 * @param codAula
 * @param classroomId
 * @param domainCode
 * @param idp
 * @param s
 * @param next
 */
exports.one = function(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, s, next) {

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
	};

	async.parallel([
        function (next) {
            //TODO GUAITA-222
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
                if (err) return next();
                try {
                    struct.color = result[0].color[0];
                    struct.isAulaca = result ? result[0]['$']['idTipoPresent'] == 'AULACA' : false;
                    struct.link = ws.aulaca.getLinkAula(s, struct.isAulaca, subjectId, classroomId, domainCode);
                    struct.linkedicioaula = ws.aulaca.getLinkDissenyAula(s, struct.isAulaca, subjectId, classroomId);
                } catch(e) {
                }
                return next();
            });
        },
        function (next) {
            ws.infoacademica.getAssignaturaByCodi(anyAcademic, codAssignatura, function(err, result) {
                if (err) return next(err);
                result.out = result.out || {};
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
	], function(err) {
		next(err, struct);
	});
};

/**
 * Informació d'avaluació d'una aula
 * @param anyAcademic
 * @param codAssignatura
 * @param subjectId
 * @param codAula
 * @param classroomId
 * @param domainCode
 * @param idp
 * @param s
 * @param next
 */
exports.avaluacio = function(anyAcademic, codAssignatura, subjectId, codAula, classroomId, domainCode, idp, s, next) {

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
    };

    async.parallel([
        function (next) {
            //TODO GUAITA-222
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
                if (err) return next();
                try {
                    struct.color = result[0].color[0];
                    struct.isAulaca = result ? result[0]['$']['idTipoPresent'] == 'AULACA' : false;
                    struct.link = ws.aulaca.getLinkAula(s, struct.isAulaca, subjectId, classroomId, domainCode);
                    struct.linkedicioaula = ws.aulaca.getLinkDissenyAula(s, struct.isAulaca, subjectId, classroomId);
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
};