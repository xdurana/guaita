var moment = require('moment');

function Event(activitat, esdeveniment, tooltip, data) {
    this.tipus = esdeveniment;
    this.tooltip = tooltip;
    this.data = moment(data).format("YYYY-MM-DD");
    this.destacat = esdeveniment === 'E' ? 'event-destacat' : 'event';
    this.activitat = {
        link: activitat.link,
        color: activitat.color,
        aula: activitat.aula,
        domainId: activitat.domainId,
        name: activitat.name
    };
}

Event.prototype.fooBar = function() {

};

module.exports = Event;