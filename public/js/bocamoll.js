function getActor() {
    return {
        objectType: "Agent",
        account: {
            name: DATA_BOCAMOLL_USER_IDP
        }
    }
}

function getContext() {
    return {
        extensions: {
            'uoc:lrs:subject:id': DATA_BOCAMOLL_SUBJECT_DOMAINID,
            'uoc:lrs:classroom:id': DATA_BOCAMOLL_CLASSROOM_DOMAINID,
            'uoc:lrs:activity:id': DATA_BOCAMOLL_ACTIVITY_EVENTID,
            'uoc:lrs:session:id': SESSION,
            'uoc:lrs:session:navigator:userAgent': navigator.userAgent,
            'uoc:lrs:session:navigator:platform': navigator.platform,
            'uoc:lrs:session:navigator:language': navigator.language
        }
    }
}

function getVerb() {
    return {
        id: "http://adlnet.gov/expapi/verbs/experienced",
        display: {
            ca: "ha experimentat"
        }
    }
}

function getConnection() {
    return {
        id: "1",
        type: "connection"
    }
}

function getObject(object) {
    return {
        id: "T:" + object.attr('data-bocamoll-object-resourceid'),
        type: object.attr('data-bocamoll-object-idtipolink'),
        name: {
            ca: object.attr('data-bocamoll-object-description')
        },
        extensions: {
            "uoc:lrs:tool:id": object.attr('data-bocamoll-object-resourceid'),
        }
    }
}

function getMaterial(object) {
    return {
        id: "M:" + object.attr('data-bocamoll-object-materialid'),
        type: object.attr('data-bocamoll-object-format'),
        name: {
            ca: object.attr('data-bocamoll-object-description')
        },
        extensions: {
            "uoc:lrs:material:id": object.attr('data-bocamoll-object-materialid'),
        }
    }
}

function getFontsInformacio(object) {
    return {
        id: "F:" + object.attr('data-bocamoll-object-informationSourceId'),
        type: 'fonts-informacio',
        name: {
            ca: object.attr('data-bocamoll-object-description')
        },
        extensions: {
            "uoc:lrs:material:id": object.attr('data-bocamoll-object-informationSourceId'),
        }
    }
}

$(document).ready(function() {

    var tincan = new TinCan ({
        recordStores: [{
            endpoint: "http://meta.uoc.es:3030/xapi/",
            username: "<Test User>",
            password: "<Test User's Password>"
        }]
    }); 

    var registra = function(statement) {
        tincan.sendStatement(statement);
    }

    registra({
        actor: getActor(),
        context: getContext(),
        verb: getVerb(),
        object: getConnection()
    });

    $("a[data-bocamoll-object-resourceid]").on("click", function (e) {
        e.preventDefault();
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getObject($(this))
        };
        registra(statement);
    });

    $("a[data-bocamoll-object-informationSourceId]").on("click", function (e) {
        e.preventDefault();
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getFontsInformacio($(this))
        };
        registra(statement);
    });

    $("a[data-bocamoll-object-materialid]").on("click", function (e) {
        e.preventDefault();
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getMaterial($(this))
        };
        registra(statement);
    });
});

var sample = {
    "actor": {
        "objectType": "Agent",
        "account": {
            "name": "70003674"
        }
    },
    "verb": {
        "id": "http://adlnet.gov/expapi/verbs/experienced",
        "display": {
            "ca": "ha experimentat"
        }
    },
    "object": {
        "id": "T:119858",
        "definition": {
            "type": "http://cv.uoc.edu/app/lrs/tool",
            "name": {
                "ca": "Pla docent"
            },
            "extensions": {
                "uoc:lrs:tool:id": "119858"
            }
        }
    },
    "context": {
        "extensions": {
            "uoc:lrs:subject:id": "382784",
            "uoc:lrs:classroom:id": "382785",
            "uoc:lrs:activity:id": "697120"
        }
    }
}