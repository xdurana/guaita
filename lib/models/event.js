module.exports = function(config) {

    var describe = function (activitat, esdeveniment, tooltip, data) {
        return {
            tipus: esdeveniment,
            tooltip: tooltip,
            data: config.moment(data).format("YYYY-MM-DD"),
            destacat: esdeveniment === 'E' ? 'event-destacat' : 'event',
            activitat: {
                link: activitat.link,
                color: activitat.color,
                aula: activitat.aula,
                domainId: activitat.domainId,
                name: activitat.name
            }
        }
    };

    return {
        describe: describe
    }
};