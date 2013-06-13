var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, codAula, numExpedient, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/estudiant/476981/connexions

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		numExpedient: numExpedient,
		connexions: []
	}

	callback(null, struct);
}