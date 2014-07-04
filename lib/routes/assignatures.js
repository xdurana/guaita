var async = require('async');

var config = require(__base + '/config');
var indicadors = require(__base + '/lib/routes/indicadors');
var ws = require(__base + '/lib/services/ws');

/**
 * Assignatures per idp
 * @param s
 * @param idp
 * @param perfil
 * @param next
 */
exports.byidp = function(s, idp, perfil, next) {
    ws.aulaca.getAssignaturesPerIdpPerfil(s, idp, perfil, function(err, object) {
        if (err) return next(err);
        var assignatures = object.subjects || [];
        async.each(assignatures, getResum, function(err) {
            if (err) return next(err);
            assignatures.sort(ordenaAssignatures);
            return next(null, {
                s: s,
                idp: idp,
                assignatures: assignatures
            });
        });
    });

    var getResum = function(subject, next) {
        exports.resum(s, idp, subject.anyAcademic, subject, subject.codi, subject.domainId, function(err, result) {
            return next(err, result);
        });
    };

    var ordenaAssignatures = function(a, b) {
        return a.codi < b.codi ? -1 : b.codi < a.codi ? 1 : 0;
    }  
};

/**
 * Dades resum d'una assignatura per idp
 * @param s
 * @param idp
 * @param anyAcademic
 * @param subject
 * @param codi
 * @param domainId
 * @param next
 */
exports.resum = function(s, idp, anyAcademic, subject, codi, domainId, next) {

    //TODO GUAITA-21
    subject.estil = 'block-head';
    
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

    var seguimentACAula = function(aula, next) {
        aula.codAula = aula.domainCode.slice(-1);
        aula.ac = {
            seguiment: 0,
            superacio: 0
        };
        ws.rac.calcularIndicadorsAula('RAC_CONSULTOR_AC', codi, anyAcademic, aula.codAula, aula.codAula, '0', '0', function(err, result) {
            if (err) return next(err);
            aula.ac.seguiment = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
            aula.ac.superacio = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
            return next();
        });
    };

    async.parallel([
        function (next) {
            ws.rac.calcularIndicadorsAssignatura('RAC_PRA_2', anyAcademic, codi, '0', '0', function(err, result) {
                if (err) return next();
                subject.resum.estudiants.total = indicadors.getTotalEstudiantsTotal(result.out.ValorIndicadorVO);
                subject.resum.estudiants.repetidors = indicadors.getTotalEstudiantsRepetidors(result.out.ValorIndicadorVO);
                return next();
            });
        },
        function (next) {
            ws.aulaca.getAulesAssignatura(domainId, idp, s, function(err, result) {
                if (err) return next(err);            
                subject.resum.aules.total = result ? result.length : config.nc();

                subject.resum.avaluacio.seguiment = 0;
                subject.resum.avaluacio.superacio = 0;

                async.each(result, seguimentACAula, function(err) {
                    if (err) return next();
                    if (result) {
                        result.forEach(function(aula) {
                            if (aula.ac) {
                                subject.resum.avaluacio.seguiment += parseInt(aula.ac.seguiment) || 0;
                                subject.resum.avaluacio.superacio += parseInt(aula.ac.superacio) || 0;
                            }
                        });
                    }
                    subject.resum.avaluacio.seguimentpercent = indicadors.getPercent(subject.resum.avaluacio.seguiment, subject.resum.estudiants.total);
                    subject.resum.avaluacio.superaciopercent = indicadors.getPercent(subject.resum.avaluacio.superacio, subject.resum.estudiants.total);
                    return next();
                });
            });
        },
        function (next) {
            ws.lrs.bysubject(domainId, s, function(err, result) {
                if (err) return next(err);
                subject.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return next();
            });
        }
    ], function(err, result) {
        return next(err, result);
    });
};