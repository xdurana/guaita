var async = require('async');

var config = require('../config');
var indicadors = require('./indicadors');

var rac = require('../ws/rac');
var dadesacademiques = require('../ws/dadesacademiques');
var infoacademica = require('../ws/infoacademica');

exports.all = function(codAssignatura, anyAcademic, codAula, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/activitats

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		domainId: '382785',
		activitats: [
			{
				nom: 'Activitat 1 Lorem ipsum dolor',
				activityId: '696566'
			},
			{
				nom: 'Activitat 2 Consectur ips magna curator',
				activityId: '694961'
			}
		]
	}

	/*
	rac.getActivitatsByAula(anyAcademic, codAssignatura, codAula, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		struct.activitats = result.out.ActivitatVO;
		async.each(struct.aula.activitats, getIndicadorsActivitat, function(err) {
			if(err) { console.log(err); return; }
	  		callback(null, struct);
		});
	});		
	*/	

	callback(null, struct);
}

exports.one = function(codAssignatura, anyAcademic, codAula, ordre, callback) {

	//http://localhost:3333/assignatures/05.002/20122/aules/1/activitats/1

	var struct = {
		codAssignatura: codAssignatura,
		anyAcademic: anyAcademic,
		codAula: codAula,
		ordre: ordre,
		avaluacio: {
		}
	}

	var tipusIndicador = 'RAC_CONSULTOR_AC';
	var comptarEquivalents = '0';
	var comptarRelacions = '0';

	rac.calcularIndicadorsAula(tipusIndicador, codAssignatura, anyAcademic, codAula, ordre, comptarEquivalents, comptarRelacions, function(err, result) {
		if(err) { console.log(err); callback(true); return; }
		struct.avaluacio.seguimentac = indicadors.getSeguimentACAula(result.out.ValorIndicadorVO);
		struct.avaluacio.superacioac = indicadors.getSuperacioACAula(result.out.ValorIndicadorVO);
		callback(null, struct);
	});
}