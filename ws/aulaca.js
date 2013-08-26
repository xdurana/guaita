var request = require('request');

exports.getActivitatsAula = function(domainId, domainIdAula, s, callback) {

    request({
      url: "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures/" + domainId + "/aules/" + domainIdAula + "/activitats?s=" + s,
      method: "GET"
    }, function (error, response, body) {
        if (error) { console.log(err); callback(err); return; }
        var object = JSON.parse(body);
        callback(null, object.activities);
    });
}

exports.getAssignaturesPerIdp = function(s, idp, anyAcademic, callback) {

    request({
        url: "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures?idp=" + idp + "&s=" + s,
        method: "GET"
    }, function (error, response, body) {
        if (error) { console.log(err); callback(err); return; }
        var object = JSON.parse(body);
        object.subjects = object.subjects.filter(function(assignatura) {
            return (assignatura.anyAcademic === anyAcademic);
        });
        callback(null, object.subjects);
    });
}

exports.getEinesPerActivitat = function(domainId, domainIdAula, eventId, s, callback) {

    request({
      url: "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures/" + domainId + "/aules/" + domainIdAula + "/activitats/" + eventId + "/eines?s=" + s,
      method: "GET"
    }, function (error, response, body) {
        if (error) { console.log(err); callback(err); return; }
        var object = JSON.parse(body);
        callback(null, object.tools);
    });
}

exports.getEinesPerAula = function(domainId, domainIdAula, s, callback) {
    
    request({
      url: "http://cv.uoc.edu/webapps/aulaca/classroom/assignatures/" + domainId + "/aules/" + domainIdAula + "/eines?s=" + s,
      method: "GET"
    }, function (error, response, body) {
        if (error) { console.log(err); callback(err); return; }
        var object = JSON.parse(body);
        callback(null, object.tools);
    });
}