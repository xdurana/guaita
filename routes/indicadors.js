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
	return [];
}

exports.getActivitatsAssignatura = function() {
	//TODO
	return [];
}

exports.getEinesAssignatura = function() {
	//TODO
	return [];
}

exports.getTotalEstudiantsRepetidors = function() {
	//TODO
	return 0;
}

exports.getClicksAcumulatsAula = function() {
	//TODO
	return 0;
}

exports.getClicksAcumulatsAulaEina = function() {
	//TODO
	return 0;
}

exports.getLecturesPendentsAula = function() {
	//TODO
	return 0;
}

exports.getLecturesPendentsAulaEina = function() {
	//TODO
	return 0;
}

exports.getParticipacionsAula = function() {
	//TODO
	return 0;
}

exports.getParticipacionsAulaEina = function() {
	//TODO
	return 0;
}

exports.getSeguimentACAula = function() {
	//TODO
	return 0;
}

exports.getSeguimentACAulaActivitat = function() {
	//TODO
	return 0;
}

exports.getSuperacioACAula = function() {
	//TODO
	return 0;
}

exports.getSuperacioACAulaActivitat = function() {
	//TODO
	return 0;
}

exports.getDarreraActivitatLliuradaAula = function() {
	//TODO
	return 0;
}

exports.getDarreraActivitatLliuradaAulaActivitat = function() {
	//TODO
	return 0;
}

exports.getDarreraActivitatSuperadaAula = function() {
	//TODO
	return 0;
}

exports.getDarreraActivitatSuperadaAulaActivitat = function() {
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