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
            'uoc:lrs:app': typeof DATA_BOCAMOLL_CONTEXT_APP === 'undefined' ? 'widget' : DATA_BOCAMOLL_CONTEXT_APP,
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
        id: "C:" + object.readAttribute('data-bocamoll-object-link'),
        definition: {
            type: object.readAttribute('data-bocamoll-object-idtipolink'),
            name: {
                ca: object.readAttribute('data-bocamoll-object-description')
            }
        }
    }
}

function getObject(object) {
    return {
        id: "T:" + object.readAttribute('data-bocamoll-object-resourceid'),
        definition: {
            type: object.readAttribute('data-bocamoll-object-idtipolink'),
            name: {
                ca: object.readAttribute('data-bocamoll-object-description')
            },
            extensions: {
                "uoc:lrs:tool:id": object.readAttribute('data-bocamoll-object-resourceid')
            }
        }
    }
}

function getMaterial(object) {
    return {
        id: "M:" + object.readAttribute('data-bocamoll-object-materialid'),
        definition: {
            type: object.readAttribute('data-bocamoll-object-format'),
            name: {
                ca: object.readAttribute('data-bocamoll-object-description')
            },
            extensions: {
                "uoc:lrs:material:id": object.readAttribute('data-bocamoll-object-materialid')
            }
        }
    }
}

function getFontsInformacio(object) {
    return {
        id: "F:" + object.readAttribute('data-bocamoll-object-informationSourceId'),
        definition: {
            type: 'fonts-informacio',
            name: {
                ca: object.readAttribute('data-bocamoll-object-description')
            },
            extensions: {
                "uoc:lrs:material:id": object.readAttribute('data-bocamoll-object-informationSourceId')
            }
        }
    }
}

document.observe("dom:loaded", function() {

    var tincan = new TinCan ({
        recordStores: [{
            endpoint: "http://cv.uoc.edu/app/lrs/xapi/",
            username: "<Test User>",
            password: "<Test User's Password>"
        }]
    });

    var registra = function(statement) {
        tincan.sendStatement(statement);
    }

    $("widget").observe("click", function (event) {

        if (event.target.tagName === 'A') {

            var object = null;
            var element = event.target;

            if (element.hasAttribute('data-bocamoll-object-link')) {
                object = getLink(element); 
            } else if (element.hasAttribute('data-bocamoll-object-resourceid')) {
                object = getObject(element);
            } else if (element.hasAttribute('data-bocamoll-object-informationSourceId')) {
                object = getFontsInformacio(element);
            } else if (element.hasAttribute('data-bocamoll-object-materialid')) {
                object = getMaterial(element);
            }

            if (object != null) {
                registra({
                    actor: getActor(),
                    context: getContext(),
                    verb: getVerb(),
                    object: object
                });
            }
        }
    });
});