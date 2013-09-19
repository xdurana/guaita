var config = require('../config');
var encoder = require('./encoder');
var util = require('util');

exports.getNomComplert = function(tercer) {
    var complert = '';
    try {    
    	complert = tercer[0].nom[0] + ' ' + tercer[0].primerCognom[0];
    	if (typeof tercer[0].segonCognom[0] == 'string') {
    		complert += ' ' + tercer[0].segonCognom[0];
    	}
    	if (typeof tercer[0].tercerCognom == 'string') {
    		complert += ' ' + tercer[0].tercerCognom[0];
    	}
    } catch(e) {
    }
    return complert;
}

exports.getFitxa = function(userid, idp, s) {
    return util.format(
        '%s/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=%s&appId=UOC&idLang=a&s=%s&l=a&id_usuario_conectado=%s',
        config.cv(),
        userid,
        s,
        idp
    );
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

exports.getUltimaConnexio = function(object) {
    try {
        var dt = new Date(object.value[0].stored);
        if (isNaN(dt.getMilliseconds())) return config.nc();
        return util.format('%s-%s-%s',
            dt.getDate(),
            dt.getMonth() + 1,
            dt.getFullYear()
        );
    } catch(e) {
        return config.nc();
    }
}

exports.decodeHtmlEntity = function(html) {
    return Encoder.htmlDecode(html);
};

exports.getDataLliurament = function(data) {
    try {
        var dt = new Date(data[0]);
        return util.format('%s-%s-%s',
            dt.getDate(),
            dt.getMonth() + 1,
            dt.getFullYear()
        );
    } catch(e) {
        return config.nc();
    }
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