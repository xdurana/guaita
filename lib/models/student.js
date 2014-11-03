module.exports = function(config) {

    var mtercer = require('tercer')(config);

    /**
     * Estudiants d'una aula
     * @param anyAcademic
     * @param codAssignatura
     * @param codAula
     * @param classroomId
     * @param idp
     * @param s
     * @param next
     */
    var all = function (anyAcademic, codAssignatura, codAula, classroomId, idp, s, next) {

        var estudiants = [];
        config.services.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function (err, result) {
            if (err) return next(err);
            try {
                config.async.each(result.out.EstudiantAulaVO, getResumEstudiant, function (err) {
                    if (err) return next(err);
                    estudiants.sort(ordenaEstudiants);
                    return next(null, estudiants);
                });
            } catch (e) {
                return next(null, estudiants);
            }
        });

        var ordenaEstudiants = function (a, b) {
            da = moment(a.resum.comunicacio.ultimaConnexio, "DD/MM/YYYY");
            db = moment(b.resum.comunicacio.ultimaConnexio, "DD/MM/YYYY");

            if (da.isValid() && db.isValid()) {
                return da.isBefore(db) ? -1 : db.isBefore(da) ? 1 : 0;
            } else {
                return da.isValid() ? 1 : db.isValid() ? -1 : 0;
            }
        };

        var getResumEstudiant = function (estudiant, next) {
            var tercer = new mtercer(config.indicadors.getValor(estudiant.tercer));
            config.async.parallel([
                function (next) {
                    tercer.getResumActivitatAula(tercer.idp, classroomId, s, function (err, resum) {
                        tercer.resum = resum;
                        return next();
                    });
                },
                function (next) {
                    tercer.getFitxa(idp, s, function (err, url) {
                        tercer.fitxa = url;
                        return next();
                    });
                }
            ], function (err, results) {
                estudiants.push(tercer);
                return next(err);
            });
        }
    };

    /**
     * Última part entregada
     * @param anyAcademic
     * @param codAssignatura
     * @param codAula
     * @param next
     */
    var ultimaPACEntregada = function (anyAcademic, codAssignatura, codAula, next) {

        var estudiants = [];
        var activitats = {};

        config.services.rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function (err, result) {
            if (err) return next(err);
            if (result.out.ActivitatVO) {
                result.out.ActivitatVO.forEach(function (activitat) {
                    activitat.entregada = moment(activitat.dataLliurament).isBefore(moment());
                    activitats[config.indicadors.getValor(activitat.ordre)] = activitat;
                });
            }

            config.services.rac.getEstudiantsByAulaAmbActivitats(codAssignatura, anyAcademic, codAula, function (err, result) {
                if (err) return next(err);
                if (result.out.EstudiantAulaVO) {
                    result.out.EstudiantAulaVO.forEach(function (estudiant) {
                        var tercer = new mtercer(config.indicadors.getValor(estudiant.tercer));
                        tercer.ultima = {};
                        config.indicadors.getValor(estudiant.activitats).ActivitatEstudiantAulaVO.forEach(function (activitat) {
                            activitat.lliuraments.forEach(function (lliurament) {
                                if (lliurament.LliuramentActivitatEstudiantVO) {
                                    lliurament.LliuramentActivitatEstudiantVO.forEach(function (ll) {
                                        tercer.ultima = {
                                            dataEnviament: moment(config.indicadors.getValor(ll.dataEnviament)).format("DD/MM/YYYY HH:mm:ss"),
                                            dataDescarregaConsultor: moment(config.indicadors.getValor(ll.dataDescarregaConsultor)).format("DD/MM/YYYY HH:mm:ss"),
                                            codQualificacio: config.indicadors.getValor(activitat.codQualificacio).constructor === Object ? config.nc() : config.indicadors.getValor(activitat.codQualificacio),
                                            descripcio: config.indicadors.getValor(activitats[config.indicadors.getValor(ll.ordre)].descripcio)
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
    };

    /**
     * Última activitat entregada
     * @param anyAcademic
     * @param codAssignatura
     * @param codAula
     * @param next
     */
    var ultimaActivitatEntregada = function (anyAcademic, codAssignatura, codAula, next) {
        var ultima = 0;
        config.services.rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function (err, result) {
            if (err) return next(err);
            if (result.out.ActivitatVO) {
                result.out.ActivitatVO.forEach(function (activitat) {
                    if (moment(activitat.dataLliurament).isBefore(moment())) {
                        ultima = activitat.ordre;
                    }
                });
            }
            return next(null, ultima);
        });
    };

    /**
     * Estudiants que no han entregat l'última activitat
     * @param anyAcademic
     * @param codAssignatura
     * @param codAula
     * @param ordre
     * @param next
     */
    var estudiantsAmbActivitatNoEntregada = function (anyAcademic, codAssignatura, codAula, ordre, next) {
        var estudiants = [];
        config.services.rac.getEstudiantsByAulaAmbActivitats(codAssignatura, anyAcademic, codAula, function (err, result) {
            if (err) return next(err);
            if (result.out.EstudiantAulaVO) {
                result.out.EstudiantAulaVO.forEach(function (estudiant) {
                    var tercer = new mtercer(config.indicadors.getValor(estudiant.tercer));
                    tercer.entregada = false;
                    config.indicadors.getValor(estudiant.activitats).ActivitatEstudiantAulaVO.forEach(function (activitat) {
                        activitat.lliuraments.forEach(function (lliurament) {
                            if (lliurament.LliuramentActivitatEstudiantVO) {
                                lliurament.LliuramentActivitatEstudiantVO.forEach(function (ll) {
                                    if (ll.ordre == ordre) {
                                        tercer.ultima = {
                                            dataEnviament: moment(config.indicadors.getValor(ll.dataEnviament)).format("DD/MM/YYYY HH:mm:ss"),
                                            dataDescarregaConsultor: moment(config.indicadors.getValor(ll.dataDescarregaConsultor)).format("DD/MM/YYYY HH:mm:ss"),
                                            codQualificacio: config.indicadors.getValor(activitat.codQualificacio).constructor === Object ? config.nc() : config.indicadors.getValor(activitat.codQualificacio),
                                            descripcio: config.indicadors.getValor(activitats[config.indicadors.getValor(ll.ordre)].descripcio)
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
    };

    /**
     * Llista d'estudiants que fa més de :dies dies que es connecten a l'aula
     * @param anyAcademic
     * @param codAssignatura
     * @param codAula
     * @param classroomId
     * @param dies
     * @param s
     * @param next
     */
    var aula = function (anyAcademic, codAssignatura, codAula, classroomId, dies, s, next) {
        var ordre = 0;
        var estudiants = [];
        config.services.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function (err, result) {
            if (err) return next(err);
            result.out = result.out || {};
            estudiants = result.out.EstudiantAulaVO || [];

            exports.ultimaActivitatEntregada(anyAcademic, codAssignatura, codAula, function (err, result) {
                ordre = result;
                config.async.each(estudiants, informacio, function (err) {
                    return next(err, estudiants);
                });
            });
        });

        /**
         * Obté la informació per un estudiant d'una aula
         * @param estudiant
         * @param next
         */
        var informacio = function (estudiant, next) {
            var tercer = new mtercer(config.indicadors.getValor(estudiant.tercer));
            config.async.parallel([
                function (next) {
                    config.services.lrs.byidpandclassroomlast(tercer.idp, classroomId, s, function (err, result) {
                        if (err) return next(err);
                        estudiant.diesquefa = result && config.indicadors.getValor(result.value) ? moment().diff(moment(config.indicadors.getValor(result.value).stored), 'days') : 100;
                        if (estudiant.diesquefa > dies) {
                            estudiant.ultimaConnexio = config.indicadors.getUltimaConnexio(result);
                        }
                        return next();
                    });
                },
                function (next) {
                    config.services.rac.getActivitatsByEstudiantAulaOrdre(anyAcademic, codAssignatura, codAula, ordre, estudiant.numExpedient, function (err, result) {
                        estudiant.activitat = result.out;
                        estudiant.lliurada = result.out.lliuraments.hasOwnProperty('LliuramentActivitatEstudiantVO');
                        return next();
                    });
                }
            ], function (err) {
                return next();
            });
        };
    };

    return {
        all: all,
        aula: aula,
        ultimaPACEntregada: ultimaPACEntregada,
        ultimaActivitatEntregada: ultimaActivitatEntregada,
        estudiantsAmbActivitatNoEntregada: estudiantsAmbActivitatNoEntregada
    }
};