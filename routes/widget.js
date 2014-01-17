var async = require('async');

var indicadors = require('./indicadors');
var activitats = require('./activitats');
var consultors = require('./consultors');
var eines = require('./eines');
var config = require('../config');
var ws = require('../ws');

/**
 * Widget d'una aula per idp
 * @param anyAcademic
 * @param codAssignatura
 * @param domainId
 * @param codAula
 * @param domainIdAula
 * @param idp
 * @param s
 */
exports.one = function(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, s, callback) {

    var struct = {
        anyAcademic: anyAcademic,
        codAssignatura: codAssignatura,
        domainId: domainId,
        codAula: codAula,
        domainIdAula: domainIdAula,
        domainCode: domainCode,
        idp: idp,
        s: s
    };

    async.parallel([
        function (callback) {
            consultors.aula(anyAcademic, codAssignatura, codAula, idp, s, function(err, result) {
                if (err) { console.log(err); return callback(); }                
                struct.consultor = result;
                return callback();
            });
        },
        function (callback) {
            eines.aulaidp(anyAcademic, codAssignatura, domainId, codAula, domainIdAula, domainCode, idp, s, false, function(err, result) {
                if (err) { console.log(err); return callback(null, struct); }
                struct.eines = result.eines;                
                return callback();
            });
        },
        function (callback) {
            activitats.actives(domainId, domainIdAula, s, function(err, result) {
                if (err) { console.log(err); return callback(null, struct); }
                struct.actives = result.activitats;
                return callback();
            });
        },
        function (callback) {
            ws.aulaca.getGroupServlet(domainCode, s, function(err, result) {
                if (err) { console.log(err); return callback(err); }
                try {
                    struct.nomAssignatura = indicadors.decodeHtmlEntity(result[0].titol[0]);
                    struct.recursos = result ? result[0].recurs : null;
                    struct.missatgesPendents = result[0]['$']['numMsgPendents'];
                    struct.connectats = result[0]['$']['conectats'];
                    struct.urlAula = result[0]['$']['hrefEstudiantsConnectats'];
                    struct.isAulaca = struct.urlAula.match(/aulaca/);
                    struct.domainCode = result[0]['$']['code'];
                    struct.color = result[0].color[0];
                } catch(e) {
                    console.log(e.message);
                }
                return callback();
            });
        },
        function (callback) {
            indicadors.esDocent(s, idp, domainId, function(err, result) {
                struct.docent = result;
                struct.urlAvaluacio = indicadors.getUrlRAC(s, domainId, result);
                return callback();
            });
        }
    ], function(err, results) {
        if (err) { console.log(err); return callback(null, struct); }
        calcularIndicadorsEines(struct.eines, struct.recursos);
        if (struct.actives && struct.actives.length > 0) {
            async.each(struct.actives, getEinesActivitat, function(err) {
                if (err) { console.log(err); }
                return callback(null, struct);
            });
        } else {
            return callback(null, struct);
        }
    });

    var calcularIndicadorsEines = function(eines, recursos) {
        if (eines) {
            eines.forEach(function(eina) {
                eina.num_msg_pendents = "-";
                eina.num_msg_totals = "-";
                eina.viewItemsUrl = config.util.format('%s%s', config.cv(), eina.viewItemsUrl);
                eina.viewItemsUrl = eina.viewItemsUrl.replace("$PREVIEW$", '1');
                eina.mostrar = (eina.visible == 0 || eina.visible == 1 && struct.docent);
                if (recursos) {
                    recursos.forEach(function(recurs) {
                        try {
                            if (recurs['$'].resourceId == eina.resourceId) {
                                eina.viewItemsUrl = recurs.url[0];
                                eina.num_msg_pendents = Math.max(recurs.num_msg_pendents[0], 0);
                                eina.num_msg_totals = Math.max(recurs.num_msg_totals[0], 0);
                            }
                        } catch(e) {
                            console.log(e.message);
                        }
                    });
                }
                eina.num_msg_pendents_class = eina.num_msg_pendents > 0 ? 'nous' : 'total';
            });
        }
    }

    var getEinesActivitat = function(activitat, callback) {
        calcularIndicadorsEines(activitat.eines, struct.recursos);
        activitat.link = indicadors.getLinkActivitat(s, struct.isAulaca, domainIdAula, struct.domainCode ,activitat.eventId);
        ws.aulaca.getEinesPerActivitat(domainId, domainIdAula, activitat.eventId, s, function(err, result) {
            if (err) { console.log(err); return callback(); }
            activitat.eines = result;
            activitat.startDateStr = activitat.startDateStr.replace(/-/g, '/');
            activitat.deliveryDateStr = activitat.deliveryDateStr.replace(/-/g, '/');
            return callback();
        });
    }
}