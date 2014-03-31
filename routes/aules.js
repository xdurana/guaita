var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var activitats = require('./activitats');
var aules = require('./aules');
var estudiants = require('./estudiants');
var consultors = require('./consultors');
var assignatures = require('./assignatures');

var Event = require('../models/event');
var Activity = require('../models/activity');

var widget = require('./widget');

var ws = require('../ws');

var all = exports.all = function(anyAcademic, codAssignatura, domainId, idp, s, perfil, next) {

    var struct = {
        s: s,
        idp: idp,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        dataLliurament: config.nc(),
        linkfitxaassignatura: config.util.format("http://cv.uoc.edu/tren/trenacc/web/GAT_EXP.PLANDOCENTE?any_academico=%s&cod_asignatura=%s&idioma=CAT&pagina=PD_PREV_PORTAL&cache=S", anyAcademic, codAssignatura),
        isAulaca: false,
        aules: [
        ]
    }

    ws.aulaca.getAulesAssignatura(domainId, idp, s, function(err, aules) {
        if (err) return next(err);
        async.parallel([
            function (next) {
                if (aules) {
                    async.each(aules, procesa.bind(null, anyAcademic, codAssignatura, idp, s, perfil), function(err) {
                        if (err) return next(err);
                        struct.aules.sort(ordenaAules);
                        struct.linkedicioaula = getLinkDissenyAula(s, struct.aules.length > 0 ? struct.aules[0].isAulaca : true, domainId);
                        return next();
                    });
                } else return next();
            },
            function (next) {
                return next();
                ws.rac.getActivitatsByAula(anyAcademic, codAssignatura, 1, function(err, result) {
                    if (err) return next(err);
                    if (result.out.ActivitatVO) {
                        result.out.ActivitatVO.forEach(function(activitat) {
                            if (struct.dataLliurament == config.nc() && new Date(activitat.dataLliurament) > new Date()) {
                                struct.dataLliurament = indicadors.getDataLliurament(activitat.dataLliurament);
                            }
                        })
                    }
                    return next();
                });
            },
            function (next) {
                return next();
                assignatures.resum(s, idp, anyAcademic, struct, codAssignatura, domainId, function(err, result) {
                    return next(err);
                });
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
        classroom.domainIdAula = classroom.domainId;
        classroom.link = aules.getLinkAula(s, classroom.isAulaca, classroom.domainIdAula, classroom.domainCode);
        classroom.linkdetall = config.util.format(
            '/app/guaita/assignatures/%s/%s/%s/aules/%s/%s/%s?s=%s&idp=%s',
            anyAcademic,
            classroom.codAssignatura,
            classroom.domainFatherId,
            classroom.codAula,
            classroom.domainIdAula,
            classroom.domainCode,
            s,
            idp
        );

        consultors.aula(anyAcademic, codAssignatura, classroom.codAula, idp, s, function(err, result) {
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

var one = exports.one = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, s, next) {

	var struct = {
		s: s,
		anyAcademic: anyAcademic,
		codAssignatura: codAssignatura,
        domainId: domainId,
		codAula: codAula,
		domainIdAula: domainIdAula,
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
                    struct.link = aules.getLinkAula(s, struct.isAulaca, domainIdAula, domainCode);
                    struct.linkedicioaula = aules.getLinkDissenyAula(s, struct.isAulaca, domainIdAula);
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
			estudiants.all(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, function(err, result) {
				if (err) return next(err);
                struct.estudiants = result;
                if (struct.estudiants) {
                    struct.totalEstudiants = struct.estudiants.length;
                    struct.estudiants.forEach(function(estudiant) {
                        estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
                    });
                }
				return next();
			});
		},
        function (next) {
            return next();
            estudiants.minimum(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, function(err, result) {
                if (err) return next(err);
                if (result) {
                    struct.estudiants = result;
                    struct.totalEstudiants = struct.estudiants.length;
                    struct.estudiants.forEach(function(estudiant) {
                        estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
                    });
                }
                return next();
            });
        },
		function (next) {
			consultors.aula(anyAcademic, codAssignatura, codAula, idp, s, function(err, result) {
				if (err) return next(err);
				struct.consultor = result;
				return next();
			});
		},
	], function(err, results) {
		next(err, struct);
	});
}

/**
 * [getLinkAula description]
 * @param  {[type]}  s          [description]
 * @param  {Boolean} isAulaca   [description]
 * @param  {[type]}  domainId   [description]
 * @param  {[type]}  domainCode [description]
 * @return {[type]}             [description]
 */
var getLinkAula = exports.getLinkAula = function(s, isAulaca, domainId, domainCode) { 
    return isAulaca ?
    config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        domainId
    ) :
    config.util.format(
        '%s/webapps/classroom/081_common/jsp/iniciAula.jsp?s=%s&domainId=%s&domainCode=%s&img=aules&preview=1&idLang=a&ajax=true',
        config.cv(),
        s,
        domainId,
        domainCode
    );
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
 * [getLinkActivitat description]
 * @param  {[type]}  s          [description]
 * @param  {Boolean} isAulaca   [description]
 * @param  {[type]}  domainId   [description]
 * @param  {[type]}  domainCode [description]
 * @param  {[type]}  activityId [description]
 * @return {[type]}             [description]
 */
var getLinkActivitat = exports.getLinkActivitat = function(s, isAulaca, domainId, domainCode, activityId) {
    return isAulaca ?
    config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&activityId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        domainId,
        activityId
    ) :
    getLinkAula(s, isAulaca, domainId, domainCode);
}

/**
 * [getLinkDissenyAula description]
 * @param  {[type]}  s        [description]
 * @param  {Boolean} isAulaca [description]
 * @param  {[type]}  domainId [description]
 * @return {[type]}           [description]
 */
var getLinkDissenyAula = exports.getLinkDissenyAula = function(s, isAulaca, domainId) {
    return isAulaca ?
    config.util.format(
        '%s/Edit.action?s=%s&domainId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        domainId
    ) :
    config.util.format(
        '%s/webapps/classroom/classroom.do?nav=dissenydomini_inici&s=%s&domainId=%s&domainTypeId=AULA&idLang=a&ajax=true',
        config.cv(),
        s,
        domainId
    );
}