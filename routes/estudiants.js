var async = require('async');
var moment = require('moment');

var calendaris = require('./calendaris');
var indicadors = require('./indicadors');
var activitats = require('./activitats');
var aules = require('./aules');
var widget = require('./widget');
var config = require('../config');
var ws = require('../ws');

var Classroom = require('../models/classroom');
var Tercer = require('../models/tercer');

/**
 * Estudiants d'una aula
 * @param codAssignatura
 * @param anyAcademic
 * @param codAula
 */
exports.all = function(anyAcademic, codAssignatura, codAula, classroomId, idp, s, next) {

	var estudiants = [
	];

	ws.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if (err) return next(err);
        try {
    		async.each(result.out.EstudiantAulaVO, getResumEstudiant, function(err) {
    			if (err) return next(err);
                estudiants.sort(ordenaEstudiants);
    			return next(null, estudiants);
    		});
        } catch(e) {
            return next(null, estudiants);
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
        var tercer = new Tercer(indicadors.getValor(estudiant.tercer));
        async.parallel([
            function (next) {
                tercer.getResumActivitatAula(tercer.idp, classroomId, s, function(err, resum) {
                    tercer.resum = resum;
                    return next();
                });
            },
            function (next) {
                tercer.getFitxa(idp, s, function(err, url) {
                    tercer.fitxa = url;
                    return next();
                });
            }
        ], function(err, results) {
            estudiants.push(tercer);
            return next(err);
        });
	}
}

/**
 * [ultimaPACEntregada description]
 * @param {[type]}   anyAcademic    [description]
 * @param {[type]}   codAssignatura [description]
 * @param {[type]}   codAula        [description]
 * @param {Function} next           [description]
 */
exports.ultimaPACEntregada = function(anyAcademic, codAssignatura, codAula, next) {

    var estudiants = [];
    var activitats = {};

    ws.rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
        if (err) return next(err);
        if (result.out.ActivitatVO) {
            result.out.ActivitatVO.forEach(function(activitat) {
                activitat.entregada = moment(activitat.dataLliurament).isBefore(moment());
                activitats[indicadors.getValor(activitat.ordre)] = activitat;
            });
        }

        ws.rac.getEstudiantsByAulaAmbActivitats(codAssignatura, anyAcademic, codAula, function(err, result) {
            if (err) return next(err);
            if (result.out.EstudiantAulaVO) {
                result.out.EstudiantAulaVO.forEach(function(estudiant) {
                    var tercer = new Tercer(indicadors.getValor(estudiant.tercer));
                    tercer.ultima = {};
                    indicadors.getValor(estudiant.activitats).ActivitatEstudiantAulaVO.forEach(function(activitat) {
                        activitat.lliuraments.forEach(function(lliurament) {
                            if (lliurament.LliuramentActivitatEstudiantVO) {
                                lliurament.LliuramentActivitatEstudiantVO.forEach(function(ll) {
                                    tercer.ultima = {
                                        dataEnviament: moment(indicadors.getValor(ll.dataEnviament)).format("DD/MM/YYYY HH:mm:ss"),
                                        dataDescarregaConsultor: moment(indicadors.getValor(ll.dataDescarregaConsultor)).format("DD/MM/YYYY HH:mm:ss"),
                                        codQualificacio: indicadors.getValor(activitat.codQualificacio).constructor === Object ? config.nc() : indicadors.getValor(activitat.codQualificacio),
                                        descripcio: indicadors.getValor(activitats[indicadors.getValor(ll.ordre)].descripcio)
                                    }
                                });
                            }
                        });
                    });                   
                    estudiants.push(tercer);
                });
            }
            return next(null, estudiants);
        });
    });
}

/**
 * [ultimaActivitatEntregada description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   codAula        [description]
 * @param  {Function} next           [description]
 * @return {[type]}                  [description]
 */
exports.ultimaActivitatEntregada = function(anyAcademic, codAssignatura, codAula, next) {
    var ultima = 0;
    ws.rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
        if (err) return next(err);
        if (result.out.ActivitatVO) {
            result.out.ActivitatVO.forEach(function(activitat) {
                if (moment(activitat.dataLliurament).isBefore(moment())) {
                    ultima = activitat.ordre;
                }
            });
        }
        return next(null, ultima);
    });
}

/**
 * [estudiantsActivitatNoEntregada description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   codAula        [description]
 * @param  {[type]}   ordre          [description]
 * @param  {Function} next           [description]
 * @return {[type]}                  [description]
 */
exports.estudiantsAmbActivitatNoEntregada = function(anyAcademic, codAssignatura, codAula, ordre, next) {
    var estudiants = [];
    ws.rac.getEstudiantsByAulaAmbActivitats(codAssignatura, anyAcademic, codAula, function(err, result) {
        if (err) return next(err);
        if (result.out.EstudiantAulaVO) {
            result.out.EstudiantAulaVO.forEach(function(estudiant) {
                var tercer = new Tercer(indicadors.getValor(estudiant.tercer));
                tercer.entregada = false;
                indicadors.getValor(estudiant.activitats).ActivitatEstudiantAulaVO.forEach(function(activitat) {
                    activitat.lliuraments.forEach(function(lliurament) {
                        if (lliurament.LliuramentActivitatEstudiantVO) {
                            lliurament.LliuramentActivitatEstudiantVO.forEach(function(ll) {
                                if (ll.ordre == ordre) {
                                    tercer.ultima = {
                                        dataEnviament: moment(indicadors.getValor(ll.dataEnviament)).format("DD/MM/YYYY HH:mm:ss"),
                                        dataDescarregaConsultor: moment(indicadors.getValor(ll.dataDescarregaConsultor)).format("DD/MM/YYYY HH:mm:ss"),
                                        codQualificacio: indicadors.getValor(activitat.codQualificacio).constructor === Object ? config.nc() : indicadors.getValor(activitat.codQualificacio),
                                        descripcio: indicadors.getValor(activitats[indicadors.getValor(ll.ordre)].descripcio)
                                    };
                                    tercer.entregada = true;
                                }
                            });
                        }
                    });
                });                   
                estudiants.push(tercer);
            });
        }
        return next(null, estudiants);
    });
}