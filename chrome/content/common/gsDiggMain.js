/***** BEGIN LICENSE BLOCK *****

Copyright (c) 2008, Digg Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.
* Neither the name of Digg Inc. nor the names of its contributors may be used to
endorse or promote products derived from this software without specific prior
written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***** END LICENSE BLOCK *****/

// Id of the main Digg toolbar button
const GS_DIGG_TOOLBAR_BUTTON_ID = "gs-digg-toolbar-button";

// Key of the Digg user name preference
const GS_DIGG_PREF_KEY_USER_NAME = "extensions.digg.username";
// Key of the "notify news" preference
const GS_DIGG_PREF_KEY_NOTIFY_NEWS = "extensions.digg.notify.news";
// Key of the "notify videos" preference
const GS_DIGG_PREF_KEY_NOTIFY_VIDEOS = "extensions.digg.notify.videos";
// Key of the "notify images" preference
const GS_DIGG_PREF_KEY_NOTIFY_IMAGES = "extensions.digg.notify.images";
// Key of the topic list preference
const GS_DIGG_PREF_KEY_TOPIC_LIST = "extensions.digg.notify.topic.list";
// Key of the container list preference
const GS_DIGG_PREF_KEY_CONTAINER_LIST = "extensions.digg.notify.container.list";
// Key of the autohide preference
const GS_DIGG_PREF_KEY_NOTIFICATION_AUTOHIDE =
  "extensions.digg.notification.autohide";
// Key of the open links preference
const GS_DIGG_PREF_KEY_OPEN_LINKS = "extensions.digg.open.links";
// Key for the notification type preference
const GS_DIGG_PREF_KEY_NOTIFICATION_TYPE = "extensions.digg.notification.type";

// Digg tracking codes
const GS_DIGG_TRACKING_CODE_HOME                       = "OTC-fft-1";
const GS_DIGG_TRACKING_CODE_FEEDBACK                   = "OTC-fft-2";
const GS_DIGG_TRACKING_CODE_TOOLBAR_DIGGS              = "OTC-fft-3";
const GS_DIGG_TRACKING_CODE_TOOLBAR_DIGGIT             = "OTC-fft-4";
const GS_DIGG_TRACKING_CODE_TOOLBAR_SUBMIT             = "OTC-fft-5";
const GS_DIGG_TRACKING_CODE_TOOLBAR_COMMENTS           = "OTC-fft-6";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_DIGGS         = "OTC-fft-7";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_DIGGIT        = "OTC-fft-8";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_TITLE         = "OTC-fft-9";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_COMMENT       = "OTC-fft-10";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_TOPIC         = "OTC-fft-11";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_COMMENTS      = "OTC-fft-12";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_SUBMITTER     = "OTC-fft-13";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_DIGGER        = "OTC-fft-14";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_COMMENTER     = "OTC-fft-15";
const GS_DIGG_TRACKING_CODE_NOTIFICATION_ADMIN_MESSAGE = "OTC-fft-16";

// Landing page
const GS_DIGG_LANDING_PAGE_URL = "http://digg.com/tools/firefox";
// Feedback page
const GS_DIGG_FEEDBACK_PAGE_URL =
  "http://digg.com/contact?ref=fftoolbar&contact-type=2";

/**
 * Main Digg script object.
 */
var gsDiggMain = {

  /* Log service */
  _logService : null,
  /* Startup service */
  _startupService : null,
  /* Preference service */
  _preferenceService : null,
  /* Reference to the settings window */
  _settingsWindow : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggMain.init");

    this._startupService =
      Cc["@glaxstar.org/digg/startup-service;1"].
        getService(Ci.gsIDiggStartupService);
    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].
        getService(Ci.nsIPrefBranch);

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.addObserver(GS_DIGG_PREF_KEY_SNOOZE, this, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);
    this._updateSnoozeBroadcaster();

    this._installToolbarButton();

    window.setTimeout(function() { gsDiggMain._showSetupWizard() }, 0);
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logService.debug("gsDiggMain.uninit");

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.removeObserver(GS_DIGG_PREF_KEY_SNOOZE, this);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Shows the setup wizard if its the first time the extension is run.
   */
  _showSetupWizard : function() {
    this._logService.trace("gsDiggMain._showSetupWizard");

    if (this._startupService.isFirstRun &&
        !this._startupService.setupWizardShown) {

      this._startupService.setSetupWizardShown();

      let utilityService =
        Cc["@glaxstar.org/common/utility-service;2"].
          getService(Ci.gsIUtilityService);

      if (Ci.gsIUtilityService.OS_MAC == utilityService.getOperatingSystem()) {
        window.open(
          "chrome://digg/content/setup/gsDiggSetupWindow.xul",
          "gs-digg-setup-window",
          "chrome,centerscreen,modal,titlebar,alwaysRaised,close=no").focus();
      } else {
        window.openDialog(
          "chrome://digg/content/setup/gsDiggSetupWindow.xul",
          "gs-digg-setup-window",
          "chrome,centerscreen,modal,titlebar,dialog,close=no").focus();
      }

      let eventNotifier =
        Components.classes["@glaxstar.org/digg/event-notifier;1"].
          getService(Components.interfaces.gsIDiggEventNotifier);
      eventNotifier.initialize();

      // Go to landing page
      let landingPageURL =
        GS_DIGG_LANDING_PAGE_URL + "?username=" +
        Application.prefs.get(GS_DIGG_PREF_KEY_USER_NAME).value;
      openUILinkIn(landingPageURL, 'current');
    }
  },

  /**
   * Installs the toolbar button in the toolbar's current set during the first
   * run.
   */
  _installToolbarButton : function() {
    this._logService.trace("gsDiggMain._initToolbarButton");

    // Install in toolbar.currentSet if this is the first run
    if (this._startupService.isFirstRun) {
      var toolbar = document.getElementById("nav-bar");

      if (0 > toolbar.currentSet.indexOf(GS_DIGG_TOOLBAR_BUTTON_ID)) {

        var inserted = false;
        var ids = toolbar.currentSet.split(",");

        for (var i = 0; i < ids.length; i++) {

          if (ids[i] == "urlbar-container") {
            ids.splice(i, 0, GS_DIGG_TOOLBAR_BUTTON_ID);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          ids.push(GS_DIGG_TOOLBAR_BUTTON_ID);
        }

        toolbar.currentSet = ids.toString();
        toolbar.setAttribute("currentset", ids.toString());
        toolbar.ownerDocument.persist(toolbar.id, "currentset");
        BrowserToolboxCustomizeDone(true);
      }
    }
  },

  /**
   * Opens the given URL in the same tab, in a new tab, or in a new window,
   * depending on the Digg preference.
   * @param aURL The URL to be opened.
   * @param aTrackingCode The Digg tracking code to be appended to the URL.
   */
  openURL : function(aURL, aTrackingCode) {
    this._logService.debug("gsDiggMain.openURL");

    if (aTrackingCode) {
      aURL += (aURL.match(/\?/g) ? "&" : "?") + aTrackingCode;
    }

    switch (Application.prefs.get(GS_DIGG_PREF_KEY_OPEN_LINKS).value) {
      case 1:  window.openUILinkIn(aURL, 'tab');     break;
      case 2:  window.openUILinkIn(aURL, 'window');  break;
      default: window.openUILinkIn(aURL, 'current'); break;
    }
  },

  /**
   * Opens the settings window.
   */
  openSettingsWindow : function() {
    this._logService.debug("gsDiggToolbar.openSettingsWindow");

    if (null == this._settingsWindow || this._settingsWindow.closed) {
      this._settingsWindow =
        window.open(
          "chrome://digg/content/settings/gsDiggSettingsWindow.xul",
          "gs-digg-settings-window",
          "chrome,centerscreen,dialog");
    }
    this._settingsWindow.focus();
  },

  /**
   * Toggles the snooze setting.
   */
  toggleSnooze : function() {
    this._logService.debug("gsDiggMain.toggleSnooze");

    var snooze = this._preferenceService.getBoolPref(GS_DIGG_PREF_KEY_SNOOZE);
    this._preferenceService.setBoolPref(GS_DIGG_PREF_KEY_SNOOZE, !snooze);
  },

  /**
   * Updates the checked state of the snooze broadcaster according to the
   * current preference value.
   */
  _updateSnoozeBroadcaster : function() {
    this._logService.debug("gsDiggMain._updateSnoozeBroadcaster");

    var stringBundle = document.getElementById("gs-digg-main-bundle");
    var snoozeBroadcaster =
      document.getElementById('gs-digg-snooze-broadcaster');

    var snoozeActive =
      this._preferenceService.getBoolPref(GS_DIGG_PREF_KEY_SNOOZE);

    snoozeBroadcaster.setAttribute("checked", snoozeActive);
    snoozeBroadcaster.setAttribute("tooltiptext",
      snoozeActive ?
        stringBundle.getString("gs.digg.snooze.deactivate") :
        stringBundle.getString("gs.digg.snooze.activate"));
  },

  /**
   * Observes changes in Digg preferences.
   * @param aSubject The object that experienced the change.
   * @param aTopic The topic being observed.
   * @param aData The data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logService.debug("gsDiggMain.observe");

    if (aTopic == "nsPref:changed" && aData == GS_DIGG_PREF_KEY_SNOOZE) {
      this._updateSnoozeBroadcaster();
    }
  }
};

window.addEventListener("load", function() { gsDiggMain.init(); }, false);
window.addEventListener("unload", function() { gsDiggMain.uninit(); }, false);
