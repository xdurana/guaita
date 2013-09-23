var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');
var forum = require('../ws/forum');
var phpbb = require('../ws/phpbb');
var aulaca = require('../ws/aulaca');
var lrs = require('../ws/lrs');

var isPHPBB = function(eina) {
    if (eina.idTipoLink === 'BB_FORUMS') {
        return true;
    }
    return false;
}

var isForum = function(eina) {
    if (eina.idTipoLink === 'PRIVATEBB' || eina.idTipoLink === 'WKGRP_FO_TH') {
        return true;
    }
    return false;
}

var getToolDescription = function(description) {
    //TODO i18n
    description = description.replace(/\$TAULER\$/g, 'Tauler');
    description = description.replace(/\$FORUM\$/g, 'Fòrum');
    description = description.replace(/\$D_STATUS_FILEAREAS\$/g, 'Àrea de fitxers');
    return description;
}

exports.aula = function(domainId, domainIdAula, idp, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		eines: [
		]
	};

	var getResumComunicacio = function (eina, callback) {
		eina.nom = getToolDescription(eina.description);
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc()
			}
		}

        async.parallel([
            function(callback) {
                if (isForum(eina)) {
                    async.parallel([
                        function(callback) {
                            forum.one(eina.domainId, eina.resourceId, s, function(err, result) {
                                if (err) { console.log(err); return callback(); }
                                //TODO
                                //eina.resum.comunicacio.lecturesPendentsAcumulades = result.totalPendingUsersByClassroom;
                                return callback();
                            });
                        },
                        function(callback) {
                            callback();
                        },
                        function(callback) {
                            callback();
                        }
                    ], function(err, results) {
                        if (err) { console.log(err); }
                        callback();
                    });
                } else {
                    callback();
                }
            },
            function(callback) {
                if (isPHPBB(eina)) {
                    async.parallel([
                        function(callback) {
                            phpbb.one(eina.domainId, eina.resourceId, function(err, result) {
                                if (err) { console.log(err); return callback(); }
                                eina.resum.comunicacio.lecturesPendentsAcumulades = result.totalPendingUsersByClassroom;
                                return callback();
                            });
                        },
                        function(callback) {
                            phpbb.total(eina.domainId, eina.resourceId, function(err, result) {
                                if (err) { console.log(err); return callback(); }
                                eina.resum.comunicacio.participacions = result;
                                return callback();
                            });
                        },
                        function(callback) {
                            phpbb.alert(eina.domainId, eina.resourceId, idp, function(err, result) {
                                if (err) { console.log(err); return callback(); }
                                eina.resum.comunicacio.lecturesPendents = result;
                                return callback();
                            });
                        }
                    ], function(err, results) {
                        if (err) { console.log(err); }
                        callback();
                    });
                } else {
                    callback();
                }
            },
            function(callback) {
                lrs.bytoolandclassroom(domainIdAula, eina.resourceId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return callback();
                });
            }
        ], function(err, results) {
            if (err) { console.log(err); }
            callback();
        });
	}

	aulaca.getEinesPerAula(domainId, domainIdAula, s, function(err, result) {
		if (err) { console.log(err); return callback(null, struct); }
		struct.eines = result;
        try {
    		async.each(struct.eines, getResumComunicacio, function(err) {
    			return callback(null, struct);
    		});
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
	});
}

exports.activitat = function(domainId, domainIdAula, eventId, idp, s, callback) {

    var struct = {
    	s: s,
        domainId: domainId,
        domainIdAula: domainIdAula,
        eventId: eventId,
        eines: [
        ]
    };

	var getResumComunicacio = function (domainIdAula, eina, callback) {
		eina.nom = getToolDescription(eina.description);
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendentsAcumulades: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc()
			}
		}

        lrs.bytoolandclassroom(domainIdAula, eina.resourceId, s, function(err, result) {
            if (err) { console.log(err); return callback(); }
            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return callback();
        });
	}

    aulaca.getEinesPerActivitat(domainId, domainIdAula, eventId, s, function(err, result) {
		if (err) { console.log(err); return callback(null, struct); }
		struct.eines = result;
        try {
    		async.each(struct.eines, getResumComunicacio.bind(null, domainIdAula), function(err) {
    			return callback(null, struct);
    		});
        } catch (e) {
            console.log(e.message);
            return callback(null, struct);
        }
    });
}

exports.activitatEstudiant = function(domainId, domainIdAula, eventId, idp, s, callback) {

	var struct = {
		s: s,
		domainId: domainId,
		domainIdAula: domainIdAula,
		eventId: eventId,
		idp: idp,
		eines: [
		]
	};

	var getResumComunicacioEstudiant = function (eina, callback) {
		eina.nom = getToolDescription(eina.description);
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		}

        lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
            if (err) { console.log(err); return callback(); }
            eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
            return callback();
        });
	}

	aulaca.getEinesPerActivitat(domainId, domainIdAula, eventId, s, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        struct.eines = result;
        try {
            async.each(struct.eines, getResumComunicacioEstudiant, function(err) {
                return callback(null, struct);
            });
        } catch (e) {
            console.log(e.message);
            return callback(null, struct);
        }
	});
}

exports.aulaidp = function(domainId, domainIdAula, idp, s, callback) {

	var struct = {
		domainId: domainId,
		domainIdAula: domainIdAula,
		idp: idp,
		eines: [
		]
	};

	var getResumComunicacioIdp = function (eina, callback) {

		eina.nom = getToolDescription(eina.description);
		eina.resum = {
			comunicacio: {
				clicsAcumulats: config.nc(),
				lecturesPendents: config.nc(),
				participacions: config.nc(),
				ultimaConnexio: config.nc()
			}
		}

        async.parallel([
            function(callback) {
                if (isPHPBB(eina)) {
                    async.parallel([
                        function(callback) {
                            phpbb.total(eina.domainId, eina.resourceId, function(err, result) {
                                if (err) { console.log(err); return callback(); }
                                eina.resum.comunicacio.participacions = result;
                                return callback();
                            });
                        },
                        function(callback) {
                            phpbb.alert(eina.domainId, eina.resourceId, idp, function(err, result) {
                                if (err) { console.log(err); return callback(); }
                                eina.resum.comunicacio.lecturesPendents = result;
                                return callback();
                            });
                        }
                    ], function(err, results) {
                        if (err) { console.log(err); }
                        callback();
                    });
                } else {
                    callback();
                }
            },
            function(callback) {
                lrs.byidpandtool(idp, eina.resourceId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    eina.resum.comunicacio.clicsAcumulats = result ? result.value : config.nc();
                    return callback();
                });
            },
            function(callback) {
                lrs.byidpandtoollast(idp, eina.resourceId, s, function(err, result) {
                    if (err) { console.log(err); return callback(); }
                    eina.resum.comunicacio.ultimaConnexio = indicadors.getUltimaConnexio(result);
                    return callback();
                });
            }
        ], function(err, results) {
            if (err) { console.log(err); }
            return callback();
        });
	}

    aulaca.getEinesPerAula(domainId, domainIdAula, s, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        struct.eines = result;
        try {
            async.each(struct.eines, getResumComunicacioIdp, function(err) {
                return callback(null, struct);
            });
        } catch (e) {
            console.log(e.message);
            return callback(null, struct);
        }
    });
}