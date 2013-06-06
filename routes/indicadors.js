exports.getTotalEstudiants = function(AulaVO) {
	var estudiants = 0;
	if (AulaVO) {
		AulaVO.forEach(function(aula) {
			 estudiants += parseInt(aula.numPlacesAssignades);
		});
	}
	return estudiants;
}

exports.getTotalAules = function(AulaVO) {
	return AulaVO ? AulaVO.length : 0;
}

exports.getAssignaturesIdentiques = function() {
	//TODO
	return {};
}

exports.getTotalEstudiantsRepetidors = function() {
	//TODO
	return 0;
}

exports.getClicksAcumulatsAula = function() {
	//TODO
	return 0;
}

exports.getLecturesPendentsAula = function() {
	//TODO
	return 0;
}

exports.getParticipacionsAula = function() {
	//TODO
	return 0;
}

exports.getSeguimentACAula = function() {
	//TODO
	return 0;
}

exports.getSuperacioACAula = function() {
	//TODO
	return 0;
}

exports.getDarreraActivitatLliuradaAula = function() {
	//TODO
	return 0;
}

exports.getDarreraActivitatSuperadaAula = function() {
	//TODO
	return 0;
}

exports.getActivitatsAssignatura = function() {
	//TODO
	return 0;
}

exports.getActivitatLliuradaAula = function() {
	//TODO
	return 0;
}

exports.getActivitatSuperadaAula = function() {
	//TODO
	return 0;
}