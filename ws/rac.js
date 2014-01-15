var config = require('../config');
var service = require('./service');

exports.getAssignaturesByResponsableAny = function(idp, anyAcademic, callback) {
	var args = {
		in0: idp,
		in1: anyAcademic,
        in2: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.getEstudiantsPerAula = function(anyAcademic, codAssignatura, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getEstudiantsByAula', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.getActivitatsByEstudiantAula = function(anyAcademic, codAssignatura, numAula, numExpedient, callback) {
	var args = {
		in0: numExpedient,
		in1: anyAcademic,
		in2: codAssignatura,
		in3: numAula,
        in4: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getActivitatsByEstudiantAula', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.getActivitatsByEstudiantAulaOrdre = function(anyAcademic, codAssignatura, numAula, ordre, numExpedient, callback) {
	var args = {
		in0: numExpedient,
		in1: anyAcademic,
		in2: codAssignatura,
		in3: numAula,
		in4: ordre,
        in5: config.i18next.lng()
	}

	service.operation(config.racwsdl(), 'getActivitatsByEstudiantAulaOrdre', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.calcularIndicadorsAula = function(tipusIndicador, codAssignatura, anyAcademic, numAula, ordre, comptarEquivalents, comptarRelacions, callback) {
	var args = {
		in0: tipusIndicador,
		in1: codAssignatura,
		in2: anyAcademic,
		in3: numAula,
		in4: ordre,
		in5: comptarEquivalents,
		in6: comptarRelacions,
        in7: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'calcularIndicadorsAula', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});		
}

exports.getNumEstudiantsQualificatsByActivitat = function(anyAcademic, codAssignatura, numAula, ordre, item, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
		in3: ordre,
        in4: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getNumEstudiantsQualificatsByActivitat', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.getUltimaActivitatAmbNotaByAula = function(anyAcademic, codAssignatura, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getUltimaActivitatAmbNotaByAula', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.getActivitatsByAula = function(anyAcademic, codAssignatura, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getActivitatsByAula', args, function(err, result) {		
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.calcularIndicadorsAssignatura = function(tipusIndicador, anyAcademic, codAssignatura, comptarEquivalents, comptarRelacions, callback) {
	var args = {
		in0: tipusIndicador,
		in1: codAssignatura,
		in2: anyAcademic,
		in3: comptarEquivalents,
		in4: comptarRelacions,
        in5: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'calcularIndicadorsAssignatura', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.getAula = function(codAssignatura, anyAcademic, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getAula', args, function(err, result) {
        if(err) { console.log(err); }
		callback(err, result);
	});
}

exports.getActivitat = function(codAssignatura, anyAcademic, numAula, ordre, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
		in3: ordre,
        in4: config.i18next.lng()
	}
	service.operation(config.racwsdl(), 'getActivitat', args, function(err, result) {
		if(err) { console.log(err); }
		callback(err, result);
	});
}