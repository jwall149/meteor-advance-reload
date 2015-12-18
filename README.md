## Advance Reload

This package is to provide developer more tools to control Reload from client (Browser or Cordova).

The reason I wrote myself this package is, none of the packages now satisfy my needs.

`mdg:reload-on-resume` only delays reload until resume (user reopen the app). On Cordova, new version will be loaded on background, however on web, it still takes time to load the whole assets.

`aldeed:reload-extras` only lets if there is new code or not, and delay the reload.

#### What does this package do?

This package provides 3 feature:

- Provide `Reload.hasNewVersion()` and `{{hasNewVersion}}` helpers. These are reactive variable to let user know if there is new version.

- Provide `Reload.isNewVersionLoaded` and `{{isNewVersionLoaded}}` helpers. This reactive source turn true if the new code is fully loaded on Browser/Native Client. All the loading is done in the background so user still be able to user old version of code. No blocking at all. You can use these to give a nice notice to user to upgrade the application and avoid wasting loading time.

- When server has newer code, it will be load in background. Even after fully loaded, newer code still is not applied until user close and reopen the app, or `Reload.allowReload()` is called.


#### Installation

`$ meteor add jwall149:advance-reload`

#### Sample

JS:

Tracker.autorun(function(){
  if (Reload.hasNewVersion()) console.log('Newer Code is deployed on server.');
});

Tracker.autorun(function(){
  if (Reload.isNewVersionLoaded()) console.log('New version loaded.');
})