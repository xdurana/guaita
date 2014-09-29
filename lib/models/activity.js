var moment = require('moment');

var config = require(__base + '/config');
var indicadors = require(__base + '/lib/routes/indicadors');
var aules = require(__base + '/lib/routes/aules');
var ws = require(__base + '/lib/services/ws');
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
    this.link = aula.aulaca ? ws.aulaca.getLinkActivitat(s, true, this.subjectId, this.classroomId, this.domainCode, this.eventId) : aula.link;
    
    this.events = [];

    if (activitat.startDate && valida(activitat.startDate)) {
        this.events.push(new Event(this, 'I', config.i18next.t('events.inici.descripcio'), activitat.startDate));
    }

    if (activitat.deliveryDate && valida(activitat.deliveryDate)) {
        this.events.push(new Event(this, 'LL', config.i18next.t('events.entrega.descripcio'), activitat.deliveryDate));
    }

    if (activitat.solutionDate && valida(activitat.solutionDate)) {
        this.events.push(new Event(this, 'S', config.i18next.t('events.solucio.descripcio'), activitat.solutionDate));
    }

    if (activitat.qualificationDate && valida(activitat.qualificationDate)) {
        this.events.push(new Event(this, 'Q', config.i18next.t('events.qualificacio.descripcio'), activitat.qualificationDate));
    }
}

function valida(eventDate) {
    data = moment(eventDate);
    return !(data.isBefore(moment().subtract(5, 'years')) || data.isAfter(moment().add(5, 'years')));
}

module.exports = Activity;
