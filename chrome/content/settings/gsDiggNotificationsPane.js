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
 * Digg notifications pane script object.
 */
var gsDiggNotificationsPane = {

  /* Log service */
  _logService : null,
  /* Main Digg service */
  _mainDiggService : null,
  /* Utility service */
  _utilityService : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggNotificationsPane.init");

    this._mainDiggService =
      Cc["@glaxstar.org/digg/main-service;1"].
        getService(Ci.gsIDiggMainService);
    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;1"].
        getService(Ci.gsIUtilityService);

    this._loadTree();
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logService.debug("gsDiggNotificationsPane.uninit");
  },

  /**
   * Initializes the tree of topics.
   */
  _initTree : function() {
    this._logService.trace("gsDiggNotificationsPane._initTree");

    var tree = document.getElementById("gs-digg-settings-topics-tree");
    var containerList =
      document.getElementById("gs-digg-settings-notify-container-list");
    var topicList =
      document.getElementById("gs-digg-settings-notify-topic-list");

    tree.loadSelectedValues(containerList.value, topicList.value);
  },

  /**
   * Calls the api to load the tree with the containers and topics list.
   */
  _loadTree : function() {
    this._logService.trace("gsDiggNotificationsPane._loadTree");

    document.getElementById("gs-digg-settings-topics-tree").setBusy(true);

    try {
      this._mainDiggService.listContainers(
        {
          handleLoad: function(aResultCount, aResults) {
            gsDiggNotificationsPane._loadTreeLoadHandler(aResultCount, aResults);
          }
        });
    } catch(e) {
      this._logService.error("gsDiggNotificationsPane._loadTree: " + e);
    }
  },

  /**
   * Handles the response from the listContainers method. Loads the tree with
   * containers and topics.
   * @param aResultCount The number of objects contained in the response.
   * @param aResults The array of objects in the response.
   */
  _loadTreeLoadHandler : function(aResultCount, aResults) {
    this._logService.trace("gsDiggNotificationsPane._loadTreeLoadHandler");

    var tree = document.getElementById("gs-digg-settings-topics-tree");

    if (aResultCount > 0) {
      var containerList = aResults[0].QueryInterface(Ci.nsIArray);
      var enu = containerList.enumerate();
      var containerDTO = null;

      while (enu.hasMoreElements()) {
        containerDTO = enu.getNext().QueryInterface(Ci.gsIDiggContainerDTO);
        tree.addContainer(containerDTO);
      }

      this._initTree();
    }

    tree.setBusy(false);
  }
};

window.addEventListener("load",
  function() { gsDiggNotificationsPane.init(); }, false);
window.addEventListener("unload",
  function() { gsDiggNotificationsPane.uninit(); }, false);
