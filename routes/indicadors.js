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

exports.getFitxa = function(idp, s) {
    
    //TODO

    var jsp = '/jsp/cercaContextual/curriculum.jsp';
    var operacion = 'searchUser';
    var USERID = idp;
    var appId = 'UOC';
    var l = '/a';
    var id_usuario_conectado = '281933';
    var dirFotos = 'http://cv.uoc.edu/UOC/mc-icons/fotos/';
    var cercaActiveTab = 'cercaBasica';
    var style = 'uoc';
    var position = 'both';
    var index = 'canter';
    var maxPageItems = '20';
    var MaxIndexPages = '0';
    var fitxa = util.format('%s/webapps/cercaPersones/cercaContextualServlet?jsp=%s&operacion=%s&USERID=%s&appId=%s&idLang=%s&s=%s&l=%s&id_usuario_conectado=%s',
        config.cv(),
        jsp,
        operacion,
        USERID,
        appId,
        l,
        s,
        l,
        id_usuario_conectado
    );

    return "#";
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
        var dt = new Date(object.value);
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