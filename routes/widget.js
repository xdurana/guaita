var async = require('async');

var indicadors = require('./indicadors');
var activitats = require('./activitats');
var aules = require('./aules');
var consultors = require('./consultors');
var usuaris = require('./usuaris');
var eines = require('./eines');
var config = require('../config');
var ws = require('../ws');

/**
 * [one description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   domainId       [description]
 * @param  {[type]}   codAula        [description]
 * @param  {[type]}   domainIdAula   [description]
 * @param  {[type]}   domainCode     [description]
 * @param  {[type]}   idp            [description]
 * @param  {[type]}   libs           [description]
 * @param  {[type]}   up_maximized   [description]
 * @param  {[type]}   s              [description]
 * @param  {Function} next       [description]
 * @return {[type]}                  [description]
 */
exports.one = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, libs, up_maximized, s, next) {

    domainCode = config.util.format('%s_%s', domainCode, parseInt(codAula) > 9 ? codAula : "0" + codAula);

    var struct = {
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        domainIdAula: domainIdAula,
        domainCode: domainCode,
        idp: idp,
        s: s,
        libs: libs,
        style: up_maximized == 'false' ? 'display:none' : 'display:block',
        lang: config.lng()
    };

    async.parallel([
        function (next) {
            eines.aulaidp(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, s, false, function(err, result) {
                if (err) return next(err);
                struct.eines = result.eines;                
                return next();
            });
        },
        function (next) {
            activitats.actives(domainId, domainIdAula, s, function(err, result) {
                if (err) return next(err);
                struct.actives = result.activitats;
                return next();
            });
        },
        function (next) {
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
                if (err) return next(err);
                struct.nomAssignatura = indicadors.decodeHtmlEntity(result[0].titol[0]);
                struct.recursos = result ? result[0].recurs : [];
                struct.missatgesPendents = result[0]['$']['numMsgPendents'];
                struct.connectats = result[0]['$']['conectats'];
                struct.domainCode = result[0]['$']['code'];

                var idTipoPresent = result[0]['$']['idTipoPresent'];
                struct.isAulaca = idTipoPresent.match(/AULACA/) ? true : false;
                struct.urlAula = aules.getLinkAula(s, struct.isAulaca, domainIdAula, domainCode);

                struct.color = result[0].color[0];
                struct.perfils = result ? (result[0].perfils ? result[0].perfils : []) : [];
                struct.perfils.forEach(function(perfil) {
                    if (perfil['$']['tipus'] === 'CREADOR' && perfil.user) {
                        struct.consultor = {
                            idp: perfil.user[0]['$']['id'],
                            nomComplert: indicadors.decodeHtmlEntity(perfil.user[0]['$']['nom']),
                            fitxa: '#'
                        }
                        usuaris.getFitxaUserId(struct.consultor.idp, idp, s, function(err, url) {
                            struct.consultor.fitxa = err ? '#' : url;
                        });
                    }
                });
                struct.perfils.forEach(function(perfil) {
                    if (perfil['$']['tipus'] === 'RESPONSABLE' && perfil.user) {
                        struct.consultor = {
                            idp: perfil.user[0]['$']['id'],
                            nomComplert: indicadors.decodeHtmlEntity(perfil.user[0]['$']['nom']),
                            fitxa: '#'
                        }
                        usuaris.getFitxaUserId(struct.consultor.idp, idp, s, function(err, url) {
                            struct.consultor.fitxa = err ? '#' : url;
                        });
                    }
                });

                return next();
            });
        },
        function (next) {
            ws.aulaca.isDocent(s, idp, domainId, function(err, result) {
                if (err) return next(err);
                struct.docent = result;
                struct.urlAvaluacio = indicadors.getUrlRAC(s, domainIdAula, result);
                return next();
            });
        }
    ], function(err, results) {
        if (err) return next(err);
        calcularIndicadorsEines(struct.eines, struct.recursos);
        if (true && struct.actives && struct.actives.length > 0) {
            async.each(struct.actives, getEinesActivitat, function(err) {
                return next(err, struct);
            });
        } else {
            return next(null, struct);
        }
    });

    var calcularIndicadorsEines = function(eines, recursos) {
        if (eines) {
            eines.forEach(function(eina) {
                eina.num_msg_pendents = "-";
                eina.num_msg_totals = "-";
                if (eina.viewItemsUrl.indexOf("http") < 0) {
                    eina.viewItemsUrl = config.util.format('%s%s', config.cv(), eina.viewItemsUrl);
                }

                eina.viewItemsUrl = eina.viewItemsUrl.replace("$PREVIEW$", '1');
                eina.mostrar = (eina.visible == 0 || eina.visible == 1 && struct.docent);
                if (recursos) {
                    recursos.forEach(function(recurs) {
                        try {
                            if (recurs['$'].resourceId == eina.resourceId || (recurs['$'].tipus === 'GROUPFATHER' && eina.idTipoLink === 'GROUPFATHER')) {
                                eina.viewItemsUrl = (eina.idTipoLink == 'MICROBLOG' && struct.isAulaca ? struct.urlAula : eina.viewItemsUrl);
                                eina.num_msg_pendents = Math.max(recurs.num_msg_pendents[0], -1);
                                eina.num_msg_totals = Math.max(recurs.num_msg_totals[0], recurs.num_msg_pendents[0]);
                            }
                        } finally {
                        }
                    });
                }
                eina.num_msg_pendents_class = eina.num_msg_pendents > 0 ? 'nous' : 'nous cap';
            });
        }
    }

    var getEinesActivitat = function(activitat, next) {
        activitat.link = aules.getLinkActivitat(s, struct.isAulaca, domainIdAula, struct.domainCode, activitat.eventId);
        return next();
        calcularIndicadorsEines(activitat.eines, struct.recursos);
        ws.aulaca.getEinesPerActivitat(domainId, domainIdAula, activitat.eventId, s, function(err, result) {
            if (err) return next(err);
            activitat.eines = result;
            activitat.startDateStr = activitat.startDateStr.replace(/-/g, '/');
            activitat.deliveryDateStr = activitat.deliveryDateStr.replace(/-/g, '/');
            return next();
        });
    }
}

/**
 * [minim description]
 * @param  {[type]}   anyAcademic    [description]
 * @param  {[type]}   codAssignatura [description]
 * @param  {[type]}   domainId       [description]
 * @param  {[type]}   codAula        [description]
 * @param  {[type]}   domainIdAula   [description]
 * @param  {[type]}   domainCode     [description]
 * @param  {[type]}   idp            [description]
 * @param  {[type]}   libs           [description]
 * @param  {[type]}   up_maximized   [description]
 * @param  {[type]}   s              [description]
 * @param  {Function} next           [description]
 * @return {[type]}                  [description]
 */
exports.minim = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, libs, up_maximized, s, next) {

    domainCode = config.util.format('%s_%s', domainCode, parseInt(codAula) > 9 ? codAula : "0" + codAula);

    var struct = {
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        domainIdAula: domainIdAula,
        domainCode: domainCode,
        idp: idp,
        s: s,
        libs: libs,
        style: up_maximized == 'false' ? 'display:none' : 'display:block',
        lang: config.lng()
    };

    ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
        if (err) return next(err);
        struct.nomAssignatura = indicadors.decodeHtmlEntity(result[0].titol[0]);
        struct.recursos = result ? result[0].recurs : [];
        struct.missatgesPendents = result[0]['$']['numMsgPendents'];
        struct.connectats = result[0]['$']['conectats'];
        struct.domainCode = result[0]['$']['code'];

        var idTipoPresent = result[0]['$']['idTipoPresent'];
        struct.isAulaca = idTipoPresent.match(/AULACA/) ? true : false;
        struct.urlAula = aules.getLinkAula(s, struct.isAulaca, domainIdAula, domainCode);

        struct.color = result[0].color[0];
        struct.perfils = result ? (result[0].perfils ? result[0].perfils : []) : [];
        struct.perfils.forEach(function(perfil) {
            if (perfil['$']['tipus'] === 'CREADOR' && perfil.user) {
                struct.consultor = {
                    idp: perfil.user[0]['$']['id'],
                    nomComplert: indicadors.decodeHtmlEntity(perfil.user[0]['$']['nom']),
                    fitxa: '#'
                }
                usuaris.getFitxaUserId(struct.consultor.idp, idp, s, function(err, url) {
                    struct.consultor.fitxa = err ? '#' : url;
                });
            }
        });
        struct.perfils.forEach(function(perfil) {
            if (perfil['$']['tipus'] === 'RESPONSABLE' && perfil.user) {
                struct.consultor = {
                    idp: perfil.user[0]['$']['id'],
                    nomComplert: indicadors.decodeHtmlEntity(perfil.user[0]['$']['nom']),
                    fitxa: '#'
                }
                usuaris.getFitxaUserId(struct.consultor.idp, idp, s, function(err, url) {
                    struct.consultor.fitxa = err ? '#' : url;
                });
            }
        });
        return next(null, struct);
    });
}