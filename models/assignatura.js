function Assignatura(req) {
    return {
        anyAcademic: req.params.anyAcademic,
        codAssignatura: req.params.codAssignatura,
        domainId: req.params.domainId
    }
}

Assignatura.prototype.resum = function(s, idp, callback) {

    var subject = {
        estil: 'block-head';
        anyAcademic: this.anyAcademic;
        resum: {
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