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

/**
 * Main progress listener.
 */
var gsDiggProgressListener = {

  /* Log service */
  _logService : null,

  /**
   * Initializes and registers the progress listener.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggProgressListener.init");

    window.getBrowser().
      addProgressListener(this, Ci.nsIWebProgress.NOTIFY_STATE_ALL);
  },

  /**
   * Uninitializes and removes the progress listener.
   */
  uninit : function() {
    this._logService.debug("gsDiggProgressListener.uninit");

    window.getBrowser().removeProgressListener(this);
  },

  /**
   * Called when the location of the window being watched changes.
   * @param aWebProgress The nsIWebProgress instance that fired the
   * notification.
   * @param aRequest The associated nsIRequest. This may be null in some cases.
   * @param aLocation The URI of the location that is being loaded.
   */
  onLocationChange : function(aWebProgress, aRequest, aLocation) {
    // XXX: there is no logging here for efficiency reasons.

    if (aLocation) {
      gsDiggToolbar.onPageChanged(aLocation.spec);
    } else {
      gsDiggToolbar.onPageChanged("about:blank");
    }
  },

  /**
   * Notification indicating the state has changed for one of the requests
   * associated with webProgress. IGNORED
   * @param aWebProgress The nsIWebProgress instance that fired the
   * notification.
   * @param aRequest The nsIRequest that has changed state.
   * @param aStateFlags Flags indicating the new state.
   * @param aStatus: Error status code associated with the state change.
   */
  onStateChange : function(aWebProgress, aRequest, aStateFlags, aStatus) {
  },

  /**
   * Notification that the progress has changed for one of the requests
   * associated with webProgress. IGNORED
   */
  onProgressChange : function (aWebProgress, aRequest, aCurSelfProgress,
    aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
  },

  /**
   * Notification called for security progress. IGNORED
   */
  onSecurityChange : function(aWebProgress, aRequest, aState) {
  },

  /**
   * Notification that the status of a request has changed. IGNORED
   */
  onStatusChange : function(aWebProgress, aRequest, aStatus, aMessage) {
  },

  QueryInterface : function(aIID){
    if (aIID.equals(Ci.nsIWebProgressListener) ||
        aIID.equals(Ci.nsISupportsWeakReference) ||
        aIID.equals(Ci.nsISupports)) {
      return this;
    }
    throw Cr.NS_NOINTERFACE;
  }
};

window.addEventListener("load",
  function() { gsDiggProgressListener.init(); }, false);
window.addEventListener("unload",
  function() { gsDiggProgressListener.uninit(); }, false);
