var express = require('express');
var http = require('http')
var path = require('path');
var request = require('request');
var swig = require('swig');
var util = require('util');

var config = require('./config');

var assignatures = require('./routes/assignatures');
var aules = require('./routes/aules');
var activitats = require('./routes/activitats');
var eines = require('./routes/eines');
var estudiants = require('./routes/estudiants');
var consultors = require('./routes/consultors');

var app = express();

app.set('port', config.port());

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(app.router);

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
 * Test
 */
app.get('/test', function (req, res, callback) {
    res.json({
        status: 'ok'
    });
});

/**
 * IDP course list
 * @mockup: aulas_pra.html
 */
app.get('/assignatures', function (req, res, callback) {

	if (req.query.s && req.query.idp && req.query.anyAcademic && req.query.perfil) {
		return assignatures.byidp(
            req.query.s,
            req.query.idp,
            req.query.anyAcademic,
            function (err, result) {
            if(err) { console.log(err); callback(); return; }
			if (req.query.format) {
				res.json(result);
			} else {
				result.s = req.query.s;
				result.idp = req.query.idp;
				res.render(req.query.perfil == 'pra' ? 'pra.html' : 'consultor.html', { object: result });
			}
		});
	} else {
		callback('manquen algun dels parametres de la crida [s, idp, anyAcademic, perfil]');
	}
});

/**
 * Course classroom list
 * @mockup: tabs_pra.html
 */
app.get('/assignatures/:anyAcademic/:codAssignatura/:domainId/aules', function (req, res, callback) {

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
                result.linkedicioaula = util.format('%s/Edit.action?s=%s&domainId=%s', config.aulaca(), req.query.s, req.params.domainId);
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
 */
app.get('/assignatures/:anyAcademic/:codAssignatura/:domainId/aules/:codAula/:domainIdAula', function (req, res, callback) {
	if (req.query.s && req.query.idp) {
		return aules.one(
            req.params.anyAcademic,
            req.params.codAssignatura,
            req.params.codAula,
            req.query.idp,
            req.query.s,
            req.params.domainId,
            req.params.domainIdAula,
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/activitats', function (req, res, callback) {
	if (req.query.s) {
		return activitats.aula(req.params.domainId, req.params.domainIdAula, req.query.s, true, function (err, result) {
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/activitats/:eventId/eines', function (req, res, callback) {
	if (req.query.s && req.query.idp) {
		return eines.activitat(req.params.domainId, req.params.domainIdAula, req.params.eventId, req.query.idp, req.query.s, function (err, result) {
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/eines', function (req, res, callback) {
	if (req.query.s && req.query.idp) {
		return eines.aula(req.params.domainId, req.params.domainIdAula, req.query.idp, req.query.s, function (err, result) {
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
 */
app.get('/avaluacio/:anyAcademic/:codAssignatura/:codAula', function (req, res, callback) {

    if (req.query.s) {
        return activitats.avaluacio(req.params.anyAcademic, req.params.codAssignatura, req.params.codAula, req.query.s, function (err, result) {
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/estudiants/:idp/activitats', function (req, res, callback) {
	if (req.query.s) {
		return activitats.idp(req.params.domainId, req.params.domainIdAula, req.params.idp, req.query.s, function (err, result) {
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/consultors/:idp/activitats', function (req, res, callback) {
    if (req.query.s) {
        return activitats.idp(req.params.domainId, req.params.domainIdAula, req.params.idp, req.query.s, function (err, result) {
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/estudiants/:idp/activitats/:eventId/eines', function (req, res, callback) {
	if (req.query.s) {
		return eines.activitatEstudiant(req.params.domainId, req.params.domainIdAula, req.params.eventId, req.params.idp, req.query.s, function (err, result) {
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/estudiants/:idp/eines', function (req, res, callback) {
	if (req.query.s) {
		return eines.aulaidp(req.params.domainId, req.params.domainIdAula, req.params.idp, req.query.s, function (err, result) {
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
 */
app.get('/assignatures/:domainId/aules/:domainIdAula/consultors/:idp/eines', function (req, res, callback) {
    if (req.query.s) {
        return eines.aulaidp(req.params.domainId, req.params.domainIdAula, req.params.idp, req.query.s, function (err, result) {
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
 * Student classrooms page
 * @mockup: aulas_estudiante.html
 */
app.get('/estudiants/:idp', function (req, res, callback) {
    if (req.query.s) {
        return estudiants.aules(req.params.idp, req.query.s, function (err, result) {
            if(err) { console.log(err); callback(); return; }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                result.idp = req.params.idp;
                res.render('estudiant.html', { estudiant: result });
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
app.get('/assignatures/:domainId/aules/:domainIdAula/estudiants/:idp/widget', function (req, res, callback) {
    if (req.query.s) {
        return activitats.idp(req.params.domainId, req.params.domainIdAula, req.params.idp, req.query.s, function (err, result) {
            if(err) { console.log(err); callback(); return; }
            if (req.query.format) {
                res.json(result);
            } else {
                result.s = req.query.s;
                res.render('widget-aula.html', { aula: result });
            }
        })
    } else {
        callback('manquen algun dels parametres de la crida [s]');
    }
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});