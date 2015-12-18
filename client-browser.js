var newVersionAvailable = new ReactiveVar(false);
var newVersionLoaded    = new ReactiveVar(false);
var allowReload         = false;
var retryfunc           = null;
var appliCacheIntv      = null;

Reload._onMigrate('AdvanceReload', function (retry) {
  newVersionAvailable.set(true);
  retryfunc = retry;
  if (allowReload) {
    return [true, true];
  } else {
    Meteor.defer(function(){
      initChecking();
    });
    return [false];
  }
});

var initChecking = function() {
  if (!window.applicationCache) return;
  if (window.applicationCache.status === 1) window.applicationCache.update();

  window.applicationCache.onupdateready = function() {
    newVersionLoaded.set(true);
  }
}

Reload.hasNewVersion = function () {
  return newVersionAvailable.get();
};

Reload.isNewVersionLoaded = function() {
  return newVersionLoaded.get();
}

Reload.allowReload = function() {
  allowReload = true;
  if (typeof retryfunc === 'function') {
    retryfunc();
  } else {
    window.applicationCache.update();
  }
}

Template.registerHelper('hasNewVersion',      function(first) {return newVersionAvailable.get(); });
Template.registerHelper('isNewVersionLoaded', function(first) {return newVersionLoaded.get(); });

Meteor.startup(function(){
  Meteor.call('AdvanceReload.CurrentVersion', function(err, res){
    if (err) return;
    if (res.autoupdateVersion !== __meteor_runtime_config__.autoupdateVersion || res.autoupdateVersionRefreshable !== __meteor_runtime_config__.autoupdateVersionRefreshable) {
      Reload.allowReload(true);
      window.applicationCache.update();
    }
  });
})