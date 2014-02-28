var config = require('../config');
var indicadors = require('../routes/indicadors');
var Event = require('./event');

function Activity(activitat, aula, s) {

    for (var k in activitat) {
        this[k]=activitat[k];
    }

    this.aula = aula.nom;
    this.color = aula.color;
    this.name = indicadors.decodeHtmlEntity(activitat.name);
    this.domainId = aula.domainId;

    this.link = aula.aulaca ? config.util.format(
        '%s/Classroom.action?s=%s&domainId=%s&activityId=%s&javascriptDisabled=false&origin=guaita',
        config.aulacas(),
        s,
        aula.domainId,
        this.eventId
    ) : aula.link;

    this.events = [];

    if (activitat.startDate) {
        this.events.push(new Event(this, 'PI', config.i18next.t('events.inici.descripcio'), activitat.startDate));
    }

    if (activitat.deliveryDate) {
        this.events.push(new Event(this, 'PL', config.i18next.t('events.entrega.descripcio'), activitat.deliveryDate));
    }

    if (activitat.solutionDate) {
        this.events.push(new Event(this, 'PS', config.i18next.t('events.solucio.descripcio'), activitat.solutionDate));
    }

    if (activitat.qualificationDate) {
        this.events.push(new Event(this, 'PQ', config.i18next.t('events.qualificacio.descripcio'), activitat.qualificationDate));
    }
}

module.exports = Activity;
