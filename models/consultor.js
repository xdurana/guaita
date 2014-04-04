var config = require('../config');
var indicadors = require('../routes/indicadors');
var ws = require('../ws');

var Tercer = require('./tercer');

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