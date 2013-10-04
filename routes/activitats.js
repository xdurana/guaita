var async = require('async');
var request = require('request');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var aulaca = require('../ws/aulaca');
var lrs = require('../ws/lrs');

/**
 * Activitats d'una aula
 * @param domainId
 * @param domainIdAula
 * @param s
 * @param resum
 */
exports.aula = function(domainId, domainIdAula, s, resum, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
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

        lrs.byactivityandclassroom(domainIdAula, activitat.eventId, s, function(err, result) {
            if (err) { console.log(err); return callback(); }
            activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return callback();
        });
	}

    aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
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
exports.idp = function(domainId, domainIdAula, idp, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		idp: idp,
		activitats: [
		]
	}

	var getResumComunicacioActivitatIdp = function(activitat, callback) {

        activitat.nom = activitat.name;
        activitat.nom = indicadors.decodeHtmlEntity(activitat.nom);

		activitat.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		}

        async.parallel([
            function(callback) {
                lrs.byidpandactivity(idp, activitat.eventId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return callback();
                });
            },
            function(callback) {
                lrs.byidpandactivitylast(idp, activitat.eventId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    activitat.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    return callback();
                });
            }
        ], function(err, results) {
            if (err) { console.log(err); }
            return callback();
        });
	}

	aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
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
exports.avaluacio = function(anyAcademic, codAssignatura, codAula, s, callback) {

	var struct = {
		s: s,
		anyAcademic: anyAcademic,
		codAssignatura: codAssignatura,
        codAula: codAula,
		activitats: [
		]
	}

	rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
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

        //TODO
        //item.nom = item.descripcio[0].DescripcioVO[0].valor[0];
        item.nom = indicadors.getValor(indicadors.getValor(indicadors.getValor(item.descripcio).DescripcioVO).valor);
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
                rac.getNumEstudiantsQualificatsByActivitat(item, function(err, result) {
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

                rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    item.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
                    item.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
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

    aulaca.getActivitatsAula(domainId, domainIdAula, s, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        if (result) {
            result.forEach(function(activitat) {
                try {
                    if (new Date(activitat.startDate) <= Date.now() && new Date(activitat.deliveryDate) > Date.now()) {
                        struct.activitats.push(activitat);
                    }
                } catch(e) {
                    console.log(e.message);
                }
            })
        }
        callback(null, struct);
    });
}