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
