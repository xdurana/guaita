module.exports = function(config) {

    var mtercer = require(__base + '/lib/models/tercer')(config);

    return {

        aula: function (anyAcademic, codAssignatura, codAula, idp, s, next) {
            var consultor = {
                fitxa: "#",
                nomComplert: ""
            };
            config.services.rac.getAula(codAssignatura, anyAcademic, codAula, function (err, result) {
                if (err) return next(err);
                if (result.out.consultors) {
                    consultor = mtercer.describe(config.indicadors.getValor(config.indicadors.getValor(config.indicadors.getValor(result.out.consultors).ConsultorAulaVO).tercer));
                    consultor.fitxa = mtercer.getFitxa(consultor.idp, idp, s, function (err, url) {
                        consultor.fitxa = url;
                    });
                }
                return next(null, consultor);
            });
        },

        getResumEines: function (aula, s, next) {
            aula.consultor.resum = config.indicadors.getObjectComunicacio();
            config.async.parallel([
                function (next) {
                    config.services.lrs.byidpandclassroom(aula.consultor.idp, aula.domainId, s, function (err, result) {
                        if (err) return next(err);
                        aula.consultor.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                        return next();
                    });
                },
                function (next) {
                    config.services.lrs.byidpandclassroomlast(aula.consultor.idp, aula.domainId, s, function (err, result) {
                        if (err) return next(err);
                        aula.consultor.resum.comunicacio.ultimaConnexio = config.indicadors.getUltimaConnexio(result);
                        return next();
                    });
                },
                function (next) {
                    config.services.aulaca.getUltimaConnexioCampus(aula.consultor.idp, s, function (err, result) {
                        if (err) return next(err);
                        aula.consultor.resum.comunicacio.ultimaConnexioCampus = config.indicadors.formatDate(result);
                        return next();
                    });
                },
                function (next) {
                    config.services.lrs.byidpandclassroomfromwidgetlast(aula.consultor.idp, aula.domainId, s, function (err, result) {
                        if (err) return next(err);
                        aula.consultor.resum.comunicacio.ultimaConnexioWidget = config.indicadors.getUltimaConnexio(result);
                        return next();
                    });
                }
            ], function (err, result) {
                return next(err);
            });
        },

        all: function (codAssignatura, anyAcademic, next) {
            var struct = {
                codAssignatura: codAssignatura,
                anyAcademic: anyAcademic,
                consultors: []
            };
            config.services.infoacademica.getAulesByAssignatura(anyAcademic, codAssignatura, function (err, result) {
                if (err) return next(err);
                if (result.out.AulaVO) {
                    config.async.each(result.out.AulaVO, getConsultantStats, function (err) {
                        return next(err, struct);
                    });
                } else {
                    return next(null, struct);
                }
            });
            var getConsultantStats = function (item, next) {
                struct.consultors.push({
                    idp: config.indicadors.getValor(item.idpConsultor),
                    codAssignatura: indicadors.getValor(item.codAssignatura),
                    codAula: indicadors.getValor(item.codAula)
                });
            }
        }
    }
};