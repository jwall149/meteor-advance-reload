Package.describe({
  name: 'advance-reload',
  version: '0.1.0',
  summary: 'Advance feature for package reload',
  git: 'https://github.com/jwall149/meteor-advance-reload.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use(['reactive-var', 'reload', 'templating', 'autoupdate', 'underscore'], 'web');
  api.imply(['reload'], 'web');
  api.imply(['autoupdate'], 'web');
  api.add_files("client-browser.js", 'web.browser');
  api.add_files("client-cordova.js", 'web.cordova');

  api.use(['autoupdate'], 'server');
  api.add_files("server.js", 'server');
});