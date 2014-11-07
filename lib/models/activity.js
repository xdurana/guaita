module.exports = function(config) {

    var mevent = require(__base + '/lib/models/event')(config);

    /**
     * Valida que un event estigui dins d'uns marges
     * @param eventDate
     * @returns {boolean}
     */
    var valida = function(eventDate) {
        data = config.moment(eventDate);
        return !(data.isBefore(config.moment().subtract(5, 'years')) || data.isAfter(config.moment().add(5, 'years')));
    };

    /**
     * Genera el descriptor d'una activitat
     * @param activitat
     * @param aula
     * @param s
     */
    var describe = function(activitat, aula, s) {

        var o = {};

        for (var k in activitat) {
            o[k] = activitat[k];
        }

        o.aula = aula.nom;
        o.color = aula.color;
        o.name = config.indicadors.decodeHtmlEntity(activitat.name);
        o.subjectId = aula.domainFatherId;
        o.classroomId = aula.domainId;
        o.domainId = aula.domainId;
        o.link = aula.aulaca ? config.services.aulaca.getLinkActivitat(s, true, o.subjectId, o.classroomId, o.domainCode, o.eventId) : aula.link;
        o.events = [];

        if (activitat.startDate && valida(activitat.startDate)) {
            o.events.push(mevent.describe(o, 'I', config.i18next.t('events.inici.descripcio'), activitat.startDate));
        }

        if (activitat.deliveryDate && valida(activitat.deliveryDate)) {
            o.events.push(mevent.describe(o, 'LL', config.i18next.t('events.entrega.descripcio'), activitat.deliveryDate));
        }

        if (activitat.solutionDate && valida(activitat.solutionDate)) {
            o.events.push(mevent.describe(o, 'S', config.i18next.t('events.solucio.descripcio'), activitat.solutionDate));
        }

        if (activitat.qualificationDate && valida(activitat.qualificationDate)) {
            o.events.push(mevent.describe(o, 'Q', config.i18next.t('events.qualificacio.descripcio'), activitat.qualificationDate));
        }

        return o;
    };

    /**
     * Activitats d'una aula
     * @param anyAcademic
     * @param codAssignatura
     * @param domainId
     * @param codAula
     * @param classroomId
     * @param domainCode
     * @param s
     * @param resum
     * @param next
     */
    var aula = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, s, resum, next) {

        var struct = {
            s: s,
            anyAcademic: anyAcademic,
            codAssignatura: codAssignatura,
            domainId: domainId,
            codAula: codAula,
            classroomId: classroomId,
            domainCode: domainCode,
            activitats: [
            ]
        };

        config.services.aulaca.getActivitatsAula(domainId, classroomId, s, function(err, result) {
            if (err) return next(err);
            struct.activitats = result;
            if (resum && struct.activitats) {
                config.async.each(struct.activitats, resumeix.bind(null, classroomId), function(err) {
                    return next(err, struct);
                });
            } else {
                return next(null, struct);
            }
        });

        var resumeix = function(classroomId, activitat, next) {
            activitat.nom = activitat.name;
            activitat.nom = config.indicadors.decodeHtmlEntity(activitat.nom);
            activitat.resum = {
                comunicacio: {
                    clicsAcumulats: config.nc(),
                    lecturesPendentsAcumulades: config.nc(),
                    lecturesPendents: config.nc(),
                    participacions: config.nc()
                }
            };
            config.services.lrs.byactivityandclassroom(classroomId, activitat.eventId, s, function(err, result) {
                if (err) return next(err);
                activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                return next();
            });
        }
    };

    /**
     * Activitats d'un idp
     * @param anyAcademic
     * @param codAssignatura
     * @param domainId
     * @param codAula
     * @param classroomId
     * @param domainCode
     * @param idp
     * @param s
     * @param next
     */
    var idp = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, idp, s, next) {

        var struct = {
            s: s,
            anyAcademic: anyAcademic,
            codAssignatura: codAssignatura,
            domainId: domainId,
            codAula: codAula,
            classroomId: classroomId,
            domainCode: domainCode,
            idp: idp,
            activitats: [
            ]
        };

        var getResumComunicacioActivitatIdp = function(activitat, next) {

            activitat.nom = activitat.name;
            activitat.nom = config.indicadors.decodeHtmlEntity(activitat.nom);
            activitat.resum = config.indicadors.getObjectComunicacio();

            config.async.parallel([
                function(next) {
                    config.services.lrs.byidpandactivity(idp, activitat.eventId, s, function(err, result) {
                        if (err) return next(err);
                        activitat.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                        return next();
                    });
                },
                function(next) {
                    config.services.lrs.byidpandactivitylast(idp, activitat.eventId, s, function(err, result) {
                        if (err) return next(err);
                        activitat.resum.comunicacio.ultimaConnexio = config.indicadors.getUltimaConnexio(result);
                        return next();
                    });
                },
                function(next) {
                    config.services.aulaca.getUltimaConnexioCampus(idp, s, function(err, result) {
                        if (err) return next(err);
                        activitat.resum.comunicacio.ultimaConnexioCampus = config.indicadors.formatDate(result);
                        return next();
                    });
                },
                function(next) {
                    config.services.lrs.byidpandactivityandwidgetlast(idp, activitat.eventId, s, function(err, result) {
                        if (err) return next(err);
                        activitat.resum.comunicacio.ultimaConnexioWidget = config.indicadors.getUltimaConnexio(result);
                        return next();
                    });
                }
            ], function(err) {
                return next(err);
            });
        };

        config.services.aulaca.getActivitatsAula(domainId, classroomId, s, function(err, result) {
            if (err) return next(null, struct);
            result = result || [];
            struct.activitats = result;
            config.async.each(struct.activitats, getResumComunicacioActivitatIdp, function(err) {
                return next(err, struct);
            });
        });
    };

    /**
     * Indicadors d'avaluació d'una aula
     * @param anyAcademic
     * @param codAssignatura
     * @param domainId
     * @param codAula
     * @param classroomId
     * @param domainCode
     * @param s
     * @param next
     */
    var avaluacio = function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, s, next) {

        var struct = {
            s: s,
            anyAcademic: anyAcademic,
            codAssignatura: codAssignatura,
            domainId: domainId,
            codAula: codAula,
            classroomId: classroomId,
            domainCode: domainCode,
            activitats: [
            ]
        };

        config.services.rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
            if (err) return next(null, struct);
            result.out = result.out || {};
            result.out.ActivitatVO = result.out.ActivitatVO || [];
            struct.activitats = result.out.ActivitatVO;
            config.async.each(struct.activitats, getIndicadorsActivitat, function(err) {
                return next(err, struct);
            });
        });

        var getIndicadorsActivitat = function(item, next) {

            item.nom = config.indicadors.getValor(config.indicadors.getValor(item.descripcio));
            item.nom = config.indicadors.decodeHtmlEntity(item.nom);
            item.resum = {
                avaluacio: {
                    seguiment: config.nc(),
                    superacio: config.nc(),
                    dataLliurament: config.indicadors.getDataLliurament(item.dataLliurament)
                }
            };

            var tipusIndicador = 'RAC_CONSULTOR_AC';
            var comptarEquivalents = '0';
            var comptarRelacions = '0';

            config.services.rac.calcularIndicadorsAula(tipusIndicador, struct.codAssignatura, struct.anyAcademic, struct.codAula, item.ordre, comptarEquivalents, comptarRelacions, function(err, result) {
                if (err) return next();
                result.out = result.out || {};
                result.out.ValorIndicadorVO = result.out.ValorIndicadorVO || null;
                item.resum.avaluacio.seguiment = config.indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
                item.resum.avaluacio.superacio = config.indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
                item.resum.avaluacio.seguimentpercent = config.indicadors.getSeguimentACAulaPercent(result.out.ValorIndicadorVO);
                item.resum.avaluacio.superaciopercent = config.indicadors.getSuperacioACAulaPercent(result.out.ValorIndicadorVO);
                return next();
            });
        }
    };

    /**
     * Activitat actual d'una aula
     * @param domainId
     * @param classroomId
     * @param s
     * @param next
     */
    var actives = function(domainId, classroomId, s, next) {

        var struct = {
            s: s,
            domainId: domainId,
            classroomId: classroomId,
            activitats: [
            ]
        };

        config.services.aulaca.getActivitatsAula(domainId, classroomId, s, function(err, result) {
            if (err) return next(err);
            if (result) {
                result.forEach(function(activitat) {
                    struct.ultima = activitat;
                    if (config.moment(activitat.startDate).isValid() && config.moment(activitat.deliveryDate).isValid() &&
                        new Date(activitat.startDate) <= Date.now() && new Date(activitat.deliveryDate) > Date.now()) {
                        struct.activitats.push(activitat);
                    }
                });
            }
            return next(null, struct);
        });
    };

    return {
        aula: aula,
        idp: idp,
        avaluacio: avaluacio,
        actives: actives,
        describe: describe
    }
};