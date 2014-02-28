var config = require('../config');

function Classroom(c, s, assignments) {

    for (var k in c) {
        this[k]=c[k];
    }

    this.s = s;
    this.color = '66AA00';
    this.codiAssignatura = c.codi;
    this.nom = c.title;
    this.aulaca = this.presentation == 'AULACA';
    this.activitats = [];

    this.link = this.aulaca ? config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        this.domainId
    ) :
    config.util.format(
        '%s/webapps/classroom/081_common/jsp/iniciAula.jsp?s=%s&domainId=%s&domainCode=%s&img=aules&preview=1&idLang=a&ajax=true',
        config.cv(),
        s,
        this.domainId,
        this.domainCode
    );

    var color = '66AA00';
    if (assignments) {
        assignments.forEach(function(assignment) {
            if (assignment.assignmentId.domainId == c.domainFatherId) {
                color = assignment.color;
            }
        });
        this.color = color;
    }
}

module.exports = Classroom;