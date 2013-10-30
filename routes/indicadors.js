var util = require('util');
var i18next = require('i18next');
var config = require('../config');
var encoder = require('./encoder');
var aulaca = require('../ws/aulaca');

var getValor = function(object) {
    return Array.isArray(object) ? object[0] : object;
};

var getAppLang = function() {
    return i18next.lng() == 'ca' ? 'a' : i18next.lng() == 'es' ? 'b' : 'c';
}

var getAppActiva = function() {
    return 'UOC';
}

var getNomComplert = function(tercer) {
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

var getFitxa = function(useridp, idp, s, callback) {
    aulaca.getUserIdPerIdp(useridp, s, function(err, userid) {
        if (err) {
            console.log(err);
            return callback(null, '#');
        } else {
            return callback(
                null,
                util.format(
                    '%s/webapps/cercaPersones/cercaContextualServlet?jsp=%2Fjsp%2FcercaContextual%2Fcurriculum.jsp&operacion=searchUser&USERID=%s&appId=UOC&idLang=a&s=%s&l=a&id_usuario_conectado=%s',
                    config.cv(),
                    userid,
                    s,
                    idp
                )
            );
        }
    });
}

var getTotalAules = function(AulaVO) {
	return AulaVO ? AulaVO.length : 0;
}

var getTotalEstudiants = function(AulaVO) {
	var estudiants = 0;
	if (AulaVO) {
		AulaVO.forEach(function(aula) {
			 estudiants += parseInt(aula.numPlacesAssignades);
		});
	}
	return estudiants;
}

var getUltimaConnexio = function(object) {
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

var decodeHtmlEntity = function(html) {
    return Encoder.htmlDecode(html);
};

var getDataLliurament = function(data) {
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

var getTotalEstudiantsTotal = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_TOTAL');
}

var getTotalEstudiantsRepetidors = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_REPITE');
}

var getTotalEstudiantsPrimeraMatricula = function(indicadors) {
	return getIndicador(indicadors, 'ESTUD_1A_MATR');
}

var getSeguimentACAula = function(indicadors) {
	return getIndicadorSenseFiltrar(indicadors, 'ESTUD_PARTICIPA_AC');
}

var getSuperacioACAula = function(indicadors) {
	return getIndicadorSenseFiltrar(indicadors, 'ESTUD_SUPERA_AC');
}

var getLinkAula = function(s, isAulaca, domainId, domainCode) { 
    return isAulaca ?
    util.format(
        '%s/webapps/aulaca/classroom/Classroom.action?s=%s&domainId=%s',
        config.cv(),
        s,
        domainId
    ) :
    util.format(
        '%s/webapps/classroom/081_common/jsp/iniciAula.jsp?s=%s&domainId=%s&domainCode=%s&img=aules&preview=1&idLang=a&ajax=true',
        config.cv(),
        s,
        domainId,
        domainCode
    );
}

var getLinkActivitat = function(s, isAulaca, domainId, domainCode, activityId) {
    return isAulaca ?
    util.format(
        '%s/webapps/aulaca/classroom/Classroom.action?s=%s&domainId=%s&activityId=%s&javascriptDisabled=false',
        config.cv(),
        s,
        domainId,
        activityId
    ) :
    getLinkAula(s, isAulaca, domainId, domainCode);
}

var getLinkDissenyAula = function(s, isAulaca, domainId) {
    return isAulaca ?
    util.format(
        '%s/webapps/aulaca/classroom/Classroom.action?s=%s&domainId=%s',
        config.cv(),
        s,
        domainId
    ) :
    util.format(
        '%s/webapps/classroom/classroom.do?nav=dissenydomini_inici&s=%s&domainId=%s&domainTypeId=AULA&idLang=a&ajax=true',
        config.cv(),
        s,
        domainId
    );
}

module.exports = {
    getValor: getValor,
    getAppLang: getAppLang,
    getAppActiva: getAppActiva,
    getNomComplert: getNomComplert,
    getFitxa: getFitxa,
    getTotalAules: getTotalAules,
    getLinkAula: getLinkAula,
    getLinkActivitat: getLinkActivitat,
    decodeHtmlEntity: decodeHtmlEntity,
    getUltimaConnexio: getUltimaConnexio,
    getTotalEstudiants: getTotalEstudiants,
    getSeguimentACAula: getSeguimentACAula,
    getSuperacioACAula: getSuperacioACAula,
    getTotalEstudiantsPrimeraMatricula: getTotalEstudiantsPrimeraMatricula,
    getTotalEstudiantsRepetidors: getTotalEstudiantsRepetidors,
    getTotalEstudiantsTotal: getTotalEstudiantsTotal,
    getDataLliurament: getDataLliurament,
    getLinkDissenyAula: getLinkDissenyAula
}