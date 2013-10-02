var config = require('../config');
var encoder = require('./encoder');
var util = require('util');

var getValor = function(object) {
    return Array.isArray(object) ? object[0] : object;
};

exports.getNomComplert = function(tercer) {
    var complert = '';
    try {
        var t = getValor(tercer);
        complert = util.format('%s %s',
            getValor(t.nom),
            getValor(t.primerCognom)
        );

    	if (typeof getValor(t.segonCognom) == 'string') {
    		complert += ' ' + getValor(t.segonCognom);
    	}
    	if (typeof getValor(t.tercerCognom) == 'string') {
    		complert += ' ' + getValor(t.tercerCognom);
    	}
    } catch(e) {
    }
    return complert;
}

exports.getFitxa = function(userid, idp, s) {
    return '#';
    //TODO get Id Campus de l'usuari
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
        var dt = new Date(getValor(object.value).stored);
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
    if (!data) {
        return config.nc();
    }
    try {
        var dt = new Date(getValor(data));
        config.debug(data);
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
    var total = config.nc();
	if (indicadors) {
		indicadors.forEach(function(item) {
			if (getValor(getValor(item.indicador).codIndicador) == nom) {
				total = /^(\d+)*/g.exec(getValor(item.valor))[0];
			}
		})
	}
    return total;
}

var getIndicadorSenseFiltrar = function(indicadors, nom) {
    var total = config.nc();
	if (indicadors) {
		indicadors.forEach(function(item) {
			if (getValor(getValor(item.indicador).codIndicador) == nom) {
				total = getValor(item.valor);
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

exports.getValor = getValor;