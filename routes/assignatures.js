var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');
var service = require('../service');

exports.bypra = function(idp, anyAcademic, callback) {

	getAssignaturesByResponsableAny(idp, anyAcedemic, function(err, result) {
		if(err) { console.log(err); callback(true); return; }

		async.each(result.out.AssignaturaReduidaVO, getAssignaturesRelacionades, function(err) {
			if(err) { console.log(err); callback(true); return; }

			async.each(Object.keys(courses), getCourseStats, function(err) {
				if(err) { console.log(err); callback(true); return; }

				async.each(Object.keys(groups), getGroupStats, function(err) {
					if(err) { console.log(err); callback(true); return; }

					res.json(groups);
				});
			});
		});
	});
}

var getAssignaturesRelacionades = function(item, callback) {

	var codAssignatura = item.codAssignatura[0];
	var args = {
		in0: 1,
		in1: codAssignatura,
		in2: req.query.anyAcademic,
		in3: 'ca'
	}
	item.filles = [];
	item.indicadors = {};
	courses[codAssignatura] = item;
	service.operation(config.dadesacademiqueswsdl(), 'getAssignaturesRelacionades', args, function(err, result) {

		item.relacions = result.out.AssignaturaRelacionadaVO;
		codiMare = indicadors.getCodiMare(item.relacions);
		codi = codiMare ? codiMare : codAssignatura;
		groups[codi] = groups[codi] ? groups[codi] : {};
		groups[codi].assignatures = groups[codi].assignatures ? groups[codi].assignatures : [];
		groups[codi].assignatures.push(item);
		if (codiMare) {
			courses[codiMare].filles.push(item);
		}			
		callback();
	});
}