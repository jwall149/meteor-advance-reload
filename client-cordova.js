var newVersionAvailable = new ReactiveVar(false);
var newVersionLoaded    = new ReactiveVar(false);
var allowReload         = false;
var retryfunc           = null;
var versionCheckItv     = null;
var checkingInited      = false;

Reload._onMigrate('AdvanceReload', function (retry) {
  newVersionAvailable.set(true);
  if (!retryfunc) retryfunc = retry;
  if (allowReload) {
    return [true, true];
  } else {
    initVersionChecking();
    return false;
  }
});

Reload.hasNewVersion = function () {
  return newVersionAvailable.get();
};

Reload.isNewVersionLoaded = function() {
  return newVersionLoaded.get();
}

Reload.allowReload = function() {
  allowReload = true;
  if (retryfunc) retryfunc();
  retryfunc = null;
}

Template.registerHelper('hasNewVersion',      function() {return newVersionAvailable.get(); });
Template.registerHelper('isNewVersionLoaded', function() {return newVersionLoaded.get(); });

var readFile = function (url, cb) {
  window.resolveLocalFileSystemURL(url, function (fileEntry) {
    var success = function (file) {
      var reader = new FileReader();
      reader.onloadend = function (evt) {
        var result = evt.target.result;
        cb(null, result);
      };
      reader.onerror = fail;
      reader.readAsText(file);
    };
    var fail = function (evt) {
      cb(new Error("Failed to load entry: " + url), null);
    };
    fileEntry.file(success, fail);
  },
  // error callback
  function (err) { cb(new Error("Failed to resolve entry: " + url), null);
  });
};


// If forceUpdate, init the update right away if new version found.
var initVersionChecking = function(forceUpdate) {
  if (checkingInited) return;
  var currentVersion = null;
  var retryCount     = 0;

  var cancelChecking = function() {
    checkingInited = false;
    if (versionCheckItv) Meteor.clearInterval(versionCheckItv);
  };

  var retryCurrentVersion = function(cb) {
    Meteor.call('AdvanceReload.CurrentVersion', function(err, res){
      if (err || !res.autoupdateVersionCordova) {
        retryCount += 1;
        if (retryCount > 10) return cancelChecking();
        Meteor.setTimeout(function() {
          retryCurrentVersion(cb);
        }, 5000);
      } else {
        currentVersion = res.autoupdateVersionCordova;
        if (typeof cb === 'function') cb();
      }
    });
  }

  var checkVersion = function(updateOnFound) {
    if (!cordova.file.dataDirectory) return;
    var localVersionFile = cordova.file.dataDirectory + 'meteor/version';
    readFile(localVersionFile, function(err, txt) {
      if (!err && currentVersion) {
        if (currentVersion === txt && __meteor_runtime_config__.autoupdateVersionCordova != currentVersion) {
          // If current version downloaded and running version is different than current version
          newVersionLoaded.set(true);
          cancelChecking();
          if (updateOnFound) Reload.forceVersionUpdate();
        } else {
          // Current version is uptodate.
          cancelChecking();
          newVersionLoaded.set(false);
          newVersionAvailable.set(false);
        }
      }
    });
  }

  var initCheckInterval = function(updateOnFound) {
    cancelChecking();
    checkingInited = true;
    retryCurrentVersion(function(){
      if (updateOnFound) {
        checkVersion(true);
      } else {
        versionCheckItv = Meteor.setInterval(function(){
          checkVersion();
        }, 3000);
      }
    })
  }

  initCheckInterval(forceUpdate);
}

Reload.forceVersionUpdate = function() {
  var reloadOnce = _.once(function(){
    window.location.reload();
  });

  if (typeof Reload.onForceVersionUpdate === 'function') {
    // If there is an event then call event;
    Reload.onForceVersionUpdate(reloadOnce);
    // Allow 10 seconds for callback to be forcefully called.
    Meteor.setTimeout(function(){reloadOnce();}, 10000);
  } else {
    reloadOnce();
  }
}

Meteor.startup(function(){
  initVersionChecking(true);
});

document.addEventListener("resume", function () {
  initVersionChecking(true);
}, false);