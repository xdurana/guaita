var config = require(__base + '/config');
var ws = require(__base + '/ws');
var indicadors = require(__base + '/lib/routes/indicadors');
var Tercer = require(__base + '/lib/models/tercer');

module.exports = {
    aula: function(anyAcademic, codAssignatura, codAula, idp, s, next) {
        var consultor = {
            fitxa: "#",
            nomComplert: ""
        };
        ws.rac.getAula(codAssignatura, anyAcademic, codAula, function(err, result) {
            if (err) return next(err);
            if (result.out.consultors) {
                consultor = new Tercer(indicadors.getValor(indicadors.getValor(indicadors.getValor(result.out.consultors).ConsultorAulaVO).tercer));
                consultor.fitxa = consultor.getFitxa(idp, s, function(err, url) {
                    consultor.fitxa = url;
                });
            }
            return next(null, consultor);
        });
    }
};