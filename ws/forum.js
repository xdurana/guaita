//http://$SERVERDOMAIN$/webapps/campus2widget/servlet/RSSMailServlet?s=$S$&convId=$CONVID$&tMsg=1&maxMSG=$RANGEITEMS$&dIni=$STARTITEM$&numDias=Tots&up_tipo=$CONVLOGIN$&convT=1 

var config = require('../config');
var service = require('./service');
var request = require('request');
var util = require('util');

exports.one = function(domainId, forumId, s, callback) {

    //TODO select * from CAMPUS96.CONVERSATION WHERE CONVID = '282246'
    //return callback();

    var rangeItems = -1; //$RANGEITEMS$
    var convId = -1; //$CONVID$
    var maxMsg = -1; //$RANGEITEMS$
    var dIni = 0; //$STARTITEM$
    var upTipo = -1; //$CONVLOGIN$
    var url = util.format('%s/webapps/campus2widget/servlet/RSSMailServlet?s=%s&convId=%s&tMsg=1&maxMSG=%s&dIni=%s&numDias=Tots&up_tipo=%s&convT=1',
        config.cv(),
        s,
        convId,
        maxMsg,
        dIni,
        upTipo
    );

    service.json(url, function(err, result) {
        if(err) { console.log(err); callback(err); return; }
        callback(err, result);
    });
}
