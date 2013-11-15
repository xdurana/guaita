var express = require('express');
var http = require('http')
var path = require('path');
var request = require('request');
var swig = require('swig');
var util = require('util');
var i18next = require('i18next');

var config = require('./config');

var assignatures = require('./routes/assignatures');
var aules = require('./routes/aules');
var activitats = require('./routes/activitats');
var eines = require('./routes/eines');
var estudiants = require('./routes/estudiants');
var consultors = require('./routes/consultors');
var widget = require('./routes/widget');
var indicadors = require('./routes/indicadors');
var campus = require('./ws/campus');

var app = express();

i18next.init({
    lng: 'ca'
});

app.set('port', config.port());

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

app.use(express.favicon());
app.use(express.bodyParser());
app.use(i18next.handle);
app.use(express.methodOverride());
app.use('/app/guaita', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(app.router);

i18next.registerAppHelper(app);

app.use(function(req, res, next) {
	res.json({
		status: 404,
		url: req.url
	});
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	next(err);
});

app.use(function(err, req, res, next) {
	res.status(500);
	res.json({
		status: 500,
		url: req.url,
		error: err 
	});
});

/**
 * IDP course list
 * @mockup: aulas_pra.html
 * Ok
 */
app.get(config.base() + '/assignatures', function (req, res, callback) {

	if (req.query.s && req.query.perfil) {
        campus.getIdpBySession(req.query.s, function (err, idp) {
            if(err) { console.log(err); callback(); return; }
            idp = (req.query.idp && idp == config.idpadmin()) ? req.query.idp : idp;
            return assignatures.byidp(
                req.query.s,
                idp,
                function (err, result) {
                    if(err) { console.log(err); callback(); return; }
                    if (req.query.format) {
                        res.json(result);
                    } else {
                        result.s = req.query.s;
                        result.idp = idp;
                        if (req.query.perfil == 'pra') {
                            result.retorn = util.format(
                                '%s/webapps/classroom/081_common/jsp/aulespra.jsp?s=%s',
                                config.cv(),
                                req.query.s
                            );
                            res.render('pra.html', { object: result });
                        } else {
                            result.retorn = util.format(
                                '%s/UOC/a/cgi-bin/hola?s=%s&tmpl=p://cv.uoc.edu/%s/%s/ext_breakcam_0.htm?s=%s&ACCIO=B_AULES&t=docencia/responsable_aula.tmpl',
                                config.cv(),
                                req.query.s,
                                indicadors.getAppActiva(),
                                indicadors.getAppLang(),
                                req.query.s
                            );
                            res.render('consultor.html', { object: result });
                        }
                    }
                }
            );
        });
	} else {
		callback('manquen algun dels parametres de la crida [s, perfil]');
	}
});

/**
 * Course classroom list
 * @mockup: tabs_pra.html
 * Ok
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules', function (req, res, callback) {

    if (req.query.s && req.query.idp && req.query.perfil) {
        return aules.all(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.query.idp,
            req.query.s,
            req.query.perfil,
            function (err, result) {
            if(err) { console.log(err); callback(); return; }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                result.idp = req.query.idp;
                result.linkfitxaassignatura = util.format("http://cv.uoc.edu/tren/trenacc/web/GAT_EXP.PLANDOCENTE?any_academico=%s&cod_asignatura=%s&idioma=CAT&pagina=PD_PREV_PORTAL&cache=S", req.params.anyAcademic, req.params.codAssignatura);

                var isAulaca = result.aules.length > 0 ? result.aules[0].isAulaca : true;
                result.linkedicioaula = indicadors.getLinkDissenyAula(req.query.s, isAulaca, req.params.domainId);

                res.render(req.query.perfil == 'pra' ? 'tabs_pra.html' : 'tabs_consultor.html', { assignatura: result });
            }
        });
    } else {
        callback('manquen algun dels parametres de la crida [s, idp, perfil]');
    }
});

/**
 * Pàgina d'una aula
 * @mockup: aulas_individual.html
 * Ok
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode', function (req, res, callback) {
	if (req.query.s && req.query.idp) {
		return aules.one(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.query.idp,
            req.query.s,
            function (err, result) {
            if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('aula.html', { aula: result });
			}
		});
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Classroom activities
 * @mockup: actividades_aula.html
 * Ok
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/activitats', function (req, res, callback) {
    config.debug(req);
	if (req.query.s) {
		return activitats.aula(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.query.s,
            true,
            function (err, result) {
			if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('activitats-estudiants.html', { aula: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Eines per activitat
 * @mockup: actividades_aula.html
 * Ko
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/activitats/:eventId/eines', function (req, res, callback) {
	if (req.query.s && req.query.idp) {
		return eines.activitat(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.params.eventId,
            req.query.idp,
            req.query.s,
            function (err, result) {
			if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('eines-activitats-estudiants.html', { activitat: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Eines per aula
 * @mockup: herramientas_estudiantes.html
 * Ok
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/eines', function (req, res, callback) {
	if (req.query.s && req.query.idp) {
		return eines.aula(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.query.idp,
            req.query.s,
            function (err, result) {
			if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('eines-estudiants.html', { aula: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Avaluació per aula
 * @mockup: evaluacion_estudiantes.html
 * Ok
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/avaluacio', function (req, res, callback) {

    if (req.query.s) {
        return activitats.avaluacio(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.query.s,
            function (err, result) {
            if(err) { console.log(err); callback(); return; }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('avaluacio-estudiants.html', { aula: result });
            }
        })
    } else {
        callback('manquen algun dels parametres de la crida [s]');
    }
});

/**
 * Classroom activities per student
 * @mockup: actividades_aula.html
 * Ko
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/estudiants/:idp/activitats', function (req, res, callback) {
	if (req.query.s) {
		return activitats.idp(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.params.idp,
            req.query.s,
            function (err, result) {
			if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('activitats-aula.html', { aula: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Classroom activities per consultant
 * @mockup: actividades_consultores.html
 * Ok
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/consultors/:idp/activitats', function (req, res, callback) {
    if (req.query.s) {
        return activitats.idp(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.params.idp,
            req.query.s,
            function (err, result) {
            if(err) { console.log(err); callback(); return; }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('activitats-consultors.html', { aula: result });
            }
        })
    } else {
        callback('manquen algun dels parametres de la crida [s]');
    }
});

/**
 * Activity tools for a student
 * @mockup: herramientas_estudiantes.html
 * Ko
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/estudiants/:idp/activitats/:eventId/eines', function (req, res, callback) {
	if (req.query.s) {
		return eines.activitatEstudiant(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.params.eventId,
            req.params.idp,
            req.query.s,
            function (err, result) {
			if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('eines-activitat-estudiant.html', { activitat: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Classroom tools for a student
 * @mockup: actividades_aula.html
 * Ko
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/estudiants/:idp/eines', function (req, res, callback) {
	if (req.query.s) {
		return eines.aulaidp(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.params.idp,
            req.query.s,
            true,
            function (err, result) {
			if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				res.render('eines-aula-estudiant.html', { aula: result });
			}
		})
	} else {
		callback('manquen algun dels parametres de la crida [s]');
	}
});

/**
 * Classroom tools for a consultant
 * @mockup: herramientas_consultores.html
 * Ok
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/consultors/:idp/eines', function (req, res, callback) {
    if (req.query.s) {
        return eines.aulaidp(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.domainId,
            req.params.codAula,
            req.params.domainIdAula,
            req.params.domainCode,
            req.params.idp,
            req.query.s,
            true,
            function (err, result) {
            if(err) { console.log(err); callback(); return; }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('eines-aula-consultor.html', { aula: result });
            }
        })
    } else {
        callback('manquen algun dels parametres de la crida [s]');
    }
});

/**
 * Student widget
 * @mockup: widget_aula.html
 */
app.get(config.base() + '/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula/:domainCode/widget', function (req, res, callback) {
    if (req.query.s) { 
        campus.getIdpBySession(req.query.s, function (err, idp) {
            if(err) { console.log(err); callback(); return; }
            idp = (req.query.idp && idp == config.idpadmin()) ? req.query.idp : idp;
            return widget.one(
                req.params.anyAcademic,
                req.params.codAssignatura,
                req.params.domainId,
                req.params.codAula,
                req.params.domainIdAula,
                req.params.domainCode,
                idp,
                req.query.s,
                function (err, result) {
                if(err) { console.log(err); callback(); return; }
                if (req.query.format) {
                    res.json(result);
                } else {
                    result.s = req.query.s;
                    result.lang = i18next.lng();
                    res.render('widget-aula.html', { widget: result });
                }
            });
        });
    } else {
        callback('manquen algun dels parametres de la crida [s]');
    }
});

/**
 * Student classrooms page
 * @mockup: aulas_estudiante.html
 */
app.get(config.base() + '/estudiants', function (req, res, callback) {
    if (req.query.s) {
        campus.getIdpBySession(req.query.s, function (err, idp) {
            if(err) { console.log(err); callback(); return; }
            idp = (req.query.idp && idp == config.idpadmin()) ? req.query.idp : idp;
            return estudiants.aules(idp, req.query.s, function (err, result) {
                if(err) { console.log(err); callback(); return; }
                if (req.query.format) {
                    res.json(result);
                } else {
                    res.render('estudiant.html', {
                        object: result
                    });
                }
            });
        });
    } else {
        callback('manquen algun dels parametres de la crida [s]');
    }
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});