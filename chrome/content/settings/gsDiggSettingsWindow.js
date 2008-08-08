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
