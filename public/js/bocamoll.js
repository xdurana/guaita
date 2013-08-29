function getActor() {
    var actor = $("meta[name=actor]");
    return {
        account: {
            name: actor.attr('data-bocamoll-user-idp');
        }
    }
}

function getContext() {
    var context = $("meta[name=context]");
    return {
        extensions: {
            'uoclrs:classroom:subject:domainid': context.attr('data-bocamoll-subject-domainid'),
            'uoclrs:classroom:classroom:domainid': context.attr('data-bocamoll-classroom-domainid'),
            'uoclrs:classroom:activity:eventid': context.attr('data-bocamoll-activity-eventid')
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

function getObject(object) {
    return {
        id: object.attr('data-bocamoll-object-resourceid'),
        type: object.attr('data-bocamoll-object-idtipolink'),
        name: {
            ca: object.attr('data-bocamoll-object-description')
        }
    }
}

$(document).ready(function() {

    var tincan = new TinCan ({
        recordStores: [{
            endpoint: "http://meta:3030/xapi/",
            username: "<Test User>",
            password: "<Test User's Password>"
        }]
    }); 

    $("a[data-bocamoll-object-resourceid]").on("click", function (e) {
        e.preventDefault();
        var statement = {
            actor: getActor(),
            context: getContext(),
            verb: getVerb(),
            object: getObject($(this))
        };
        tincan.sendStatement(statement);
    });
});