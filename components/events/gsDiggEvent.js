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

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Ce = Components.Exception;
const CLASS_ID = Components.ID("{96122571-2C13-4629-B712-1D716AA851DD}");
const CLASS_NAME = "Digg Event";
const CONTRACT_ID = "@glaxstar.org/digg/event;1";

/**
 * Digg Event object. Stores information common to any Digg event (story,
 * friend activity).
 */
function gsDiggEvent() {
  this._init();
}

gsDiggEvent.prototype = {

  /* Id of the event */
  _id : null,
  /* Target url to be opened by the event */
  _href : null,
  /* The event direct link */
  _link : null,
  /* Domain of the link URL */
  _domain : null,
  /* Date of the event */
  _date : null,
  /* Event title */
  _title : null,
  /* Event description */
  _description : null,
  /* Event story topic */
  _topic : null,
  /* Event story media */
  _media : null,
  /* URL of the event's image */
  _imageURL : null,
  /* Number of diggs */
  _diggs : null,
  /* Number of comments */
  _comments : null,
  /* Friend user names (comma-separated) related with the event */
  _friends : null,

  /* Log service */
  _logService : null,
  /* IO service, used to create nsURI objects. */
  _ioService : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggEvent.init");

    this._ioService =
      Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  },

  /**
   * Getter of the id attribute.
   * @return The id of the event.
   */
  get id() {
    this._logService.debug("gsDiggEvent.id[get]");
    return this._id;
  },

  /**
   * Setter of the id attribute.
   * @param aValue The new value for the event id.
   */
  set id(aValue) {
    this._logService.debug("gsDiggEvent.id[set]");
    this._id = aValue;
  },

  /**
   * Getter of the type attribute.
   * @return The type of the event.
   */
  get type() {
    this._logService.debug("gsDiggEvent.type[get]");
    return this._type;
  },

  /**
   * Setter of the type attribute.
   * @param aValue The new value for the event type.
   */
  set type(aValue) {
    this._logService.debug("gsDiggEvent.type[set]");
    this._type = aValue;
  },

  /**
   * Getter of the href attribute.
   * @return The href of the event.
   */
  get href() {
    this._logService.debug("gsDiggEvent.href[get]");
    return this._href;
  },

  /**
   * Setter of the href attribute.
   * @param aValue The new value for the href.
   */
  set href(aValue) {
    this._logService.debug("gsDiggEvent.href[set]");
    this._href = aValue;
  },

  /**
   * Getter of the link attribute.
   * @return The direct link of the event.
   */
  get link() {
    this._logService.debug("gsDiggEvent.link[get]");
    return this._link;
  },

  /**
   * Setter of the link attribute.
   * @param aValue The new value for the link.
   */
  set link(aValue) {
    this._logService.debug("gsDiggEvent.link[set]");
    this._link = aValue;

    var uri;
    try {
      uri = this._ioService.newURI(this._link, null, null);
    } catch (e) {
      uri = this._ioService.newURI("http://" + this._link, null, null);
    }
    this._domain = uri.host;
  },

  /**
   * Getter of the link URL domain.
   * @return The domain of the link URL.
   */
  get domain() {
    this._logService.debug("gsDiggEvent.domain[get]");
    return this._domain;
  },

  /**
   * Getter of the date attribute.
   * @return The date of the event.
   */
  get date() {
    this._logService.debug("gsDiggEvent.date[get]");
    return this._date;
  },

  /**
   * Setter of the date attribute.
   * @param aValue The new value for the date.
   */
  set date(aValue) {
    this._logService.debug("gsDiggEvent.date[set]");
    this._date = aValue;
  },

  /**
   * Getter of the title attribute.
   * @return The title of the event.
   */
  get title() {
    this._logService.debug("gsDiggEvent.title[get]");
    return this._title;
  },

  /**
   * Setter of the title attribute.
   * @param aValue The new value for the title.
   */
  set title(aValue) {
    this._logService.debug("gsDiggEvent.title[set]");
    this._title = aValue;
  },

  /**
   * Getter of the description attribute.
   * @return The date of the event.
   */
  get description() {
    this._logService.debug("gsDiggEvent.description[get]");
    return this._description;
  },

  /**
   * Setter of the description attribute.
   * @param aValue The new value for the description.
   */
  set description(aValue) {
    this._logService.debug("gsDiggEvent.description[set]");
    this._description = aValue;
  },

  /**
   * Getter of the topic attribute.
   * @return The topic of the event story.
   */
  get topic() {
    this._logService.debug("gsDiggEvent.topic[get]");
    return this._topic;
  },

  /**
   * Setter of the topic attribute.
   * @param aValue The new value for the topic.
   */
  set topic(aValue) {
    this._logService.debug("gsDiggEvent.topic[set]");
    this._topic = aValue;
  },

  /**
   * Getter of the story media.
   * @return The media of the event story.
   */
  get media() {
    this._logService.debug("gsDiggEvent.media[get]");
    return this._media;
  },

  /**
   * Setter of the story media.
   * @param aValue The new value for the media.
   */
  set media(aValue) {
    this._logService.debug("gsDiggEvent.media[set]");
    this._media = aValue;
  },

  /**
   * Getter of the imageURL attribute.
   * @return The URL of the event's image.
   */
  get imageURL() {
    this._logService.debug("gsDiggEvent.imageURL[get]");
    return this._imageURL;
  },

  /**
   * Setter of the imageURL attribute.
   * @param aValue The new value for the URL of the event's image.
   */
  set imageURL(aValue) {
    this._logService.debug("gsDiggEvent.imageURL[set]");
    this._imageURL = aValue;
  },

  /**
   * Getter of the user attribute.
   * @return The user name of the user who submitted the story.
   */
  get user() {
    this._logService.debug("gsDiggEvent.user[get]");
    return this._user;
  },

  /**
   * Setter of the user attribute.
   * @param aValue The new user name of the user who submitted the story.
   */
  set user(aValue) {
    this._logService.debug("gsDiggEvent.user[set]");
    this._user = aValue;
  },

  /**
   * Getter of the diggs attribute.
   * @return The number of diggs of the event.
   */
  get diggs() {
    this._logService.debug("gsDiggEvent.diggs[get]");
    return this._diggs;
  },

  /**
   * Setter of the diggs attribute.
   * @param aValue The new value for the diggs attribute.
   */
  set diggs(aValue) {
    this._logService.debug("gsDiggEvent.diggs[set]");
    this._diggs = aValue;
  },

  /**
   * Getter of the comments attribute.
   * @return The number of comments of the event.
   */
  get comments() {
    this._logService.debug("gsDiggEvent.comments[get]");
    return this._comments;
  },

  /**
   * Setter of the comments attribute.
   * @param aValue The new value for the comments attribute.
   */
  set comments(aValue) {
    this._logService.debug("gsDiggEvent.comments[set]");
    this._comments = aValue;
  },

  /**
   * Getter of the friends attribute.
   * @return The friends related with this event.
   */
  get friends() {
    this._logService.debug("gsDiggEvent.friends[get]");
    return this._friends;
  },

  /**
   * Setter of the friends attribute.
   * @param aValue The new value for the friends attribute.
   */
  set friends(aValue) {
    this._logService.debug("gsDiggEvent.friends[set]");
    this._friends = aValue;
  },

  /**
   * Populates the event object with the information from a story.
   * @param aStoryDTO The storyDTO object used to populate the event.
   * @param aEventType The type of this event object.
   * @throws Exception if aStoryDTO is invalid.
   */
  populateFromStory : function(aStoryDTO, aEventType) {
    this._logService.debug("gsDiggEvent.populateFromStory");

    if (null == aStoryDTO) {
      throw Ce("The storyDTO object is null");
    }

    this.type = aEventType;
    this.id = aStoryDTO.storyId;
    this.href = aStoryDTO.href;
    this.link = aStoryDTO.link;

    if (Ci.gsIDiggEvent.EVENT_TYPE_STORY == aEventType) {
      this.date = aStoryDTO.promoteDate;
    } else {
      this.date = aStoryDTO.submitDate;
    }

    this.title = aStoryDTO.title;
    this.description = aStoryDTO.description;
    if (null != aStoryDTO.topic) {
      this.topic = aStoryDTO.topic.name;
    }
    if (null != aStoryDTO.media) {
      this.media = aStoryDTO.media.shortName;
    }
    if (null != aStoryDTO.thumbnail) {
      this.imageURL = aStoryDTO.thumbnail.src;
    }
    this.user = aStoryDTO.user.userName;
    this.diggs = aStoryDTO.diggs;
    this.comments = aStoryDTO.comments;

    if (aStoryDTO.friends instanceof Ci.nsIArray) {

      var friendArray = new Array();
      var friend = null;
      var friendEnu = aStoryDTO.friends.enumerate();

      while (friendEnu.hasMoreElements()) {
        friend = friendEnu.getNext().QueryInterface(Ci.gsIDiggUserDTO);
        friendArray.push(friend.userName);

        // XXX: If the event is a friend digg, set the oldest digg date as
        // this event's date.
        if (Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_DIGG == aEventType) {
          this.date = friend.eventDate;
        }
      }

      this.friends = friendArray.toString();
    }
  },

  /**
   * Populates the event object with the information from a story comment.
   * @param aStoryDTO The story to which the comment belongs.
   * @param aCommentDTO The comment used to populate this event.
   * @throws Exception if either aStoryDTO or aCommentDTO are invalid.
   */
  populateFromStoryComment : function(aStoryDTO, aCommentDTO) {
    this._logService.debug("gsDiggEvent.populateFromStory");

    if (null == aStoryDTO) {
      throw Ce("The storyDTO object is null");
    }
    if (null == aCommentDTO) {
      throw Ce("The commentDTO object is null");
    }

    this.type = Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_COMMENT;
    this.id = aCommentDTO.commentId;
    this.href = aStoryDTO.href +
                "?t=" + aCommentDTO.threadRootId +
                "#c" + aCommentDTO.commentId;
    this.link = aStoryDTO.link;

    this.date = aCommentDTO.date;

    this.title = aStoryDTO.title;
    this.description = aCommentDTO.content;
    if (null != aStoryDTO.topic) {
      this.topic = aStoryDTO.topic.name;
    }
    if (null != aStoryDTO.media) {
      this.media = aStoryDTO.media.shortName;
    }
    if (null != aStoryDTO.thumbnail) {
      this.imageURL = aStoryDTO.thumbnail.src;
    }
    this.user = aStoryDTO.user.userName;
    this.diggs = aStoryDTO.diggs;
    this.comments = aStoryDTO.comments;

    this.friends = aCommentDTO.userName;
  },

  /**
   * Populates the event object with the information from an administration
   * message.
   * @param aMessageDTO The AdminMessageDTO object used to populate the event.
   * @throws Exception if aMessageDTO is invalid.
   */
  populateFromAdminMessage : function(aMessageDTO) {
    this._logService.debug("gsDiggEvent.populateFromAdminMessage");

    if (null == aMessageDTO) {
      throw Ce("The messageDTO object is null");
    }

    this.type = Ci.gsIDiggEvent.EVENT_TYPE_ADMIN_MESSAGE;
    this.id = aMessageDTO.messageId;
    this.date = aMessageDTO.date;
    this.title = aMessageDTO.title;
    this.description = aMessageDTO.description;
    this.href = aMessageDTO.url;
    this.link = aMessageDTO.url;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggEvent) &&
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
var gsDiggEventFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsDiggEvent()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggEventModule = {
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
      return gsDiggEventFactory;
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
  return gsDiggEventModule;
}
