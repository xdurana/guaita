module.exports = function(config) {

    var config = config;
    var activity = require(__base + '/lib/models/activity')(config);
    var widget = require(__base + '/lib/models/widget')(config);

    var getToolDescription = function(eina) {
        return eina.translatedDescription ? eina.translatedDescription : eina.description;
    };

    return {

        /**
         * Llista d'eines per aula amb els seus indicadors globals
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
        aula: function (anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, idp, s, next) {

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
                eina.resum = config.indicadors.getObjectComunicacio();
                config.async.parallel([
                    function (next) {
                        config.services.lrs.bytoolandclassroom(classroomId, eina.resourceId, s, function (err, result) {
                            if (err) return next(err);
                            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                            return next();
                        });
                    }
                ], function (err) {
                    return next(err);
                });
            };

            config.services.aulaca.getEinesPerAula(domainId, classroomId, s, function (err, result) {
                if (err) return next(err);
                struct.eines = result || [];
                config.async.each(struct.eines, getResumComunicacio, function (err) {
                    return next(err, struct);
                });
            });
        },

        /**
         * Llista d'eines per activitat amb els seus indicadors globals
         * @param anyAcademic
         * @param codAssignatura
         * @param domainId
         * @param codAula
         * @param classroomId
         * @param domainCode
         * @param eventId
         * @param idp
         * @param s
         * @param next
         */
        activitat: function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, eventId, idp, s, next) {

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
                eina.resum = config.indicadors.getObjectComunicacio();
                config.services.lrs.bytoolandclassroom(classroomId, eina.resourceId, s, function(err, result) {
                    if (err) return next(err);
                    eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return next();
                });
            };

            config.services.aulaca.getEinesPerActivitat(domainId, classroomId, eventId, s, function(err, result) {
                if (err) return next(err);
                struct.eines = result || [];
                config.async.each(struct.eines, getResumComunicacio.bind(null, classroomId), function(err) {
                    return next(err, struct);
                });
            });
        },

        /**
         * Llista d'eines per aula amb els seus indicadors per estudiant
         * @param anyAcademic
         * @param codAssignatura
         * @param domainId
         * @param codAula
         * @param classroomId
         * @param domainCode
         * @param idp
         * @param s
         * @param estadistiques
         * @param next
         */
        aulaidp: function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, idp, s, estadistiques, next) {

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

            config.services.aulaca.getEinesPerAula(domainId, classroomId, s, function(err, result) {
                if (err) return next(err);
                struct.eines = result || [];
                config.async.each(struct.eines, getResumComunicacioIdp, function(err) {
                    return next(err, struct);
                });
            });

            /**
             * Resum de l'activitat del consultor a l'eina
             * @param eina
             * @param next
             * @returns {*}
             */
            var getResumComunicacioIdp = function (eina, next) {

                eina.nom = getToolDescription(eina);
                eina.resum = config.indicadors.getObjectComunicacio();
                if (!estadistiques) return next();
                config.async.parallel([
                    function(next) {
                        if (estadistiques) {
                            config.services.lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
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
                            config.services.lrs.byidpandtoollast(idp, eina.resourceId, s, function(err, result) {
                                if (err) return next(err);
                                eina.resum.comunicacio.ultimaConnexio = config.indicadors.getUltimaConnexio(result);
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
        },

        /**
         * Llista d'eines per activitat amb els seus indicadors per estudiant
         * @param anyAcademic
         * @param codAssignatura
         * @param domainId
         * @param codAula
         * @param classroomId
         * @param domainCode
         * @param eventId
         * @param idp
         * @param s
         * @param next
         */
        activitatidp: function(anyAcademic, codAssignatura, domainId, codAula, classroomId, domainCode, eventId, idp, s, next) {

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
                eina.resum = config.indicadors.getObjectComunicacio();
                config.services.lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
                    if (err) return next(err);
                    eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return next();
                });
            };

            config.services.aulaca.getEinesPerActivitat(domainId, classroomId, eventId, s, function(err, result) {
                if (err) return next(err);
                struct.eines = result || [];
                config.async.each(struct.eines, getResumComunicacioEstudiant, function(err) {
                    return next(err, struct);
                });
            });
        }
    }
}