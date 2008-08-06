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
