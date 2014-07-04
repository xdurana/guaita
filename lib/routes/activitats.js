var config = require(__base + '/config');
var indicadors = require(__base + '/lib/routes/indicadors');
var ws = require(__base + '/lib/services/ws');

var async = require('async');
var moment = require('moment');

/**
 * Activitats d'una aula
 * @param anyAcademic
 * @param codAssignatura
 * @param domainId
 * @param codAula
 * @param classroomId
 * @param domainCode
 * @param s
 * @param resum
 * @param next
 */
exports.aula = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, s, resum, next) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
		domainId: domainId,
        codAula: codAula,
		classroomId: classroomId,
        domainCode: domainCode,
		activitats: [
		]
	};

    ws.aulaca.getActivitatsAula(domainId, classroomId, s, function(err, result) {
        if (err) return next(err);
        struct.activitats = result;
        if (resum && struct.activitats) {
            async.each(struct.activitats, resumeix.bind(null, classroomId), function(err) {
                return next(err, struct);
            });
        } else {
            return next(null, struct);
        }
    });

	var resumeix = function(classroomId, activitat, next) {
        activitat.nom = activitat.name;
        activitat.nom = indicadors.decodeHtmlEntity(activitat.nom);
		activitat.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc()
			}
		};
        ws.lrs.byactivityandclassroom(classroomId, activitat.eventId, s, function(err, result) {
            if (err) return next(err);
            activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return next();
        });
	}
};

/**
 * Activitats d'un idp
 * @param anyAcademic
 * @param codAssignatura
 * @param domainId
 * @param codAula
 * @param classroomId
 * @param domainCode
 * @param idp
 * @param s
 * @param next
 */
exports.idp = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, idp, s, next) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
		idp: idp,
		activitats: [
		]
	};

	var getResumComunicacioActivitatIdp = function(activitat, next) {

        activitat.nom = activitat.name;
        activitat.nom = indicadors.decodeHtmlEntity(activitat.nom);
		activitat.resum = indicadors.getObjectComunicacio();

        async.parallel([
            function(next) {
                ws.lrs.byidpandactivity(idp, activitat.eventId, s, function(err, result) {
                    if (err) return next(err);
                    activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return next();
                });
            },
            function(next) {
                ws.lrs.byidpandactivitylast(idp, activitat.eventId, s, function(err, result) {
                    if (err) return next(err);
                    activitat.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    return next();
                });
            },
            function(next) {
                ws.aulaca.getUltimaConnexioCampus(idp, s, function(err, result) {
                    if (err) return next(err);
                    activitat.resum.comunicacio.ultimaConnexioCampus = indicadors.formatDate(result);
                    return next();
                });
            },
            function(next) {
                ws.lrs.byidpandactivityandwidgetlast(idp, activitat.eventId, s, function(err, result) {
                    if (err) return next(err);
                    activitat.resum.comunicacio.ultimaConnexioWidget = indicadors.getUltimaConnexio(result);
                    return next();
                });
            }
        ], function(err) {
            return next(err);
        });
	};

	ws.aulaca.getActivitatsAula(domainId, classroomId, s, function(err, result) {
        if (err) return next(null, struct);
        result = result || [];
        struct.activitats = result;
        async.each(struct.activitats, getResumComunicacioActivitatIdp, function(err) {
            return next(err, struct);
        });
	});
};

/**
 * Indicadors d'avaluació d'una aula
 * @param anyAcademic
 * @param codAssignatura
 * @param domainId
 * @param codAula
 * @param classroomId
 * @param domainCode
 * @param s
 * @param next
 */
exports.avaluacio = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, s, next) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
		activitats: [
		]
	};

	ws.rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
        if (err) return next(null, struct);
        result.out = result.out || {};
        result.out.ActivitatVO = result.out.ActivitatVO || [];
        struct.activitats = result.out.ActivitatVO;
        async.each(struct.activitats, getIndicadorsActivitat, function(err) {
            return next(err, struct);
        });
	});

    var getIndicadorsActivitat = function(item, next) {

        item.nom = indicadors.getValor(indicadors.getValor(item.descripcio));
        item.nom = indicadors.decodeHtmlEntity(item.nom);
        item.resum = {
            avaluacio: {
                seguiment: config.nc(),
                superacio: config.nc(),
                dataLliurament: indicadors.getDataLliurament(item.dataLliurament)
            }
        };

        var tipusIndicador = 'RAC_CONSULTOR_AC';
        var comptarEquivalents = '0';
        var comptarRelacions = '0';

        ws.rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
            if (err) return next();
            result.out = result.out || {};
            result.out.ValorIndicadorVO = result.out.ValorIndicadorVO || null;
            item.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
            item.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
            item.resum.avaluacio.seguimentpercent = indicadors.getSeguimentACAulaPercent(result.out.ValorIndicadorVO);
            item.resum.avaluacio.superaciopercent = indicadors.getSuperacioACAulaPercent(result.out.ValorIndicadorVO);
            return next();
        });
    }
};

/**
 * Activitat actual d'una aula
 * @param domainId
 * @param classroomId
 * @param s
 * @param next
 */
exports.actives = function(domainId, classroomId, s, next) {

    var struct = {
        s: s,
        domainId: domainId,
        classroomId: classroomId,
        activitats: [
        ]
    };

    ws.aulaca.getActivitatsAula(domainId, classroomId, s, function(err, result) {
        if (err) return next(err);
        if (result) {
            result.forEach(function(activitat) {
                struct.ultima = activitat;
                if (moment(activitat.startDate).isValid() && moment(activitat.deliveryDate).isValid() &&
                    new Date(activitat.startDate) <= Date.now() && new Date(activitat.deliveryDate) > Date.now()) {
                    struct.activitats.push(activitat);
                }
            });
        }
        return next(null, struct);
    });
};