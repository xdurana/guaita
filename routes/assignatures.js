var async = require('async');
var request = require('request');
var util = require('util');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var aulaca = require('../ws/aulaca');
var lrs = require('../ws/lrs');

var byidp = function(s, idp, callback) {

    var struct = {
        s: s,
        idp: idp,
        assignatures: [
        ]
    };

    aulaca.getAssignaturesPerIdp(s, idp, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        try {
            struct.assignatures = result;
            async.each(struct.assignatures, getResum.bind(null, s, idp), function(err) {
                if (err) { console.log(err); return callback(null, struct); }
                struct.assignatures.sort(ordenaAssignatures);
                return callback(null, struct);
            });
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
    });

    var getResum = function(s, idp, subject, callback) {
        resum(s, idp, subject.anyAcademic, subject, subject.codi, subject.domainId, function(err, result) {
            if (err) { console.log(err); }
            return callback();
        });
    }

    var ordenaAssignatures = function(a, b) {
        return a.codi < b.codi ? -1 : b.codi < a.codi ? 1 : 0;
    }  
}

var resum = function(s, idp, anyAcademic, subject, codi, domainId, callback) {

    subject.anyAcademic = anyAcademic;
    subject.resum = {
        aules: {
            total: config.nc()
        },
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
            rac.calcularIndicadorsAssignatura('RAC_PRA_2', anyAcademic, codi, '0', '0', function(err, result) {
                if (err) { console.log(err); return callback(); }
                subject.resum.estudiants.total = indicadors.getTotalEstudiantsTotal(result.out.ValorIndicadorVO);
                subject.resum.estudiants.repetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
                return callback();
            });
        },
        function (callback) {
            rac.calcularIndicadorsAssignatura('RAC_CONSULTOR_AC', anyAcademic, codi, '0', '0', function(err, result) {
                if (err) { console.log(err); return callback(); }
                subject.resum.avaluacio.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
                subject.resum.avaluacio.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
                return callback();
            });
        },
        function (callback) {
            aulaca.getAulesAssignatura(domainId, idp, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                subject.resum.aules.total = result ? result.length : config.nc();
                return callback();
            });
        },
        function (callback) {
            lrs.bysubject(domainId, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                subject.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return callback();
            });
        },
        function (callback) {
            return callback();
            aulaca.getLecturesPendentsAcumuladesAssignatura(domainId, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                subject.resum.comunicacio.lecturesPendentsAcumulades = result ? result : config.nc();
                return callback();
            });
        },
        function (callback) {
            return callback();
            aulaca.getParticipacionsAssignatura(domainId, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                subject.resum.comunicacio.participacions = result ? result : config.nc();
                return callback();
            });
        },
        function (callback) {
            return callback();
            aulaca.getLecturesPendentsIdpAssignatura(domainId, idp, s, function(err, result) {
                if (err) { console.log(err); return callback(); }
                subject.resum.comunicacio.lecturesPendents = result ? result : config.nc();
                return callback();
            });
        }
    ], function(err, result) {
        if (err) { console.log(err); }
        return callback();
    });
}

exports.byidp = byidp;
exports.resum = resum;