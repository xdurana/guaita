var statement = {
  actor: {
    account: {      
    }
  },
  verb: {
    display: {        
    }
  },
  object: {
    definition: {
      name: {
      },
      extensions: {
      }
    }
  },
  context: {
    extensions: {        
    }
  }
}

function setActor() {
  var actor = $("meta[name=actor]");    
  statement.actor.name = actor.attr('data-lrs-actor-name');
  statement.actor.account.name = actor.attr('data-lrs-actor-account');
  statement.actor.account.homePage = "http://www.uoc.edu";
}

function setContext() {
  var context = $("meta[name=context]");
  statement.context.extensions['uoclrs:classroom:domain:id'] = context.attr('data-lrs-context-domain-id');
  statement.context.extensions['uoclrs:classroom:domain:code'] = context.attr('data-lrs-context-domain-code');
  statement.context.extensions['uoclrs:classroom:domain:name'] = context.attr('data-lrs-context-domain-name');
  statement.context.extensions['uoclrs:classroom:activity:id'] = context.attr('data-lrs-context-activity-id');
  statement.context.extensions['uoclrs:classroom:activity:name'] = context.attr('data-lrs-context-activity-name');
}

function setVerb() {
  statement.verb.id = "http://adlnet.gov/expapi/verbs/experienced";
  statement.verb.display.ca = "ha experimentat";
}

function setObject(object) {
  statement.object.id = object.attr('data-lrs-object-id');
  statement.object.definition.type = object.attr('data-lrs-object-type');
  statement.object.definition.name.ca = object.attr('data-lrs-object-name');
  statement.object.definition.extensions['uoclrs:classroom:domain:id'] = object.attr('data-lrs-object-params-domainId');
}

$(document).ready(function() {

  setActor();
  setContext();
  setVerb();

  var tincan = new TinCan ({
    recordStores: [{
          //endpoint: "https://cloud.scorm.com/ScormEngineInterface/TCAPI/public/",
          //endpoint: "http://localhost:3000/xapi/",
          endpoint: "http://uoc-lrs.herokuapp.com/xapi/",
          username: "<Test User>",
          password: "<Test User's Password>"
      }
    ]
  }); 

  $("a[data-lrs-object-id]").on("click", function (e) {
    e.preventDefault();
    setObject($(this));
    tincan.sendStatement(statement);
  });

});