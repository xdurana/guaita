var config = require(__base + '/config');
var service = require(__base + '/lib/services/service');

exports.one = function(domainId, forumId, s, next) {

    return next();

    var rangeItems = -1; //$RANGEITEMS$
    var convId = -1; //$CONVID$
    var maxMsg = -1; //$RANGEITEMS$
    var dIni = 0; //$STARTITEM$
    var upTipo = -1; //$CONVLOGIN$
    var url = config.util.format('%s/webapps/campus2widget/servlet/RSSMailServlet?s=%s&convId=%s&tMsg=1&maxMSG=%s&dIni=%s&numDias=Tots&up_tipo=%s&convT=1',
        config.cv(),
        s,
        convId,
        maxMsg,
        dIni,
        upTipo
    );

    service.json(url, function(err, result) {
        return next(err, result);
    });
}
