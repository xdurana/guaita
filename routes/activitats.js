var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var ws = require('../ws');

/**
 * Activitats d'una aula
 * @param domainId
 * @param domainIdAula
 * @param s
 * @param resum
 */
exports.aula = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, s, resum, callback) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
		domainId: domainId,
        codAula: codAula,
		domainIdAula: domainIdAula,
        domainCode: domainCode,
		activitats: [
		]
	}

	var getResumComunicacio = function(domainIdAula, activitat, callback) {

        activitat.nom = activitat.name;
        activitat.nom = indicadors.decodeHtmlEntity(activitat.nom);

		activitat.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc()
			}
		}

        ws.lrs.byactivityandclassroom(domainIdAula, activitat.eventId, s, function(err, result) {
            if (err) { console.log(err); return callback(); }
            activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return callback();
        });
	}

    ws.aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        struct.activitats = result;
        if (resum) {
            try {
                async.each(struct.activitats, getResumComunicacio.bind(null, domainIdAula), function(err) {
                    if (err) { console.log(err); }
                    return callback(null, struct);
                });
            } catch(e) {
                console.log(e.message);
                return callback(null, struct);
            }
        } else {
            return callback(null, struct);
        }
    });
}

/**
 * Activitats d'un idp
 * @param domainId
 * @param domainIdAula
 * @param idp
 */
exports.idp = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, s, callback) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        domainIdAula: domainIdAula,
        domainCode: domainCode,
		idp: idp,
		activitats: [
		]
	}

	var getResumComunicacioActivitatIdp = function(activitat, callback) {

        activitat.nom = activitat.name;
        activitat.nom = indicadors.decodeHtmlEntity(activitat.nom);
		activitat.resum = indicadors.getObjectComunicacio();

        async.parallel([
            function(callback) {
                ws.lrs.byidpandactivity(idp, activitat.eventId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return callback();
                });
            },
            function(callback) {
                ws.lrs.byidpandactivitylast(idp, activitat.eventId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    activitat.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    return callback();
                });
            },
            function(callback) {
                ws.lrs.byidpandactivityandwidgetlast(idp, activitat.eventId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    activitat.resum.comunicacio.ultimaConnexioWidget = indicadors.getUltimaConnexio(result);
                    return callback();
                });
            }
        ], function(err, results) {
            if (err) { console.log(err); }
            return callback();
        });
	}

	ws.aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
		struct.activitats = result;
        try {
    		async.each(struct.activitats, getResumComunicacioActivitatIdp, function(err) {
                if (err) { console.log(err); }
                return callback(null, struct);
    		});
        } catch(e) {
            console.log(e.message);
            callback(null, struct);
        }
	});
}

/**
 * Indicadors d'avaluació d'una aula
 * @param domainId
 * @param domainIdAula
 */
exports.avaluacio = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, s, callback) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        domainIdAula: domainIdAula,
        domainCode: domainCode,
		activitats: [
		]
	}

	ws.rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        try {
    		struct.activitats = result.out.ActivitatVO;
    		async.each(struct.activitats, getIndicadorsActivitat, function(err) {
                if (err) { console.log(err); }
    	  		return callback(null, struct);
    		});
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
	});

    var getIndicadorsActivitat = function(item, callback) {

        item.nom = indicadors.getValor(indicadors.getValor(item.descripcio));
        item.nom = indicadors.decodeHtmlEntity(item.nom);
        item.resum = {
            avaluacio: {
                seguiment: config.nc(),
                superacio: config.nc(),
                dataLliurament: indicadors.getDataLliurament(item.dataLliurament)
            }
        }

        async.parallel([
            function(callback) {
                return callback();
                /*
                ws.rac.getNumEstudiantsQualificatsByActivitat(item, function(err, result) {
                    if(err) { console.log(err); callback(err); return; }
                    item.qualificats = result.out;
                    callback();
                });
                */
            },
            function(callback) {

                var tipusIndicador = 'RAC_CONSULTOR_AC';
                var comptarEquivalents = '0';
                var comptarRelacions = '0';

                ws.rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    item.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
                    item.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
                    item.resum.avaluacio.seguimentpercent = indicadors.getSeguimentACAulaPercent(result.out.ValorIndicadorVO);
                    item.resum.avaluacio.superaciopercent = indicadors.getSuperacioACAulaPercent(result.out.ValorIndicadorVO);
                    return callback();
                });
            }
        ], function(err, results) {
            if (err) { console.log(err); }
            return callback();
        });
    }    
}

/**
 * Activitat actual d'una aula
 * @param domainId
 * @param domainIdAula
 * @param s
 * @param resum
 */
exports.actives = function(domainId, domainIdAula, s, callback) {

    var struct = {
        s: s,
        domainId: domainId,
        domainIdAula: domainIdAula,
        activitats: [
        ]
    }

    ws.aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
        if (err) return callback(err);
        if (result) {
            result.forEach(function(activitat) {
                struct.ultima = activitat;
                try {
                    if (new Date(activitat.startDate) <= Date.now() && new Date(activitat.deliveryDate) > Date.now()) {
                        struct.activitats.push(activitat);
                    }
                } catch(e) {
                    console.log(e.message);
                }                
            })
        }
        if (struct.activitats.length == 0) {
            struct.activitats.push(struct.ultima);
        }
        callback(null, struct);
    });
}