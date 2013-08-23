exports.getNomComplert = function(tercer) {
	var complert = '';
	complert = tercer[0].nom[0] + ' ' + tercer[0].primerCognom[0];
	if (typeof tercer[0].segonCognom[0] == 'string') {
		complert += ' ' + tercer[0].segonCognom[0];
	}
	if (typeof tercer[0].tercerCognom == 'string') {
		complert += ' ' + tercer[0].tercerCognom[0];
	}
	return complert;
}

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

var getIndicador = function(indicadors, nom) {
	var total = 0;
	if (indicadors) {
		indicadors.forEach(function(item) {
			if (item.indicador[0].codIndicador[0] == nom) {
				total = /^(\d+)*/g.exec(item.valor[0])[0];
			}
		})
	}
	return parseInt(total);
}

var getIndicadorSenseFiltrar = function(indicadors, nom) {
	var total = 0;
	if (indicadors) {
		indicadors.forEach(function(item) {
			if (item.indicador[0].codIndicador[0] == nom) {
				total = item.valor[0];
			}
		})
	}
	return total;
}

exports.getTotalEstudiantsTotal = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_TOTAL');
}

exports.getTotalEstudiantsRepetidors = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_REPITE');
}

exports.getTotalEstudiantsPrimeraMatricula = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_1A_MATR');
}

exports.getSeguimentACAula = function(indicadors) {
	return getIndicadorSenseFiltrar(indicadors, 'ESTUD_PARTICIPA_AC');
}

exports.getSuperacioACAula = function(indicadors) {
	return getIndicadorSenseFiltrar(indicadors, 'ESTUD_SUPERA_AC');
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

exports.getSeguimentACAulaActivitat = function() {
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