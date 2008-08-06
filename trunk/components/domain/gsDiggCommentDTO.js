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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Ce = Components.Exception;
const CLASS_ID = Components.ID("{D4841E90-6A5D-41BA-AE4F-AB556865834C}");
const CLASS_NAME = "Comment DTO";
const CONTRACT_ID = "@glaxstar.org/digg/comment-dto;1";

/**
 * Comment data transfer object. Holds information about one comment.
 */
function gsDiggCommentDTO() {
  this._init();
}

gsDiggCommentDTO.prototype = {

  /* Id of the comment */
  _commentId : null,
  /* Date in which the comment was made */
  _date : null,
  /* Id of the story the comment belongs to */
  _storyId : null,
  /* User name of the user who made the comment */
  _userName : null,
  /* Content of the comment */
  _content : null,
  /* Number of thumbs up */
  _up : null,
  /* Number of thumbs down */
  _down : null,
  /* Number of replies */
  _replies : null,
  /* Id of the comment thread root */
  _threadRootId : null,

  /* Log service */
  _logService : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggCommentDTO.init");
  },

  /**
   * Returns the comment id.
   * @return comment id.
   */
  get commentId() {
    this._logService.debug("gsDiggCommentDTO.commentId[get]");
    return this._commentId;
  },

  /**
   * Sets the comment id.
   * @param aValue comment id
   */
  set commentId(aValue) {
    this._logService.debug("gsDiggCommentDTO.commentId[set]");
    this._commentId = aValue;
  },

  /**
   * Returns the comment date.
   * @return comment date.
   */
  get date() {
    this._logService.debug("gsDiggCommentDTO.date[get]");
    return this._date;
  },

  /**
   * Sets the comment date.
   * @param aValue comment date
   */
  set date(aValue) {
    this._logService.debug("gsDiggCommentDTO.date[set]");
    this._date = aValue;
  },

  /**
   * Returns the comment story id.
   * @return comment story id.
   */
  get storyId() {
    this._logService.debug("gsDiggCommentDTO.storyId[get]");
    return this._storyId;
  },

  /**
   * Sets the comment story id.
   * @param aValue comment story id
   */
  set storyId(aValue) {
    this._logService.debug("gsDiggCommentDTO.storyId[set]");
    this._storyId = aValue;
  },

  /**
   * Returns the comment user name.
   * @return comment user name.
   */
  get userName() {
    this._logService.debug("gsDiggCommentDTO.userName[get]");
    return this._userName;
  },

  /**
   * Sets the comment user name.
   * @param aValue comment user name
   */
  set userName(aValue) {
    this._logService.debug("gsDiggCommentDTO.userName[set]");
    this._userName = aValue;
  },

  /**
   * Returns the content of the comment.
   * @return The content of the comment.
   */
  get content() {
    this._logService.debug("gsDiggCommentDTO.content[get]");
    return this._content;
  },

  /**
   * Sets the content of the comment.
   * @param aValue The new value for content.
   */
  set content(aValue) {
    this._logService.debug("gsDiggCommentDTO.content[set]");
    this._content = aValue;
  },

  /**
   * Returns the number of thumbs up of the comment.
   * @return The number of thumbs up.
   */
  get up() {
    this._logService.debug("gsDiggCommentDTO.up[get]");
    return this._up;
  },

  /**
   * Sets the number of thumbs up of the comment.
   * @param aValue The number of thumbs up.
   */
  set up(aValue) {
    this._logService.debug("gsDiggCommentDTO.up[set]");
    this._up = aValue;
  },

  /**
   * Returns the number of thumbs down of the comment.
   * @return The number of thumbs down.
   */
  get down() {
    this._logService.debug("gsDiggCommentDTO.down[get]");
    return this._down;
  },

  /**
   * Sets the number of thumbs down of the comment.
   * @param aValue The number of thumbs down.
   */
  set down(aValue) {
    this._logService.debug("gsDiggCommentDTO.down[set]");
    this._down = aValue;
  },

  /**
   * Returns the number of replies of the comment.
   * @return The number of replies.
   */
  get replies() {
    this._logService.debug("gsDiggCommentDTO.replies[get]");
    return this._replies;
  },

  /**
   * Sets the number of replies of the comment.
   * @param aValue The number of replies.
   */
  set replies(aValue) {
    this._logService.debug("gsDiggCommentDTO.replies[set]");
    this._replies = aValue;
  },

  /**
   * Returns the id of the comment thread root.
   * @return The thread root id.
   */
  get threadRootId() {
    this._logService.debug("gsDiggCommentDTO.threadRootId[get]");
    return this._threadRootId;
  },

  /**
   * Sets the id of the comment thread root.
   * @param aValue The id of the comment thread root.
   */
  set threadRootId(aValue) {
    this._logService.debug("gsDiggCommentDTO.threadRootId[set]");
    this._threadRootId = aValue;
  },

  /**
   * Populates the commentDTO with the information contained in the
   * gsICMTransferObject.
   * @param aCMTransferObject the transfer object to extract the comment data.
   */
  populateFromTO : function(aCMTransferObject) {
    this._logService.debug("gsDiggCommentDTO.populateFromTO");

    if (null != aCMTransferObject) {
      try {
        this.commentId = aCMTransferObject.getIntegerValue("id");
      } catch (e) {
        this.commentId = aCMTransferObject.getStringValue("id");
      }
      if (aCMTransferObject.hasValue("story")) {
        try {
          this.storyId = aCMTransferObject.getIntegerValue("story");
        } catch (e) {
          this.storyId = aCMTransferObject.getStringValue("story");
        }
      }
      if (aCMTransferObject.hasValue("date")) {
        this.date = aCMTransferObject.getIntegerValue("date");
      }
      if (aCMTransferObject.hasValue("user")) {
        this.userName = aCMTransferObject.getStringValue("user");
      }
      if (aCMTransferObject.hasValue("content")) {
        this.content = aCMTransferObject.getStringValue("content");
      }
      if (aCMTransferObject.hasValue("up")) {
        this.up = aCMTransferObject.getIntegerValue("up");
      }
      if (aCMTransferObject.hasValue("down")) {
        this.down = aCMTransferObject.getIntegerValue("down");
      }
      if (aCMTransferObject.hasValue("replies")) {
        this.replies = aCMTransferObject.getIntegerValue("replies");
      }
      if (aCMTransferObject.hasValue("root")) {
        this.threadRootId = aCMTransferObject.getIntegerValue("root");
      }
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggCommentDTO) &&
        !aIID.equals(Ci.nsISupports)) {
      throw Cr.NS_ERROR_NO_INTERFACE;
    }

    return this;
  }
};

/**
 * The nsIFactory interface allows for the creation of nsISupports derived
 * classes without specifying a concrete class type.
 * More: http://developer.mozilla.org/en/docs/nsIFactory
 */
var gsDiggCommentDTOFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsDiggCommentDTO()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggCommentDTOModule = {
  /**
   * When the nsIModule is discovered, this method will be called so that any
   * setup registration can be preformed.
   * @param aCompMgr the global component manager.
   * @param aLocation the location of the nsIModule on disk.
   * @param aLoaderStr opaque loader specific string.
   * @param aType loader type being used to load this module.
   */
  registerSelf : function(aCompMgr, aLocation, aLoaderStr, aType) {
    aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(
      CLASS_ID, CLASS_NAME, CONTRACT_ID, aLocation, aLoaderStr, aType);
  },

  /**
   * When the nsIModule is being unregistered, this method will be called so
   * that any cleanup can be preformed.
   * @param aCompMgr the global component manager.
   * @param aLocation the location of the nsIModule on disk.
   * @param aLoaderStr opaque loader specific string.
   */
  unregisterSelf : function (aCompMgr, aLocation, aLoaderStr) {
    aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
  },

  /**
   * This method returns a class object for a given ClassID and IID.
   * @param aCompMgr the global component manager.
   * @param aClass the ClassID of the object instance requested.
   * @param aIID the IID of the object instance requested.
   * @return the resulting interface pointer.
   * @throws NS_ERROR_NOT_IMPLEMENTED if aIID is inadequate.
   * @throws NS_ERROR_NO_INTERFACE if the interface is not found.
   */
  getClassObject : function(aCompMgr, aClass, aIID) {
    if (!aIID.equals(Ci.nsIFactory)) {
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    }

    if (aClass.equals(CLASS_ID)) {
      return gsDiggCommentDTOFactory;
    }

    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  /**
   * This method may be queried to determine whether or not the component
   * module can be unloaded by XPCOM.
   * @param aCompMgr the global component manager.
   * @return true if the module can be unloaded by XPCOM. false otherwise.
   */
  canUnload: function(aCompMgr) {
    return true;
  }
};

/**
 * Initial entry point.
 * @param aCompMgr the global component manager.
 * @param aFileSpec component file.
 * @return the module for the service.
 */
function NSGetModule(aCompMgr, aFileSpec) {
  return gsDiggCommentDTOModule;
}
