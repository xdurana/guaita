var async = require('async');
var i18next = require('i18next');

var config = require(__base + '/config');
var indicadors = require(__base + '/lib/routes/indicadors');
var ws = require(__base + '/ws');

var isPHPBB = function(eina) {
    if (eina.idTipoLink === 'BB_FORUMS') {
        return true;
    }
    return false;
}

var isForum = function(eina) {
    if (eina.idTipoLink === 'PRIVATEBB' || eina.idTipoLink === 'WKGRP_FO_TH') {
        return true;
    }
    return false;
}

var getToolDescription = function(eina) {
    return eina.translatedDescription ? eina.translatedDescription : eina.description;
}

exports.aula = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, idp, s, next) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
		eines: [
		]
	};

	var getResumComunicacio = function (eina, next) {
		eina.nom = getToolDescription(eina);
		eina.resum = indicadors.getObjectComunicacio();
        async.parallel([
            function(next) {
                ws.lrs.bytoolandclassroom(classroomId, eina.resourceId, s, function(err, result) {
                    if (err) return next(err);
                    eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return next();
                });
            }
        ], function(err, results) {
            return next(err);
        });
	}

	ws.aulaca.getEinesPerAula(domainId, classroomId, s, function(err, result) {
		if (err) return next(err);
		struct.eines = result;
        try {
    		async.each(struct.eines, getResumComunicacio, function(err) {
    			return next(null, struct);
    		});
        } catch(e) {
            return next(null, struct);
        }
	});
}

exports.activitat = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, eventId, idp, s, next) {

    var struct = {
    	s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
        eventId: eventId,
        eines: [
        ]
    };

	var getResumComunicacio = function (classroomId, eina, next) {
		eina.nom = getToolDescription(eina);
		eina.resum = indicadors.getObjectComunicacio();
        ws.lrs.bytoolandclassroom(classroomId, eina.resourceId, s, function(err, result) {
            if (err) return next(err);
            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return next();
        });
	}

    ws.aulaca.getEinesPerActivitat(domainId, classroomId, eventId, s, function(err, result) {
		if (err) return next(err);
		struct.eines = result || [];
		async.each(struct.eines, getResumComunicacio.bind(null, classroomId), function(err) {
			return next(err, struct);
		});
    });
}

exports.activitatEstudiant = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, eventId, idp, s, next) {

	var struct = {
		s: s,
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
		eventId: eventId,
		idp: idp,
		eines: [
		]
	};

	var getResumComunicacioEstudiant = function (eina, next) {
		eina.nom = getToolDescription(eina);
		eina.resum = indicadors.getObjectComunicacio();
        ws.lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
            if (err) return next(err);
            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return next();
        });
	}

	ws.aulaca.getEinesPerActivitat(domainId, classroomId, eventId, s, function(err, result) {
        if (err) return next(err);
        struct.eines = result || [];
        async.each(struct.eines, getResumComunicacioEstudiant, function(err) {
            return next(err, struct);
        });
	});
}

exports.aulaidp = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, idp, s, estadistiques, next) {

	var struct = {
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        classroomId: classroomId,
        domainCode: domainCode,
        s: s,
		idp: idp,
        recursos: [
        ],
		eines: [
		]
	};

    async.parallel([
        function (next) {
            ws.aulaca.getEinesPerAula(domainId, classroomId, s, function(err, result) {
                if (err) return next(err);
                struct.eines = result || [];
                async.each(struct.eines, getResumComunicacioIdp, function(err) {
                    return next();
                });
            });
        }
    ], function(err, results) {
        return next(err, struct);
    });

	var getResumComunicacioIdp = function (eina, next) {

		eina.nom = getToolDescription(eina);
		eina.resum = indicadors.getObjectComunicacio();
        if (!estadistiques) return next();
        async.parallel([
            function(next) {
                if (estadistiques) {
                    ws.lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
                        if (err) return next(err);
                        eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                        return next();
                    });
                } else {
                    return next();
                }
            },
            function(next) {
                if (estadistiques) {
                    ws.lrs.byidpandtoollast(idp, eina.resourceId, s, function(err, result) {
                        if (err) return next(err);
                        eina.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                        return next();
                    });
                } else {
                    return next();
                }
            }
        ], function(err, results) {
            return next(err, results);
        });
	}
}