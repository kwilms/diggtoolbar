/***** BEGIN LICENSE BLOCK *****

The contents of this file are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
License for the specific language governing rights and limitations
under the License.

The Original Code is GLaxstar Ltd code.

The Initial Developer of the Original Code is Glaxstar Ltd.
Portions created by the Initial Developer are
Copyright (C) 2008 Digg Inc. All Rights Reserved.

Contributor(s):
  Jose Enrique Bolanos <jose@glaxstar.com>
  Andres Hernandez <andres@glaxstar.com>
  Erik van Eykelen <erik@glaxstar.com>

***** END LICENSE BLOCK *****/

const Ci = Components.interfaces;
const Cc = Components.classes;

// Key of the user name preference
const GS_DIGG_PREF_KEY_USER_NAME = "extensions.digg.username";
// Key of the notify friends' activity preference
const GS_DIGG_PREF_KEY_NOTIFY_FRIENDS_ACTIVITY =
  "extensions.digg.notify.friendsActivity";
// Key of the notify news preference
const GS_DIGG_PREF_KEY_NOTIFY_NEWS = "extensions.digg.notify.news";
// Key of the notify videos preference
const GS_DIGG_PREF_KEY_NOTIFY_VIDEOS = "extensions.digg.notify.videos";
// Key of the notify images preference
const GS_DIGG_PREF_KEY_NOTIFY_IMAGES = "extensions.digg.notify.images";
// Key of the notify container list preference
const GS_DIGG_PREF_KEY_NOTIFY_CONTAINER_LIST =
  "extensions.digg.notify.container.list";
// Key of the notify topic list preference
const GS_DIGG_PREF_KEY_NOTIFY_TOPIC_LIST = "extensions.digg.notify.topic.list";

/**
 * Digg setup window script object.
 */
var gsDiggSetupWindow = {

  /* Log service */
  _logService : null,
  /* Preference service */
  _preferenceService : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggSetupWindow.init");

    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].
        getService(Ci.nsIPrefBranch);

    // Focus the user name textbox when the window loads
    window.setTimeout(function() {
      document.getElementById("gs-digg-wizard-user-name").focus();
    }, 0);
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logService.debug("gsDiggSetupWindow.uninit");
  },

  /**
   * Selects the username option when the textbox receives the focus.
   */
  selectUsernameOption : function() {
    this._logService.debug("gsDiggSetupWindow.selectUsernameOption");

    document.getElementById("gs-digg-wizard-radiogroup").value = "1";
  },

  /**
   * Selects the user radio option and cleans the textbox depending on the
   * selected option.
   */
  selectRadioOption : function() {
    this._logService.debug("gsDiggSetupWindow.selectRadioOption");

    var radioGroup = document.getElementById("gs-digg-wizard-radiogroup");
    var userName = document.getElementById("gs-digg-wizard-user-name");

    switch (radioGroup.value) {
      case "1":
        userName.removeAttribute("disabled");
        break;
      case "2":
        userName.setAttribute("disabled", true);
        break;
    }
  },

  /**
   * Performs the user selected option in the radiogroup.
   */
  performUserAction : function() {
    this._logService.debug("gsDiggSetupWindow.performUserAction");

    var radioGroup = document.getElementById("gs-digg-wizard-radiogroup");
    var userName = document.getElementById("gs-digg-wizard-user-name");

    switch (radioGroup.value) {
      case "1":
        this._preferenceService.
          setCharPref(GS_DIGG_PREF_KEY_USER_NAME, userName.value);
        this._preferenceService.
          setBoolPref(GS_DIGG_PREF_KEY_NOTIFY_FRIENDS_ACTIVITY, true);
        break;
      case "2":
        this._preferenceService.setCharPref(GS_DIGG_PREF_KEY_USER_NAME, "");
        this._preferenceService.
          setBoolPref(GS_DIGG_PREF_KEY_NOTIFY_FRIENDS_ACTIVITY, false);
        break;
    }
  },

  /**
   * Saves the user selected settings.
   */
  saveSettings : function() {
    this._logService.debug("gsDiggSetupWindow.saveSettings");

    this._preferenceService.setBoolPref(GS_DIGG_PREF_KEY_NOTIFY_NEWS,
      document.getElementById("gs-digg-settings-notify-news-checkbox").
        checked);
    this._preferenceService.setBoolPref(GS_DIGG_PREF_KEY_NOTIFY_VIDEOS,
      document.getElementById("gs-digg-settings-notify-videos-checkbox").
        checked);
    this._preferenceService.setBoolPref(GS_DIGG_PREF_KEY_NOTIFY_IMAGES,
      document.getElementById("gs-digg-settings-notify-images-checkbox").
        checked);
    this._preferenceService.setCharPref(GS_DIGG_PREF_KEY_NOTIFY_CONTAINER_LIST,
      document.getElementById("gs-digg-settings-topics-tree").
        getSelectedContainerList());
    this._preferenceService.setCharPref(GS_DIGG_PREF_KEY_NOTIFY_TOPIC_LIST,
      document.getElementById("gs-digg-settings-topics-tree").
        getSelectedTopicList());
  },

  /**
   * Asks the user for confirmation to cancel the wizard.
   * @param aEvent The cancel event.
   */
  onCancel : function(aEvent) {
    this._logService.debug("gsDiggSetupWindow.onCancel");

    var stringBundle = document.getElementById('gs-digg-setup-string-bundle');

    var prompts =
      Cc["@mozilla.org/embedcomp/prompt-service;1"].
        getService(Ci.nsIPromptService);

    var result =
      prompts.confirm(window,
        stringBundle.getString("gs.digg.setup.cancel.title"),
        stringBundle.getString("gs.digg.setup.cancel.message"));

    if (!result) {
      aEvent.cancel();
    }
  }
};
