var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Llista d'assignatures per idp responsable i any acadèmic
 * @param idp
 * @param anyAcademic
 * @param callback
 */
exports.getAssignaturesByResponsableAny = function(idp, anyAcademic, callback) {
	var args = {
		in0: idp,
		in1: anyAcademic,
        in2: config.lng()
	};
	service.operation(config.racwsdl(), 'getAssignaturesByResponsableAny', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * llista d'estudiants per aula
 * @param anyAcademic
 * @param codAssignatura
 * @param numAula
 * @param callback
 */
exports.getEstudiantsPerAula = function(anyAcademic, codAssignatura, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.lng()
	};
	service.operation(config.racwsdl(), 'getEstudiantsByAula', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Llista d'activitats per estudiant i aula
 * @param anyAcademic
 * @param codAssignatura
 * @param numAula
 * @param numExpedient
 * @param callback
 */
exports.getActivitatsByEstudiantAula = function(anyAcademic, codAssignatura, numAula, numExpedient, callback) {
	var args = {
		in0: numExpedient,
		in1: anyAcademic,
		in2: codAssignatura,
		in3: numAula,
        in4: config.lng()
	};
	service.operation(config.racwsdl(), 'getActivitatsByEstudiantAula', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Informació d'una activitat per estudiant
 * @param anyAcademic
 * @param codAssignatura
 * @param numAula
 * @param ordre
 * @param numExpedient
 * @param callback
 */
exports.getActivitatsByEstudiantAulaOrdre = function(anyAcademic, codAssignatura, numAula, ordre, numExpedient, callback) {
	var args = {
		in0: numExpedient,
		in1: anyAcademic,
		in2: codAssignatura,
		in3: numAula,
		in4: ordre
	};
	service.operation(config.racwsdl(), 'getActivitatsByEstudiantAulaOrdre', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Indicadors d'una aula
 * @param tipusIndicador
 * @param codAssignatura
 * @param anyAcademic
 * @param numAula
 * @param ordre
 * @param comptarEquivalents
 * @param comptarRelacions
 * @param callback
 */
exports.calcularIndicadorsAula = function(tipusIndicador, codAssignatura, anyAcademic, numAula, ordre, comptarEquivalents, comptarRelacions, callback) {
	var args = {
		in0: tipusIndicador,
		in1: codAssignatura,
		in2: anyAcademic,
		in3: numAula,
		in4: '1',
		in5: comptarEquivalents,
		in6: comptarRelacions,
        in7: config.lng()
	};
	service.operation(config.racwsdl(), 'calcularIndicadorsAula', args, function(err, result) {
        return callback(err, result);
	});		
};

/**
 * Nombre d'estudiants amb qualificació per una activitat determinada
 * @param anyAcademic
 * @param codAssignatura
 * @param numAula
 * @param ordre
 * @param item
 * @param callback
 */
exports.getNumEstudiantsQualificatsByActivitat = function(anyAcademic, codAssignatura, numAula, ordre, item, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
		in3: ordre,
        in4: config.lng()
	};
	service.operation(config.racwsdl(), 'getNumEstudiantsQualificatsByActivitat', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Última activitat qualificada en una aula
 * @param anyAcademic
 * @param codAssignatura
 * @param numAula
 * @param callback
 */
exports.getUltimaActivitatAmbNotaByAula = function(anyAcademic, codAssignatura, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.lng()
	};
	service.operation(config.racwsdl(), 'getUltimaActivitatAmbNotaByAula', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Llista d'activitats avaluables d'una aula
 * @param anyAcademic
 * @param codAssignatura
 * @param numAula
 * @param callback
 */
exports.getActivitatsByAula = function(anyAcademic, codAssignatura, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.lng()
	};
	service.operation(config.racwsdl(), 'getActivitatsByAula', args, function(err, result) {		
		return callback(err, result);
	});
};

/**
 * Indicadors d'una assignatura
 * @param tipusIndicador
 * @param anyAcademic
 * @param codAssignatura
 * @param comptarEquivalents
 * @param comptarRelacions
 * @param callback
 */
exports.calcularIndicadorsAssignatura = function(tipusIndicador, anyAcademic, codAssignatura, comptarEquivalents, comptarRelacions, callback) {
	var args = {
		in0: tipusIndicador,
		in1: codAssignatura,
		in2: anyAcademic,
		in3: comptarEquivalents,
		in4: comptarRelacions,
        in5: config.lng()
	};
	service.operation(config.racwsdl(), 'calcularIndicadorsAssignatura', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Informació d'una aula
 * @param codAssignatura
 * @param anyAcademic
 * @param numAula
 * @param callback
 */
exports.getAula = function(codAssignatura, anyAcademic, numAula, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
        in3: config.lng()
	};
	service.operation(config.racwsdl(), 'getAula', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Informació d'una activitat
 * @param codAssignatura
 * @param anyAcademic
 * @param numAula
 * @param ordre
 * @param callback
 */
exports.getActivitat = function(codAssignatura, anyAcademic, numAula, ordre, callback) {
	var args = {
		in0: anyAcademic,
		in1: codAssignatura,
		in2: numAula,
		in3: ordre,
        in4: config.lng()
	};
	service.operation(config.racwsdl(), 'getActivitat', args, function(err, result) {
		return callback(err, result);
	});
};

/**
 * Llista d'estudiants d'una aula amb informació associada a les activitats
 * @param codAssignatura
 * @param anyAcademic
 * @param numAula
 * @param callback
 */
exports.getEstudiantsByAulaAmbActivitats = function(codAssignatura, anyAcademic, numAula, callback) {
    var args = {
        in0: anyAcademic,
        in1: codAssignatura,
        in2: numAula,
        in4: config.lng()
    };
    service.operation(config.racwsdl(), 'getEstudiantsByAulaAmbActivitats', args, function(err, result) {
        return callback(err, result);
    });
};