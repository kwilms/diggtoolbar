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

/**
 * Digg settings window script object.
 */
var gsDiggSettingsWindow = {

  /* Log service */
  _logService : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggSettingsWindow.init");

    window.setTimeout(
      function() { gsDiggSettingsWindow.onFriendsActivityChange(); }, 0);
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logService.debug("gsDiggSettingsWindow.uninit");

    let eventNotifier =
      Cc["@glaxstar.org/digg/event-notifier;1"].
        getService(Ci.gsIDiggEventNotifier);
    window.opener.setTimeout(
      function() {
        eventNotifier.checkForEvents();
      }, 0);
  },

  /**
   * Changes the behavior of the user name controls depending on the "checked"
   * state of the friends' activity checkbox.
   */
  onFriendsActivityChange : function() {
    this._logService.debug("gsDiggSettingsWindow.uninit");

    let checkbox =
      document.getElementById("gs-digg-settings-friendsActivity-checkbox");
    let textbox =
      document.getElementById("gs-digg-settings-username-textbox");

    if (checkbox.checked) {
      textbox.removeAttribute("disabled");
    } else {
      textbox.setAttribute("disabled", true);
    }
  }
};

window.addEventListener("load",
  function() { gsDiggSettingsWindow.init(); }, false);
window.addEventListener("unload",
  function() { gsDiggSettingsWindow.uninit(); }, false);
