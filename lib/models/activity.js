var config = require(__base + '/config');
var indicadors = require(__base + '/lib/routes/indicadors');
var aules = require(__base + '/lib/routes/aules');
var Event = require(__base + '/lib/models/event');

function Activity(activitat, aula, s) {

    for (var k in activitat) {
        this[k]=activitat[k];
    }

    this.aula = aula.nom;
    this.color = aula.color;
    this.name = indicadors.decodeHtmlEntity(activitat.name);
    this.subjectId = aula.domainFatherId;
    this.classroomId = aula.domainId;
    this.domainId = aula.domainId;
    this.link = aula.aulaca ? aules.getLinkActivitat(s, true, this.subjectId, this.classroomId, this.domainCode, this.eventId) : aula.link;
    
    this.events = [];

    if (activitat.startDate) {
        this.events.push(new Event(this, 'I', config.i18next.t('events.inici.descripcio'), activitat.startDate));
    }

    if (activitat.deliveryDate) {
        this.events.push(new Event(this, 'E', config.i18next.t('events.entrega.descripcio'), activitat.deliveryDate));
    }

    if (activitat.solutionDate) {
        this.events.push(new Event(this, 'S', config.i18next.t('events.solucio.descripcio'), activitat.solutionDate));
    }

    if (activitat.qualificationDate) {
        this.events.push(new Event(this, 'Q', config.i18next.t('events.qualificacio.descripcio'), activitat.qualificationDate));
    }
}

module.exports = Activity;
