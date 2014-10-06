var config = require(__base + '/config');
var aules = require(__base + '/lib/routes/aules');
var ws = require(__base + '/lib/services/ws');

function Classroom(c, s, assignments) {

    for (var k in c) {
        this[k]=c[k];
    }

    this.s = s;
    this.color = '66AA00';
    this.codiAssignatura = c.codi;
    this.nom = c.title.replace("´","'");
    this.aulaca = this.presentation == 'AULACA';
    this.activitats = [];
    this.subjectId = this.domainFatherId;
    this.classroomId = this.domainId;

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