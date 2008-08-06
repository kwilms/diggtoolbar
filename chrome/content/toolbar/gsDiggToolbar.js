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

// Digg toolbar control set
const GS_DIGG_TOOLBAR_SET =
  "gs-digg-toolbar-options-button,separator,gs-digg-toolbar-submit-button," +
  "gs-digg-toolbar-diggs-item,gs-digg-toolbar-separator-existingStory," +
  "gs-digg-toolbar-comments-item,spring,gs-digg-toolbar-snooze-button";

// Digg submit URL
const GS_DIGG_SUBMIT_PLACEHOLDER_URL = "?PLACEHOLDER_URL?";
const GS_DIGG_SUBMIT_PLACEHOLDER_TITLE = "?PLACEHOLDER_TITLE?";
const GS_DIGG_SUBMIT_PLACEHOLDER_DESCRIPTION = "?PLACEHOLDER_DESCRIPTION?";
const GS_DIGG_SUBMIT_PLACEHOLDER_MEDIA = "?PLACEHOLDER_MEDIA?";
const GS_DIGG_SUBMIT_URL =
  "http://digg.com/submit?phase=2" +
  "&url=" + GS_DIGG_SUBMIT_PLACEHOLDER_URL +
  "&title=" + GS_DIGG_SUBMIT_PLACEHOLDER_TITLE +
  "&bodytext=" + GS_DIGG_SUBMIT_PLACEHOLDER_DESCRIPTION +
  "&media=" + GS_DIGG_SUBMIT_PLACEHOLDER_MEDIA;

// Media type constants
const GS_DIGG_MEDIA_NEWS  = "";
const GS_DIGG_MEDIA_IMAGE = "image";
const GS_DIGG_MEDIA_VIDEO = "video";

// Content type regular expressions
const GS_DIGG_MEDIA_IMAGE_REGEX = /image\//gi;
const GS_DIGG_MEDIA_VIDEO_REGEX =
  /(video\/)|(application\/x-shockwave-flash)/gi;

// Location regular expressions to determine media type
const GS_DIGG_MEDIA_IMAGE_SITE_REGEX =
  /apod\.nasa\.gov|photobucket\.com|imageshack\.us|tinypic\.com|flickr\.com/gi
const GS_DIGG_MEDIA_VIDEO_SITE_REGEX =
  /youtube\.com|break\.com|funnyordie\.com|5min\.com|breitbart\.tv|metacafe\.com|video\.google\.com|current\.com/gi;

// Key of the snooze preference
const GS_DIGG_PREF_KEY_SNOOZE = "extensions.digg.snooze";
// Toolbar state constants
const GS_DIGG_TOOLBAR_STATE_EMPTY = 0;
const GS_DIGG_TOOLBAR_STATE_NEW_STORY = 1;
const GS_DIGG_TOOLBAR_STATE_EXISTING_STORY = 2;

/**
 * Toolbar Digg script object.
 */
var gsDiggToolbar = {

  /* Log service */
  _logService : null,
  /* Main Digg service */
  _mainDiggService : null,
  /* IO service */
  _ioService : null,
  /* Utility service */
  _utilityService : null,
  /* New story broadcaster */
  _bcNewStory : null,
  /* Existing story broadcaster */
  _cbExistingStory : null,
  /* The current story loaded in the toolbar */
  _currentStory : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggToolbar.init");

    this._mainDiggService =
      Cc["@glaxstar.org/digg/main-service;1"].
        getService(Ci.gsIDiggMainService);
    this._ioService =
      Cc["@mozilla.org/network/io-service;1"].
        getService(Ci.nsIIOService);
    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;1"].
        getService(Ci.gsIUtilityService);

    this._bcNewStory =
      document.getElementById('gs-digg-toolbar-broadcaster-newStory');
    this._bcExistingStory =
      document.getElementById('gs-digg-toolbar-broadcaster-existingStory');

    // XXX: Enfore our toolbar set of controls
    window.setTimeout(function() { gsDiggToolbar._enforceToolbarSet(); }, 0);
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logService.debug("gsDiggToolbar.uninit");
  },

  /**
   * Enforces our desired toolbar control set. This is a required hack because
   * Firefox converts our custom toolbarseparator controls into regular ones.
   */
  _enforceToolbarSet : function() {
    this._logService.trace("gsDiggToolbar._enforceToolbarSet");

    let toolbar = document.getElementById("gs-digg-toolbar");
    toolbar.setAttribute("currentset", GS_DIGG_TOOLBAR_SET);
    toolbar.currentSet = GS_DIGG_TOOLBAR_SET;
    toolbar.ownerDocument.persist(toolbar.id, "currentset");
    BrowserToolboxCustomizeDone(true);
  },

  /**
   * Sets the state of the toolbar: empty, new or existing story.
   * @param aState The toolbar state to be ser.
   */
  set _toolbarState(aState) {
    this._logService.debug("gsDiggToolbar._toolbarState[set]");

    this._bcNewStory.collapsed =
      (aState != GS_DIGG_TOOLBAR_STATE_NEW_STORY);
    this._bcExistingStory.collapsed =
      (aState != GS_DIGG_TOOLBAR_STATE_EXISTING_STORY);
  },

  /**
   * Toggles toolbar visibility
   */
  toggleToolbar : function() {
    this._logService.debug("gsDiggToolbar.toogleToolbar");

    var toolbar = document.getElementById("gs-digg-toolbar");
    toolbar.collapsed = !toolbar.collapsed;
  },

  /**
   * Gets the URI object of the specify URL.
   * @param aURL The URL to convert to URI
   * @return The URI object.
   */
  _getURI : function(aURL) {
    this._logService.trace("gsDiggToolbar._getURI");

    var uri = null;

    if (!this._utilityService.isNullOrEmpty(aURL)) {
      try {
        uri = this._ioService.newURI(aURL, null, null);
      } catch (e) {
        aURL = "http://" + aURL;
        uri = this._ioService.newURI(aURL, null, null);
      }
    }

    return uri;
  },

  /**
   * Verifies is the URI is valid.
   * @param aURI The URI to examine.
   * @return True if its valid, false otherwise.
   */
  _isValidURI : function(aURI) {
    this._logService.trace("gsDiggToolbar._isValidURI");

    let isValid = false;

    if (aURI) {
      let scheme = String(aURI.scheme);
      isValid = (0 <= scheme.indexOf("http"));
    }

    return isValid;
  },

  /**
   * Verifies if the URI is a valid digg URL.
   * @param aURI The URI to examine.
   * @return True if it is valid, false otherwise.
   */
  _isValidDiggURI : function(aURI) {
    this._logService.trace("gsDiggToolbar._isValidDiggURI");

    return (("digg.com" == aURI.host) || ("www.digg.com" == aURI.host));
  },

  /**
   * Gets the clean title from a digg URL.
   * @param aURI the URI to be verified
   * @return url clean title
   */
  _getDiggURLTitle : function(aURI) {
    this._logService.trace("gsDiggToolbar._getDiggURLTitle");

    var urlTitle = null;

    if (this._isValidDiggURI(aURI)) {
      var lastIndexOf = aURI.path.lastIndexOf("/");
      if (lastIndexOf > 1) {
        urlTitle = aURI.path.substring(lastIndexOf + 1);
      }
    }

    return urlTitle;
  },

  /**
   * Page changed event. Uses the main Digg service to see if the loaded URL
   * has a story in Digg.
   * @param aURL The URL that has just been loaded.
   */
  onPageChanged : function(aURL) {
    this._logService.debug("gsDiggToolbar.onPageChanged");

    var urlURI = this._getURI(aURL);

    if (this._isValidURI(urlURI)) {

      if (this._isValidDiggURI(urlURI)) {
        // get story object by its title because a Digg permalink page is loaded
        //this._getStoryByTitle(aURL, urlURI);
        // TODO: getStoryByTitle is disabled for now. Remove if not needed later
        this._toolbarState = GS_DIGG_TOOLBAR_STATE_EMPTY;
      } else {
        this._getStoryByURL(aURL);
      }

    } else {
      this._toolbarState = GS_DIGG_TOOLBAR_STATE_EMPTY;
    }
  },

  /**
   * Gets a story object from its link URL calling the API.
   * @param aURL The URL used to obtain the story.
   */
  _getStoryByURL : function(aURL) {
    this._logService.trace("gsDiggToolbar._getStoryByURL");

    try {
      let that = this;
      this._mainDiggService.getStoryByURL(
        aURL,
        { handleLoad : function(aResultCount, aResults) {
            that._getStoryLoadHandler(aURL, aResultCount, aResults);
          }
        });
    } catch (e) {
      this._toolbarState = GS_DIGG_TOOLBAR_STATE_EMPTY;
      this._logService.error("gsDiggToolbar._getStoryByURL: " + e);
    }
  },

  /**
   * Gets a story object from its link title calling the API.
   * @param aURL The URL used to obtain the story.
   * @param aURI The uri URL used to obtain the story.
   */
  _getStoryByTitle : function(aURL, aURI) {
    this._logService.trace("gsDiggToolbar._getStoryByTitle");

    try {
      var urlTitle = this._getDiggURLTitle(aURI);
      if (null != urlTitle) {

        let that = this;
        this._mainDiggService.getStoryByTitle(
          urlTitle,
          { handleLoad: function(aResultCount, aResults) {
              that._getStoryLoadHandler(aURL, aResultCount, aResults);
            }
          });
      } else {
        this._toolbarState = GS_DIGG_TOOLBAR_STATE_EMPTY;
      }
    } catch(e) {
      this._toolbarState = GS_DIGG_TOOLBAR_STATE_EMPTY;
      this._logService.error("gsDiggToolbar._getStoryByTitle: " + e);
    }
  },

  /**
   * Handles the response from the getStoryByURL and getStoryByTitle methods.
   * Checks whether the given story object is valid and loads it in the toolbar.
   * @param aURL The story's URL.
   * @param aResultCount The number of objects contained in the response.
   * @param aResults The array of objects in the response.
   */
  _getStoryLoadHandler : function(aURL, aResultCount, aResults) {
    this._logService.trace("gsDiggToolbar._getStoryLoadHandler");

    try {
      if (aResultCount > 0) {
        this._loadStory(aResults[0].QueryInterface(Ci.gsIDiggStoryDTO));
        this._toolbarState = GS_DIGG_TOOLBAR_STATE_EXISTING_STORY;
      } else {
        this._toolbarState = GS_DIGG_TOOLBAR_STATE_NEW_STORY;
      }
    } catch (e) {
      this._toolbarState = GS_DIGG_TOOLBAR_STATE_EMPTY;
      this._logService.error("gsDiggToolbar._getStoryLoadHandler: " + e);
    }
  },

  /**
   * Loads the story info in the toolbar.
   * @param aStoryDTO The object that contains the story data.
   */
  _loadStory : function(aStoryDTO) {
    this._logService.trace("gsDiggToolbar._loadStory");

    this._currentStory = aStoryDTO;

    var stringBundle = document.getElementById("gs-digg-toolbar-string-bundle");
    var diggs = document.getElementById("gs-digg-toolbar-diggs-count");
    var comments = document.getElementById("gs-digg-toolbar-comments-count");

    if (aStoryDTO.diggs == 1) {
      diggs.setAttribute("value",
        stringBundle.getFormattedString(
          "gs.digg.toolbar.diggs.singular", []));
    } else {
      diggs.setAttribute("value",
        stringBundle.getFormattedString(
          "gs.digg.toolbar.diggs.plural", [aStoryDTO.diggs]));
    }

    if (aStoryDTO.comments == 1) {
      comments.setAttribute("value",
        stringBundle.getFormattedString(
          "gs.digg.toolbar.comments.singular", []));
    } else {
      comments.setAttribute("value",
        stringBundle.getFormattedString(
          "gs.digg.toolbar.comments.plural", [aStoryDTO.comments]));
    }
  },

  /**
   * Submits the current document.location as a Digg story.
   * @param aTrackingCode The Digg tracking code to be appended to the URL.
   */
  submitStory : function(aTrackingCode) {
    this._logService.debug("gsDiggToolbar._loadStory");

    var url = content.location;
    var title = null;
    var description = null;
    var media = null;

    // Try to obtain title, description and media from meta tags
    var metas = content.document.getElementsByTagName("meta");
    for (var i = metas.length - 1; 0 <= i; i--) {
      switch (metas[i].getAttribute("name")) {
        case "title":
          title = metas[i].getAttribute("content");
          break;
        case "description":
          description = metas[i].getAttribute("content");
          break;
        case "medium":
          media = metas[i].getAttribute("content");
          break;
      }
    }

    if (null == title) {
      title = content.document.title;
    }
    if (null == description) {
      description = "";
    }
    if (null == media) {
      media = this._getDocumentMediaType();
    }

    var submitURL = GS_DIGG_SUBMIT_URL;

    submitURL = submitURL.replace(GS_DIGG_SUBMIT_PLACEHOLDER_URL, url);
    submitURL = submitURL.replace(GS_DIGG_SUBMIT_PLACEHOLDER_TITLE, title);
    submitURL = submitURL.replace(GS_DIGG_SUBMIT_PLACEHOLDER_MEDIA, media);
    submitURL =
      submitURL.replace(GS_DIGG_SUBMIT_PLACEHOLDER_DESCRIPTION, description);

    gsDiggMain.openURL(submitURL, aTrackingCode);
  },

  /**
   * Obtains the Digg media value for the current document.
   * @return The Digg media (news, video or image)
   */
  _getDocumentMediaType : function() {
    this._logService.trace("gsDiggToolbar._getDocumentMediaType");

    let media = GS_DIGG_MEDIA_NEWS;
    let contentType = String(content.document.contentType);
    let url = String(content.location);

    if (contentType.match(GS_DIGG_MEDIA_IMAGE_REGEX)) {
      media = GS_DIGG_MEDIA_IMAGE;
    } else if (contentType.match(GS_DIGG_MEDIA_VIDEO_REGEX)) {
      media = GS_DIGG_MEDIA_VIDEO;
    } else if (url.match(GS_DIGG_MEDIA_IMAGE_SITE_REGEX)) {
      media = GS_DIGG_MEDIA_IMAGE;
    } else if (url.match(GS_DIGG_MEDIA_VIDEO_SITE_REGEX)) {
      media = GS_DIGG_MEDIA_VIDEO;
    }

    return media;
  },

  /**
   * Opens the current story's permalink.
   * @param aTrackingCode The Digg tracking code to be appended to the URL.
   */
  openStory : function(aTrackingCode) {
    this._logService.debug("gsDiggToolbar.openStory");

    if (null != this._currentStory) {
      gsDiggMain.openURL(this._currentStory.href, aTrackingCode);
    }
  }
};

window.addEventListener("load",
  function() { gsDiggToolbar.init(); }, false);
window.addEventListener("unload",
  function() { gsDiggToolbar.uninit(); }, false);
