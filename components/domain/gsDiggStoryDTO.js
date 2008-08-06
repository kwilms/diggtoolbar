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
const CLASS_ID = Components.ID("{C0C99270-AF95-445A-A65A-30501EBD94EC}");
const CLASS_NAME = "Story DTO";
const CONTRACT_ID = "@glaxstar.org/digg/story-dto;1";

// Mutable array constructor
const NSArray =
  new Components.Constructor("@mozilla.org/array;1", Ci.nsIMutableArray);

/**
 * Story DTO
 * Stores story info
 */
function gsDiggStoryDTO() {
  this._init();
}

gsDiggStoryDTO.prototype = {

  /* Story id */
  _storyId : null,
  /* Story link */
  _link : null,
  /* Story submit date */
  _submitDate : null,
  /* Story promote date */
  _promoteDate : null,
  /* Story title */
  _title : null,
  /* Story description */
  _description : null,
  /* Story status */
  _status : null,
  /* Story href */
  _href : null,
  /* Story diggs (count) */
  _diggs : null,
  /* Story comments (count) */
  _comments : null,
  /* Story user */
  _user: null,
  /* Story media */
  _media: null,
  /* Story topic */
  _topic: null,
  /* Story container */
  _container : null,
  /* Story thumbnail */
  _thumbnail : null,
  /* Friends related with this story */
  _friends : null,

  /* Log service */
  _logService : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggStoryDTO.init");
  },

  /**
   * Returns the story id.
   * @return story id.
   */
  get storyId() {
    this._logService.debug("gsDiggStoryDTO.storyId[get]");
    return this._storyId;
  },

  /**
   * Sets the story id.
   * @param aValue story id
   */
  set storyId(aValue) {
    this._logService.debug("gsDiggStoryDTO.storyId[set]");
    this._storyId = aValue;
  },

  /**
   * Returns the story link.
   * @return story link.
   */
  get link() {
    this._logService.debug("gsDiggStoryDTO.link[get]");
    return this._link;
  },

  /**
   * Sets the story link.
   * @param aValue story link
   */
  set link(aValue) {
    this._logService.debug("gsDiggStoryDTO.link[set]");
    this._link = aValue;
  },

  /**
   * Returns the story submit date.
   * @return The story submit date.
   */
  get submitDate() {
    this._logService.debug("gsDiggStoryDTO.submitDate[get]");
    return this._submitDate;
  },

  /**
   * Sets the story submit date.
   * @param aValue The new story submit date.
   */
  set submitDate(aValue) {
    this._logService.debug("gsDiggStoryDTO.submitDate[set]");
    this._submitDate = aValue;
  },

  /**
   * Returns the story promote date.
   * @return The story promote date.
   */
  get promoteDate() {
    this._logService.debug("gsDiggStoryDTO.promoteDate[get]");
    return this._promoteDate;
  },

  /**
   * Sets the story promote date.
   * @param aValue The new story promote date.
   */
  set promoteDate(aValue) {
    this._logService.debug("gsDiggStoryDTO.promoteDate[set]");
    this._promoteDate = aValue;
  },

  /**
   * Returns the story title.
   * @return story title.
   */
  get title() {
    this._logService.debug("gsDiggStoryDTO.title[get]");
    return this._title;
  },

  /**
   * Sets the story title.
   * @param aValue story title
   */
  set title(aValue) {
    this._logService.debug("gsDiggStoryDTO.title[set]");
    this._title = aValue;
  },

  /**
   * Returns the story description.
   * @return story description.
   */
  get description() {
    this._logService.debug("gsDiggStoryDTO.description[get]");
    return this._description;
  },

  /**
   * Sets the story description.
   * @param aValue story description
   */
  set description(aValue) {
    this._logService.debug("gsDiggStoryDTO.description[set]");
    this._description = aValue;
  },

  /**
   * Returns the story status.
   * @return story status.
   */
  get status() {
    this._logService.debug("gsDiggStoryDTO.status[get]");
    return this._status;
  },

  /**
   * Sets the story status.
   * @param aValue story status
   */
  set status(aValue) {
    this._logService.debug("gsDiggStoryDTO.status[set]");
    this._status = aValue;
  },

  /**
   * Returns the story href.
   * @return story href.
   */
  get href() {
    this._logService.debug("gsDiggStoryDTO.href[get]");
    return this._href;
  },

  /**
   * Sets the story href.
   * @param aValue story href
   */
  set href(aValue) {
    this._logService.debug("gsDiggStoryDTO.href[set]");
    this._href = aValue;
  },

  /**
   * Returns the story diggs.
   * @return story diggs.
   */
  get diggs() {
    this._logService.debug("gsDiggStoryDTO.diggs[get]");
    return this._diggs;
  },

  /**
   * Sets the story diggs.
   * @param aValue story diggs
   */
  set diggs(aValue) {
    this._logService.debug("gsDiggStoryDTO.diggs[set]");
    this._diggs = aValue;
  },

  /**
   * Returns the story comments.
   * @return story comments.
   */
  get comments() {
    this._logService.debug("gsDiggStoryDTO.comments[get]");
    return this._comments;
  },

  /**
   * Sets the story comments.
   * @param aValue story comments
   */
  set comments(aValue) {
    this._logService.debug("gsDiggStoryDTO.comments[set]");
    this._comments = aValue;
  },

  /**
   * Returns the story user.
   * @return story user.
   */
  get user() {
    this._logService.debug("gsDiggStoryDTO.user[get]");
    return this._user;
  },

  /**
   * Sets the story user.
   * @param aValue story user
   */
  set user(aValue) {
    this._logService.debug("gsDiggStoryDTO.user[set]");
    this._user = aValue;
  },

  /**
   * Returns the story media.
   * @return story media.
   */
  get media() {
    this._logService.debug("gsDiggStoryDTO.media[get]");
    return this._media;
  },

  /**
   * Sets the story media.
   * @param aValue story media
   */
  set media(aValue) {
    this._logService.debug("gsDiggStoryDTO.media[set]");
    this._media = aValue;
  },

  /**
   * Returns the story topic.
   * @return story topic.
   */
  get topic() {
    this._logService.debug("gsDiggStoryDTO.topic[get]");
    return this._topic;
  },

  /**
   * Sets the story topic.
   * @param aValue story topic
   */
  set topic(aValue) {
    this._logService.debug("gsDiggStoryDTO.topic[set]");
    this._topic = aValue;
  },

  /**
   * Returns the story container.
   * @return story container.
   */
  get container() {
    this._logService.debug("gsDiggStoryDTO.container[get]");
    return this._container;
  },

  /**
   * Sets the story container.
   * @param aValue story container
   */
  set container(aValue) {
    this._logService.debug("gsDiggStoryDTO.container[set]");
    this._container = aValue;
  },

  /**
   * Returns the story thumbnail.
   * @return story thumbnail.
   */
  get thumbnail() {
    this._logService.debug("gsDiggStoryDTO.thumbnail[get]");
    return this._thumbnail;
  },

  /**
   * Sets the story thumbnail.
   * @param aValue story thumbnail
   */
  set thumbnail(aValue) {
    this._logService.debug("gsDiggStoryDTO.thumbnail[set]");
    this._thumbnail = aValue;
  },

  /**
   * Returns the array of friends.
   * @return The array of friends related with this story.
   */
  get friends() {
    this._logService.debug("gsDiggStoryDTO.friends[get]");
    return this._friends;
  },

  /**
   * Sets the array of friends.
   * @param aValue The array of friends related with this story.
   */
  set friends(aValue) {
    this._logService.debug("gsDiggStoryDTO.friends[set]");
    this._friends = aValue;
  },

  /**
   * Populates the storyDTO with the information contained in the
   * gsICMTransferObject.
   * @param aCMTransferObject the transfer object to extract the story data.
   */
  populateFromTO : function(aCMTransferObject) {
    this._logService.debug("gsDiggStoryDTO.populateFromTO");

    if (null != aCMTransferObject) {

      // XXX: The id field sometimes is an integer and sometimes a string...
      // story id
      try {
        this.storyId = new String(aCMTransferObject.getIntegerValue("id"));
      } catch (e) {
        this.storyId = aCMTransferObject.getStringValue("id");
      }

      // story link
      if (aCMTransferObject.hasValue("link")) {
        this.link = aCMTransferObject.getStringValue("link");
      }
      // story submit date
      if (aCMTransferObject.hasValue("submit_date")) {
        this.submitDate = aCMTransferObject.getIntegerValue("submit_date");
      }
      // story promote date
      if (aCMTransferObject.hasValue("promote_date")) {
        this.promoteDate = aCMTransferObject.getIntegerValue("promote_date");
      }
      // story title
      if (aCMTransferObject.hasValue("title")) {
        this.title = aCMTransferObject.getStringValue("title");
      }
      // story description
      if (aCMTransferObject.hasValue("description")) {
        this.description = aCMTransferObject.getStringValue("description");
      }
      // story status
      if (aCMTransferObject.hasValue("status")) {
        this.status = aCMTransferObject.getStringValue("status");
      }
      // story href
      if (aCMTransferObject.hasValue("href")) {
        this.href = aCMTransferObject.getStringValue("href");
      }
      // story diggs
      if (aCMTransferObject.hasValue("diggs")) {
        this.diggs = aCMTransferObject.getIntegerValue("diggs");
      }
      // story comments
      if (aCMTransferObject.hasValue("comments")) {
        this.comments = aCMTransferObject.getIntegerValue("comments");
      }
      // story user
      if (aCMTransferObject.hasValue("user")) {
        var userDTO =
          Cc["@glaxstar.org/digg/user-dto;1"].
            createInstance(Ci.gsIDiggUserDTO);
        userDTO.populateFromTO(aCMTransferObject.getObjectValue("user"));

        this.user = userDTO;
      }
      // story media
      if (aCMTransferObject.hasValue("media")) {
        var mediaDTO =
          Cc["@glaxstar.org/digg/media-dto;1"].
            createInstance(Ci.gsIDiggMediaDTO);

        mediaDTO.shortName = aCMTransferObject.getStringValue("media");
        //mediaDTO.populateFromTO(aCMTransferObject.getObjectValue("media"));

        this.media = mediaDTO;
      }
      // story topic
      if (aCMTransferObject.hasValue("topic")) {
        var topicDTO =
          Cc["@glaxstar.org/digg/topic-dto;1"].
            createInstance(Ci.gsIDiggTopicDTO);
        topicDTO.populateFromTO(aCMTransferObject.getObjectValue("topic"));

        this.topic = topicDTO;
      }
      // story container
      if (aCMTransferObject.hasValue("container")) {
        var containerDTO =
          Cc["@glaxstar.org/digg/container-dto;1"].
            createInstance(Ci.gsIDiggContainerDTO);
        containerDTO.
          populateFromTO(aCMTransferObject.getObjectValue("container"));

        this.container = containerDTO;
      }
      // story thumbnail
      if (aCMTransferObject.hasValue("thumbnail")) {
        var thumbnailDTO =
          Cc["@glaxstar.org/digg/thumbnail-dto;1"].
            createInstance(Ci.gsIDiggThumbnailDTO);
        thumbnailDTO.
          populateFromTO(aCMTransferObject.getObjectValue("thumbnail"));

        this.thumbnail = thumbnailDTO;
      }
      // friends
      if (aCMTransferObject.hasValue("friends")) {
        var friendDTO = null;
        var friendDTOList = new NSArray();
        var friendsArray = new Object();
        var friendsArrayCount = new Object();
        var friendsArrayValue = null;
        var friendsObject = aCMTransferObject.getObjectValue("friends");
        friendsObject = friendsObject.getObjectValue("users");

        friendsObject.getObjectArray(friendsArrayCount, friendsArray);
        friendsArrayValue = friendsArray.value;

        for (var i = 0; i < friendsArrayCount.value; i++) {
          friendDTO =
            Cc["@glaxstar.org/digg/user-dto;1"].
              createInstance(Ci.gsIDiggUserDTO);
          friendDTO.populateFromTO(friendsArrayValue[i]);

          friendDTOList.appendElement(friendDTO, false);
        }

        this.friends = friendDTOList;
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
    if (!aIID.equals(Ci.gsIDiggStoryDTO) &&
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
var gsDiggStoryDTOFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsDiggStoryDTO()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggStoryDTOModule = {
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
      return gsDiggStoryDTOFactory;
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
  return gsDiggStoryDTOModule;
}
