var async = require('async');

var indicadors = require('./indicadors');
var activitats = require('./activitats');
var consultors = require('./consultors');
var calendar = require('./calendar');
var config = require('../config');
var rac = require('../ws/rac');
var lrs = require('../ws/lrs');
var aulaca = require('../ws/aulaca');
var infoacademica = require('../ws/infoacademica');

/**
 * Widget d'una aula per idp
 * @param anyAcademic
 * @param codAssignatura
 * @param domainId
 * @param codAula
 * @param domainIdAula
 * @param idp
 * @param s
 */
exports.one = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, idp, s, callback) {

    var struct = {
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        domainIdAula: domainIdAula,
        idp: idp,
        s: s
    };

    async.parallel([
        function (callback) {
            infoacademica.getAssignaturaByCodi(anyAcademic, codAssignatura, function(err, result) {
                if (err) { console.log(err); return callback(); }
                struct.nomAssignatura = result.out.descAssignatura;
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
        function (callback) {
            aulaca.getEinesPerAula(domainId, domainIdAula, s, function(err, result) {
                if (err) { console.log(err); return callback(null, struct); }
                struct.eines = result;
                return callback();
            });
        },
        function (callback) {
            activitats.actives(domainId, domainIdAula, s, function(err, result) {
                if (err) { console.log(err); return callback(null, struct); }
                struct.actives = result.activitats;
                return callback();
            });
        },
    ], function(err, results) {
        if (err) { console.log(err); }
        callback(null, struct);
    });
}