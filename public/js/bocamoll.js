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
            'uoc:lrs:app': typeof DATA_BOCAMOLL_CONTEXT_APP === 'undefined' ? 'aulaca' : DATA_BOCAMOLL_CONTEXT_APP,
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
            en: "experienced"
        }
    }
}

function getConnection() {
    return {
        id: "https://cv.uoc.edu/webapps/aulaca"
    }
}

function getLink(object) {
    return {
        id: "C:" + object.attr('data-bocamoll-object-link'),
        definition: {
            type: object.attr('data-bocamoll-object-idtipolink'),
            name: {
                ca: object.attr('data-bocamoll-object-description')
            }
        }
    }
}

function getObject(object) {
    return {
        id: "T:" + object.attr('data-bocamoll-object-resourceid'),
        definition: {        
            type: object.attr('data-bocamoll-object-idtipolink'),
            name: {
                ca: object.attr('data-bocamoll-object-description')
            },
            extensions: {
                "uoc:lrs:tool:id": object.attr('data-bocamoll-object-resourceid')
            }
        }
    }
}

function getMaterial(object) {
    return {
        id: "M:" + object.attr('data-bocamoll-object-materialid'),
        definition: {
            type: object.attr('data-bocamoll-object-format'),
            name: {
                ca: object.attr('data-bocamoll-object-description')
            },
            extensions: {
                "uoc:lrs:material:id": object.attr('data-bocamoll-object-materialid')
            }
        }
    }
}

function getFontsInformacio(object) {
    return {
        id: "F:" + object.attr('data-bocamoll-object-informationSourceId'),
        definition: {
            type: 'fonts-informacio',
            name: {
                ca: object.attr('data-bocamoll-object-description')
            },
            extensions: {
                "uoc:lrs:material:id": object.attr('data-bocamoll-object-informationSourceId')
            }
        }
    }
}

$(document).ready(function() {

    var tincan = new TinCan ({
        recordStores: [{
            endpoint: "https://cv.uoc.edu/app/lrs/xapi/",
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

    $("a[data-bocamoll-object-link]").on("click", function (e) {
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getLink($(this))
        };
        registra(statement);
    });

    $("a[data-bocamoll-object-resourceid]").on("click", function (e) {
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getObject($(this))
        };
        registra(statement);
    });

    $("a[data-bocamoll-object-informationSourceId]").on("click", function (e) {
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getFontsInformacio($(this))
        };
        registra(statement);
    });

    $("a[data-bocamoll-object-materialid]").on("click", function (e) {
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getMaterial($(this))
        };
        registra(statement);
    });
});
