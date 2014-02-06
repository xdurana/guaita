var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var activitats = require('./activitats');
var aules = require('./aules');
var estudiants = require('./estudiants');
var consultors = require('./consultors');
var assignatures = require('./assignatures');

var ws = require('../ws');

var all = exports.all = function(anyAcademic, codAssignatura, domainId, idp, s, perfil, callback) {

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
        if (err) return callback(err);
        async.parallel([
            function (callback) {
                if (aules) {
                    async.each(aules, procesa.bind(null, anyAcademic, codAssignatura, idp, s, perfil), function(err) {
                        if (err) return callback(err);
                        struct.aules.sort(ordenaAules);
                        struct.linkedicioaula = getLinkDissenyAula(s, struct.aules.length > 0 ? struct.aules[0].isAulaca : true, domainId);
                        return callback();
                    });
                } else return callback();
            },
            function (callback) {
                ws.rac.getActivitatsByAula(anyAcademic, codAssignatura, 1, function(err, result) {
                    if (err) return callback(err);
                    if (result.out.ActivitatVO) {
                        result.out.ActivitatVO.forEach(function(activitat) {
                            if (struct.dataLliurament == config.nc() && new Date(activitat.dataLliurament) > new Date()) {
                                struct.dataLliurament = indicadors.getDataLliurament(activitat.dataLliurament);
                            }
                        })
                    }
                    return callback();
                });
            },
            function (callback) {
                assignatures.resum(s, idp, anyAcademic, struct, codAssignatura, domainId, function(err, result) {
                    return callback(err);
                });
            }
        ], function(err, result) {
            return callback(err, struct);
        });
    }); 

    var procesa = function(anyAcademic, codAssignatura, idp, s, perfil, classroom, callback) {
        ws.aulaca.isAulaca(classroom.domainCode, s, function(err, result) {
            if (err) { console.log(err); return callback(); }
            classroom.isAulaca = result;
            var codAula = classroom.domainCode.slice(-1);
            consultors.aula(anyAcademic, codAssignatura, codAula, idp, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                classroom.consultor = result;
                struct.aules.push(classroom);
                if (perfil == 'pra' || classroom.consultor.idp == idp) {
                    resum(s, idp, anyAcademic, codAssignatura, classroom, codAula, function(err, result) {
                        if (err) { console.log(err); return callback(); }
                        consultors.getResumEines(classroom, function(err, result) {
                            if (err) { console.log(err); return callback(); }
                            return callback();
                        });
                    });
                } else return callback();
            });
        });
    }

    var ordenaAules = function(a, b) {
        return a.codAula < b.codAula ? -1 : b.codAula < a.codAula ? 1 : 0;
    }
}

var resum = exports.resum = function(s, idp, anyAcademic, codAssignatura, classroom, codAula, callback) {

    classroom.color = 'FF2600';
    classroom.codAula = codAula;
    classroom.codAssignatura = classroom.codi;
    classroom.domainIdAula = classroom.domainId;
    classroom.link = aules.getLinkAula(s, classroom.isAulaca, classroom.domainIdAula, classroom.domainCode),
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
        function (callback) {
            callback();
        },
        function (callback) {
            ws.rac.calcularIndicadorsAula('RAC_PRA_2', codAssignatura, anyAcademic, codAula, codAula, '0', '0', function(err, result) {
                if (err) { console.log(err); return callback(); }
                classroom.resum.estudiants.total = indicadors.getTotalEstudiantsTotal(result.out.ValorIndicadorVO);
                classroom.resum.estudiants.repetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
                return callback();
            });
        },
        function (callback) {
            ws.rac.calcularIndicadorsAula('RAC_CONSULTOR_AC', codAssignatura, anyAcademic, codAula, codAula, '0', '0', function(err, result) {
                if (err) { console.log(err); return callback(); }
                classroom.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
                classroom.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
                return callback();
            });
        },
        function (callback) {
            ws.lrs.byclassroom(classroom.domainId, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                classroom.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return callback();
            });
        },
        function (callback) {
            ws.aulaca.getGroupServlet(classroom.domainCode, s, function(err, result) {
                if (err) { console.log(err); return callback(err); }
                try {
                    classroom.resum.comunicacio.lecturesPendents = result[0]['$']['numMsgPendents'];
                    classroom.color = result[0].color[0];

                    //TODO Total missatges per aula

                } catch(e) {
                    console.log(e.message);
                }
                return callback();
            });
        },
        function (callback) {
            ws.aulaca.getLecturesPendentsAcumuladesAula(classroom.domainId, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                classroom.resum.comunicacio.lecturesPendentsAcumulades = result ? result : config.nc();
                return callback();
            });
        },
        function (callback) {
            ws.aulaca.getParticipacionsAula(classroom.domainId, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                classroom.resum.comunicacio.participacions = result ? result : config.nc();
                return callback();
            });
        }
    ], function(err, result) {
        if (err) { console.log(err); }
        classroom.resum.avaluacio.seguimentpercent = indicadors.getPercent(classroom.resum.avaluacio.seguiment, classroom.resum.estudiants.total);
        classroom.resum.avaluacio.superaciopercent = indicadors.getPercent(classroom.resum.avaluacio.superacio, classroom.resum.estudiants.total);
        return callback();
    });
}

var one = exports.one = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, s, callback) {

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
        function (callback) {
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
                if (err) { console.log(err); return callback(err); }
                try {
                    struct.color = result[0].color[0];
                } catch(e) {
                    console.log(e.message);
                }
                return callback();
            });
       },
       function (callback) {
            ws.aulaca.isAulaca(domainCode, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                struct.isAulaca = result;
                struct.link = aules.getLinkAula(s, struct.isAulaca, domainIdAula, domainCode);
                struct.linkedicioaula = aules.getLinkDissenyAula(s, struct.isAulaca, domainIdAula);
                return callback();
            });
        },
        function (callback) {
            ws.infoacademica.getAssignaturaByCodi(anyAcademic, codAssignatura, function(err, result) {
                if (err) { console.log(err); return callback(); }
                struct.nomAssignatura = result.out.descAssignatura;
                return callback();
            });
        },
		function (callback) {
            return callback();
			estudiants.all(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, function(err, result) {
				if (err) { console.log(err); return callback(); }
                struct.estudiants = result;
                if (struct.estudiants) {
                    struct.totalEstudiants = struct.estudiants.length;
                    struct.estudiants.forEach(function(estudiant) {
                        estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
                    });
                }
				return callback();
			});
		},
        function (callback) {
            estudiants.minimum(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, function(err, result) {
                if (err) return callback(err);
                if (result) {
                    struct.estudiants = result;
                    struct.totalEstudiants = struct.estudiants.length;
                    struct.estudiants.forEach(function(estudiant) {
                        estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
                    });
                }
                return callback();
            });
        },
		function (callback) {
			consultors.aula(anyAcademic, codAssignatura, codAula, idp, s, function(err, result) {
				if (err) { console.log(err); return callback(); }
				struct.consultor = result;
				return callback();
			});
		},
	], function(err, results) {
		if (err) { console.log(err); }
		callback(null, struct);
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
        '%s/webapps/aulaca/classroom/Classroom.action?s=%s&domainId=%s&javascriptDisabled=false&origin=guaita',
        config.cv(),
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
        '%s/webapps/aulaca/classroom/Classroom.action?s=%s&domainId=%s&activityId=%s&javascriptDisabled=false&origin=guaita',
        config.cv(),
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
        '%s/webapps/aulaca/classroom/Classroom.action?s=%s&domainId=%s&javascriptDisabled=false&origin=guaita',
        config.cv(),
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