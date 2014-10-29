var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Fonts d'informació per assignatura
 * @param codAssignatura
 * @param anyAcademic
 * @param next
 */
exports.getRecursosByAssignatura = function(codAssignatura, anyAcademic, next) {
    var args = {
        in0: codAssignatura,
        in1: anyAcademic,
        in2: config.lng()
    };

    var o = [];
    var desplega = function(nodevo, base) {
        var node = {
            titol: nodevo.titol[0],
            recursVOList: nodevo.recursVOList,
            nodeVOList: []
        };
        base.push(node);
        if (nodevo.nodeVOList[0] != '') {
            nodevo.nodeVOList[0].NodeVO.forEach(function(nodevochild) {
                desplega(nodevochild, node.nodeVOList);
            });
        }
    };

    service.operation(config.dadesacademiqueswsdl(), 'getRecursosByAssignatura', args, function(err, result) {
        try {
            if (err) {
                var xml2js = require('xml2js');
                var parser = new xml2js.Parser({ignoreAttrs: true});
                parser.parseString(result.body, function (err, object) {
                    if (err) return next(err);
                    var nl = object['soap:Envelope']['soap:Body'][0]['getRecursosByAssignaturaResponse'][0]['out'][0]['ns1:NodeVO'];
                    nl.forEach(function (nodevo) {
                        desplega(nodevo, o);
                    });
                    return next(err, o);
                });
            } else {
                return next(err, result);
            }
        } catch(ex) {
            return next(null, []);
        }
    });
};

/**
 * Assignatura per codi
 * @param codAssignatura
 * @param next
 */
exports.getAssignaturaByCodi = function(codAssignatura, next) {
    var args = {
        in0: codAssignatura,
        in1: config.lng()
    };
    service.operation(config.dadesacademiqueswsdl(), 'getAssignaturaByCodi', args, function(err, result) {
        return next(err, result);
    });
};