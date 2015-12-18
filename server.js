// Current version of autoupdate doesnot expose ClientVersions collection, a walk-around trick
Meteor.methods({
  'AdvanceReload.CurrentVersion': function () {
    return Package.autoupdate.Autoupdate;
  }
});