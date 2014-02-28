var moment = require('moment');

function Event(activitat, esdeveniment, tooltip, data) {
    this.tipus = esdeveniment;
    this.tooltip = tooltip;
    this.activitat = activitat;
    this.data = moment(data).format("YYYY-MM-DD");
    this.destacat = esdeveniment === 'PL' ? 'event-destacat' : 'event';
}

Event.prototype.fooBar = function() {

};

module.exports = Event;