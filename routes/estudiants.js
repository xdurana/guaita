var async = require('async');

var calendaris = require('./calendaris');
var indicadors = require('./indicadors');
var activitats = require('./activitats');
var usuaris = require('./usuaris');
var aules = require('./aules');
var widget = require('./widget');
var config = require('../config');
var ws = require('../ws');

var Classroom = require('../models/classroom');

/**
 * Estudiants d'una aula
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 */
exports.all = function(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, next) {

	var struct = [
	];

	ws.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if (err) return next(err);
		struct = result.out.EstudiantAulaVO;
        try {
    		async.each(struct, getResumEstudiant, function(err) {
    			if (err) return next(err);
                struct.sort(ordenaEstudiants);
    			return next(null, struct);
    		});
        } catch(e) {
            return next(null, struct);
        }
	});

    var ordenaEstudiants = function(a, b) {
        da = moment(a.resum.comunicacio.ultimaConnexio, "DD/MM/YYYY");
        db = moment(b.resum.comunicacio.ultimaConnexio, "DD/MM/YYYY");

        if (da.isValid() && db.isValid()) {
            return da.isBefore(db) ? -1 : db.isBefore(da) ? 1 : 0;
        } else {
            return da.isValid() ? 1 : db.isValid() ? -1 : 0;
        }
    }  

	var getResumEstudiant = function(estudiant, next) {
		estudiant.nomComplert = indicadors.getNomComplert(estudiant.tercer);
        estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
        estudiant.resum = indicadors.getObjectComunicacio();
        async.parallel([
            function(next) {
                usuaris.getFitxa(estudiant.idp, idp, s, function(err, url) {
                    if (err) return next(err);
                    estudiant.fitxa = url;
                    return next();
                });
            },
            function(next) {
                ws.lrs.byidpandclassroom(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) return next(err);
                    estudiant.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return next();
                });
            },
            function(next) {
                ws.lrs.byidpandclassroomlast(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) return next(err);
                    estudiant.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    return next();
                });
            },
            function(next) {
                ws.aulaca.getUltimaConnexioCampus(estudiant.idp, s, function(err, result) {
                    if (err) return next(err);
                    estudiant.resum.comunicacio.ultimaConnexioCampus = indicadors.formatDate(result);
                    return next();
                });
            },
            function(next) {
                ws.lrs.byidpandclassroomandwidgetlast(estudiant.idp, domainIdAula, s, function(err, result) {
                    if (err) return next(err);
                    estudiant.resum.comunicacio.ultimaConnexioWidget = indicadors.getUltimaConnexio(result);
                    return next();
                });
            }
        ], function(err, results) {
            return next(err);
        });
	}
}

/**
 * Estudiants d'una aula (minimalistic version)
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 * @param idp
 * @param s
 */
exports.minimum = function(anyAcademic, codAssignatura, codAula, domainIdAula, idp, s, next) {

    var struct = [
    ];

    ws.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
        if (err) return next(err, result);
        if (result.out.EstudiantAulaVO) {
            struct = result.out.EstudiantAulaVO;
            async.each(struct, getResumEstudiant, function(err) {
                return next(err, struct);
            });
        } else {
            return next(null, struct);
        }
    });

    var getResumEstudiant = function(estudiant, next) {
        estudiant.resum = indicadors.getObjectComunicacio();
        async.parallel([
            function(next) {
                ws.aulaca.getUltimaConnexioCampus(estudiant.idp, s, function(err, result) {
                    if (err) return next(err);
                    estudiant.resum.comunicacio.ultimaConnexioCampus = indicadors.formatDate(result);
                    return next();
                });
            },
            function(next) {
                estudiant.nomComplert = indicadors.getNomComplert(estudiant.tercer);
                estudiant.idp = indicadors.getValor(indicadors.getValor(estudiant.tercer).idp);
                estudiant.resum = indicadors.getObjectComunicacio();
                usuaris.getFitxa(estudiant.idp, idp, s, function(err, url) {
                    if (err) return next(err);
                    estudiant.fitxa = url;
                    return next();
                });
            }
        ], function(err, results) {
            return next(err, results);
        });
    }
}
