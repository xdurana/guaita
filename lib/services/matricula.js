var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

/**
 * Assignatures per expedient matriculades
 * @param expedient
 * @param anyAcademic
 * @param next
 */
exports.getAssignaturesDocenciaMatriculadesEstudiant = function(expedient, anyAcademic, next) {
    var args = {
        in0: expedient,
        in1: anyAcademic,
        in2: config.lng()
    };
    service.operation(config.matriculawsdl(), 'getAssignaturesDocenciaMatriculadesEstudiant', args, function(err, result) {
        return next(err, result.out.AssignaturaMatriculadaDocenciaVO ? result.out.AssignaturaMatriculadaDocenciaVO : []);
    });
};