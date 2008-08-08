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
