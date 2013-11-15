function Docent(idp, perfil, s) {
    return {
        s: s,
        idp: idp,
        perfil: perfil
    }
}

Docent.prototype.assignatures = function(callback) {

    var struct = {        
        s: this.s,
        idp: this.idp,
        perfil: this.perfil,
        assignatures: [
        ]
    };

    aulaca.getAssignaturesPerIdp(struct.s, struct.idp, function(err, result) {
        if (err) { console.log(err); return callback(null, struct); }
        try {
            struct.assignatures = result;
            async.each(struct.assignatures, resumeix, function(err) {
                if (err) { console.log(err); return callback(null, struct); }
                struct.assignatures.sort(ordenaAssignatures);
                return callback(null, struct);
            });
        } catch(e) {
            console.log(e.message);
            return callback(null, struct);
        }
    });

    var resumeix = function(subject, callback) {
        resum(s, idp, subject.anyAcademic, subject, subject.codi, subject.domainId, function(err, result) {
            if (err) { console.log(err); }
            return callback();
        });
    }

    var ordenaAssignatures = function(a, b) {
        return a.codi < b.codi ? -1 : b.codi < a.codi ? 1 : 0;
    }
};