exports.getTotalAules = function(AulaVO) {
	return AulaVO ? AulaVO.length : 0;
}

exports.getTotalEstudiants = function(AulaVO) {
	var estudiants = 0;
	if (AulaVO) {
		AulaVO.forEach(function(aula) {
			 estudiants += parseInt(aula.numPlacesAssignades);
		});
	}
	return estudiants;
}

exports.getTotalEstudiantsRepetidors = function(indicadors) {
	var repetidors = 0;
	indicadors.forEach(function(item) {
		if (item.indicador[0].codIndicador[0] == 'ESTUD_REPITE') {
			repetidors = /^(\d+)*/g.exec(item.valor[0])[0];
		}
	});
	return parseInt(repetidors);
}

exports.getCodiMare = function(relacions) {
	return relacions && relacions[0].tipusRelacio == 'I' ? relacions[0].codi[0] : false;
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