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
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{04F5F453-56A2-408B-AF38-0E43DEEAFE82}");
const CLASS_NAME = "Event Manager";
const CONTRACT_ID = "@glaxstar.org/digg/event-manager;1";

// Key of the last fetch time preference
const PREF_KEY_LAST_FETCH_TIME = "extensions.digg.lastFetchTime";
// Key of the Digg user name preference
const PREF_KEY_USER_NAME = "extensions.digg.username";
// Key of the "notify friends' activity" preference
const PREF_KEY_NOTIFY_FRIENDS_ACTIVITY =
  "extensions.digg.notify.friendsActivity";
// Key of the "notify news" preference
const PREF_KEY_NOTIFY_NEWS = "extensions.digg.notify.news";
// Key of the "notify videos" preference
const PREF_KEY_NOTIFY_VIDEOS = "extensions.digg.notify.videos";
// Key of the "notify images" preference
const PREF_KEY_NOTIFY_IMAGES = "extensions.digg.notify.images";
// Key of the topic list preference
const PREF_KEY_TOPIC_LIST = "extensions.digg.notify.topic.list";
// Key of the container list preference
const PREF_KEY_CONTAINER_LIST = "extensions.digg.notify.container.list";

// Name of the news media type
const MEDIA_TYPE_NEWS = "news";
// Name of the videos media type
const MEDIA_TYPE_VIDEOS = "videos";
// Name of the images media type
const MEDIA_TYPE_IMAGES = "images";

// Number of friend activity events to fetch
const FRIEND_ACTIVITY_FETCH_COUNT = 50;

/**
 * Event Manager. Fetches events (stories, friend activity) and provides methods
 * to retrieve them.
 */
var gsDiggEventManager = {

  /* Log service */
  _logService : null,
  /* Digg API service */
  _apiService : null,
  /* Utility service */
  _utilityService : null,
  /* Preference service */
  _prefService : null,
  /* Observer service */
  _observerService : null,
  /* Event DAO */
  _eventDAO : null,
  /* Counter for the open fetch event threads */
  _fetchEventCount : 0,
  /* Holds the value for the _thereWereNewEvents property */
  _thereWereNewEventsValue : false,

  /**
   * Getter of the observer topic for the event count changed event.
   * @return The "event count changed" observer topic string.
   */
  get OBSERVER_TOPIC_EVENT_COUNT_CHANGED() {
    return "gs-digg-event-count-changed-observer-topic";
  },

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("gsDiggEventManager._init");

    this._apiService =
      Cc["@glaxstar.org/digg/api-service;1"].getService(Ci.gsIDiggAPIService);
    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;1"].
        getService(Ci.gsIUtilityService);
    this._prefService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._observerService =
      Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    this._eventDAO =
      Cc["@glaxstar.org/digg/event-dao;1"].getService(Ci.gsIDiggEventDAO);

    // Observers added to watch changes in the notification preferences
    this._prefService.QueryInterface(Ci.nsIPrefBranch2);
    this._prefService.addObserver(PREF_KEY_USER_NAME, this, false);
    this._prefService.addObserver(
      PREF_KEY_NOTIFY_FRIENDS_ACTIVITY, this, false);
    this._prefService.addObserver(PREF_KEY_NOTIFY_NEWS, this, false);
    this._prefService.addObserver(PREF_KEY_NOTIFY_VIDEOS, this, false);
    this._prefService.addObserver(PREF_KEY_NOTIFY_IMAGES, this, false);
    this._prefService.addObserver(PREF_KEY_TOPIC_LIST, this, false);
    this._prefService.addObserver(PREF_KEY_CONTAINER_LIST, this, false);
    this._prefService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Gets the flag that determines whether or not there were new events fetched.
   * @return True if there were new events, false otherwise.
   */
  get _thereWereNewEvents() {
    this._logService.trace("gsDiggEventManager._thereWereNewEvents[get]");
    return this._thereWereNewEventsValue;
  },

  /**
   * Sets the flag that determines whether or not there were new events fetched.
   * @aValue The flag value to be set.
   */
  set _thereWereNewEvents(aValue) {
    this._logService.trace("gsDiggEventManager._thereWereNewEvents[set]");

    this._thereWereNewEventsValue = aValue;

    if (this._thereWereNewEventsValue) {
      this._notifyEventCountObservers();
    }
  },

  /**
   * Gets the last time in which events were fetched.
   * @return The last time in which events were fetched if the value is found.
   * Null otherwise.
   */
  _getLastFetchTime : function() {
    this._logService.trace("gsDiggEventManager._getLastFetchTime");

    var time = null;
    try {
      time = this._prefService.getIntPref(PREF_KEY_LAST_FETCH_TIME);
      if (time <= 0) {
        time = null;
      }
    } catch (e) {
    }
    return time;
  },

  /**
   * Sets the last time in which events were fetched.
   * @param aValue The new time value.
   */
  _setLastFetchTime : function(aValue) {
    this._logService.trace("gsDiggEventManager._lastFetchTime[set]");
    this._prefService.setIntPref(PREF_KEY_LAST_FETCH_TIME, aValue);
  },

  /**
   * Fetches new events (stories, friend activity). The result is passed in the
   * load handler ("true" if new events were found, "false" otherwise).
   * @param aLoadHandler The caller's load handler.
   */
  fetchNewEvents : function(aLoadHandler) {
    this._logService.debug("gsDiggEventManager.fetchNewEvents");

    this._fetchEventCount = 0;
    this._thereWereNewEvents = false;

    var lastFetchTime = this._getLastFetchTime();

    this._fetchFriendActivity(lastFetchTime, aLoadHandler);
    this._fetchPopularStoriesByContainer(lastFetchTime, aLoadHandler);
    this._fetchPopularStoriesByTopic(lastFetchTime, aLoadHandler);
    this._fetchAdminMessages(lastFetchTime, aLoadHandler);
  },

  /**
   * Fetches friend activity events if both a Digg user name is stored and
   * "notify friend activity" is active in the preferences.
   * @param aLastFetchTime The last time friend activity was fetched.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchFriendActivity : function(aLastFetchTime, aLoadHandler) {
    this._logService.trace("gsDiggEventManager._fetchFriendActivity");

    var notify =
      this._prefService.getBoolPref(PREF_KEY_NOTIFY_FRIENDS_ACTIVITY);
    var userName = this._prefService.getCharPref(PREF_KEY_USER_NAME);
    userName = this._utilityService.trim(userName);

    if (notify && !this._utilityService.isNullOrEmpty(userName)) {

      var submissionsTO =
        Cc["@glaxstar.org/common/cm-transfer-object;1"].
          createInstance(Ci.gsICMTransferObject);
      var commentsTO =
        Cc["@glaxstar.org/common/cm-transfer-object;1"].
          createInstance(Ci.gsICMTransferObject);
      var diggsTO =
        Cc["@glaxstar.org/common/cm-transfer-object;1"].
          createInstance(Ci.gsICMTransferObject);

      submissionsTO.setStringValue("userName", userName);
      commentsTO.setStringValue("userName", userName);
      diggsTO.setStringValue("userName", userName);

      submissionsTO.setIntegerValue("count", FRIEND_ACTIVITY_FETCH_COUNT);
      commentsTO.setIntegerValue("count", FRIEND_ACTIVITY_FETCH_COUNT);
      diggsTO.setIntegerValue("count", FRIEND_ACTIVITY_FETCH_COUNT);

      if (null != aLastFetchTime) {
        submissionsTO.setIntegerValue("min_submit_date", aLastFetchTime);
        commentsTO.setIntegerValue("min_date", aLastFetchTime);
        diggsTO.setIntegerValue("min_date", aLastFetchTime);
      }

      // Friend submissions
      this._apiService.api.listUserFriendsSubmittedStories(
        submissionsTO,
        { handleLoad : function(aResult) {
            gsDiggEventManager._fetchNewEventsLoadHandler(
              aResult, aLoadHandler,
              Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_SUBMISSION);
          }
        },
        { handleError : function(aError) {
            gsDiggEventManager._fetchNewEventsLoadHandler(
              aError, aLoadHandler,
              Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_SUBMISSION);
          }
        });

      // Friend comments
      this._apiService.api.listUserFriendsCommentedStories(
        commentsTO,
        { handleLoad : function(aResult) {
            gsDiggEventManager._fetchNewEventsLoadHandler(
              aResult, aLoadHandler,
              Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_COMMENT);
          }
        },
        { handleError : function(aError) {
            gsDiggEventManager._fetchNewEventsLoadHandler(
              aError, aLoadHandler,
              Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_COMMENT);
          }
        });

      // Friend dugg
      this._apiService.api.listUserFriendsDuggStories(
        diggsTO,
        { handleLoad : function(aResult) {
            gsDiggEventManager._fetchNewEventsLoadHandler(
              aResult, aLoadHandler, Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_DIGG);
          }
        },
        { handleError : function(aError) {
            gsDiggEventManager._fetchNewEventsLoadHandler(
              aError, aLoadHandler, Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_DIGG);
          }
        });
      this._fetchEventCount += 3;
    }
  },

  /**
   * Fetches popular stores for the selected media types and topics from the
   * preferences.
   * @param aLastFetchTime The last time popular stories were fetched.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchPopularStoriesByContainer : function(aLastFetchTime, aLoadHandler) {
    this._logService.
      trace("gsDiggEventManager._fetchPopularStoriesByContainer");

    var mediaTypes = this._getSelectedMediaTypes();
    var containersString =
      this._prefService.getCharPref(PREF_KEY_CONTAINER_LIST);

    if (0 < mediaTypes.length && 0 < containersString.length) {
      var containerArray = containersString.split(",");

      var popularStoriesTO =
        Cc["@glaxstar.org/common/cm-transfer-object;1"].
          createInstance(Ci.gsICMTransferObject);

      popularStoriesTO.setStringValue("media", mediaTypes.toString());
      popularStoriesTO.setStringValue("sort", "promote_date-desc");
      if (null != aLastFetchTime) {
        popularStoriesTO.setIntegerValue("min_promote_date", aLastFetchTime);
      }

      for (var i = containerArray.length - 1; 0 <= i; i--) {
        popularStoriesTO.
          setStringValue("containerName", containerArray[i].replace(/"/g, ""));

        this._apiService.api.listPopularStoriesByContainer(
          popularStoriesTO,
          { handleLoad : function(aResult) {
              gsDiggEventManager._fetchNewEventsLoadHandler(
                aResult, aLoadHandler, Ci.gsIDiggEvent.EVENT_TYPE_STORY);
            }
          },
          { handleError : function(aError) {
              gsDiggEventManager._fetchNewEventsLoadHandler(
                aError, aLoadHandler, Ci.gsIDiggEvent.EVENT_TYPE_STORY);
            }
          });
        this._fetchEventCount++;
      }
    }
  },

  /**
   * Fetches popular stores for the selected media types and topics from the
   * preferences.
   * @param aLastFetchTime The last time popular stories were fetched.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchPopularStoriesByTopic : function(aLastFetchTime, aLoadHandler) {
    this._logService.trace("gsDiggEventManager._fetchPopularStoriesByTopic");

    var mediaTypes = this._getSelectedMediaTypes();
    var topicsString = this._prefService.getCharPref(PREF_KEY_TOPIC_LIST);

    if (0 < mediaTypes.length && 0 < topicsString.length) {
      var topicArray = topicsString.split(",");

      var popularStoriesTO =
        Cc["@glaxstar.org/common/cm-transfer-object;1"].
          createInstance(Ci.gsICMTransferObject);

      popularStoriesTO.setStringValue("media", mediaTypes.toString());
      popularStoriesTO.setStringValue("sort", "promote_date-desc");
      if (null != aLastFetchTime) {
        popularStoriesTO.setIntegerValue("min_promote_date", aLastFetchTime);
      }

      for (var i = topicArray.length - 1; 0 <= i; i--) {
        popularStoriesTO.
          setStringValue("topicName", topicArray[i].replace(/"/g, ""));

        this._apiService.api.listPopularStoriesByTopic(
          popularStoriesTO,
          { handleLoad : function(aResult) {
              gsDiggEventManager._fetchNewEventsLoadHandler(
                aResult, aLoadHandler, Ci.gsIDiggEvent.EVENT_TYPE_STORY);
            }
          },
          { handleError : function(aError) {
              gsDiggEventManager._fetchNewEventsLoadHandler(
                aError, aLoadHandler, Ci.gsIDiggEvent.EVENT_TYPE_STORY);
            }
          });
        this._fetchEventCount++;
      }
    }
  },

  /**
   * Obtains the array of user selected media types.
   */
  _getSelectedMediaTypes : function() {
    this._logService.trace("gsDiggEventManager._getSelectedMediaTypes");

    var mediaTypes = new Array();
    if (this._prefService.getBoolPref(PREF_KEY_NOTIFY_NEWS)) {
      mediaTypes.push(MEDIA_TYPE_NEWS);
    }
    if (this._prefService.getBoolPref(PREF_KEY_NOTIFY_VIDEOS)) {
      mediaTypes.push(MEDIA_TYPE_VIDEOS);
    }
    if (this._prefService.getBoolPref(PREF_KEY_NOTIFY_IMAGES)) {
      mediaTypes.push(MEDIA_TYPE_IMAGES);
    }

    return mediaTypes;
  },

  /**
   * Handles the response from the fetchNewEvents method. If the response
   * contains events they are stored. The load handler is used to notify the
   * caller regardless.
   * @param aResult The result transfer object returned by the server.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchNewEventsLoadHandler : function(aResult, aLoadHandler, aEventType) {
    this._logService.trace("gsDiggEventManager._fetchNewEventsLoadHandler");

    this._fetchEventCount--;

    try {
      if (aResult instanceof Ci.gsICMTransferObject &&
          !aResult.hasValue("error") &&
          aResult.hasValue("stories")) {

        this._setLastFetchTime(aResult.getIntegerValue("timestamp"));

        var storyDTO = null;
        var event = null;
        var storyArray = new Object();
        var storyCount = new Object();
        var storiesTO = aResult.getObjectValue("stories");
        storiesTO.getObjectArray(storyCount, storyArray);
        storyCount = storyCount.value;
        storyArray = storyArray.value;

        for (var i = storyCount - 1; 0 <= i; i--) {
          storyDTO =
            Cc["@glaxstar.org/digg/story-dto;1"].
              createInstance(Ci.gsIDiggStoryDTO);
          storyDTO.populateFromTO(storyArray[i]);

          if (Ci.gsIDiggEvent.EVENT_TYPE_FRIEND_COMMENT == aEventType) {

            // Fetch individual comments for each of the commented stories
            this._fetchComments(storyDTO, aLoadHandler);

          } else {
            event =
              Cc["@glaxstar.org/digg/event;1"].createInstance(Ci.gsIDiggEvent);
            event.populateFromStory(storyDTO, aEventType);

            if (this._eventDAO.insertEvent(event)) {
              this._thereWereNewEvents = true;
            }
          }
        }
      } else if (aResult.hasValue("message")) {
        this._logService.warn(
          "gsDiggMainService._fetchNewEventsLoadHandler: Error received: " +
          aResult.getStringValue("message"));
      }
    } catch (e) {
      this._logService.error(
        "gsDiggEventManager._fetchNewEventsLoadHandler: " + e);
    }

    if (this._fetchEventCount == 0) {
      var thereWereNewEvents =
        Cc["@mozilla.org/supports-PRBool;1"].
          createInstance(Ci.nsISupportsPRBool);
      thereWereNewEvents.data = this._thereWereNewEvents;

      aLoadHandler.handleLoad(1, [thereWereNewEvents]);
    }
  },

  /**
   * Fetches individual comments for each of the friends who commented on the
   * given story.
   * @param aStory The story to which friend users added comments.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchComments : function(aStoryDTO, aLoadHandler) {
    this._logService.trace("gsDiggEventManager._fetchComments");

    if (aStoryDTO.friends instanceof Ci.nsIArray) {

      var friendDTO;
      var friendEnu = aStoryDTO.friends.enumerate();
      var requestTO;

      while (friendEnu.hasMoreElements()) {

        friendDTO = friendEnu.getNext().QueryInterface(Ci.gsIDiggUserDTO);

        requestTO =
          Cc["@glaxstar.org/common/cm-transfer-object;1"].
            createInstance(Ci.gsICMTransferObject);
        requestTO.setStringValue("userName", friendDTO.userName);
        requestTO.setStringValue("sort", "date-desc");

        this._apiService.api.listUserComments(
          requestTO,
          { handleLoad : function(aResult) {
              gsDiggEventManager.
                _fetchCommentsLoadHandler(aResult, aStoryDTO, aLoadHandler);
            }
          },
          { handleError : function(aError) {
              gsDiggEventManager.
                _fetchCommentsLoadHandler(aError, aStoryDTO, aLoadHandler);
            }
          });
        this._fetchEventCount++;
      }
    }
  },

  /**
   * Handles the response from the fetch comments method. Comments that belong
   * to the given story are stored as events.
   * @param aResult The result transfer object returned by the server.
   * @param aStoryDTO The story used to retrieve the comments from.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchCommentsLoadHandler : function(aResult, aStoryDTO, aLoadHandler) {
    this._logService.trace("gsDiggEventManager._fetchCommentsLoadHandler");

    this._fetchEventCount--;

    try {
      if (aResult instanceof Ci.gsICMTransferObject &&
          !aResult.hasValue("error") &&
          aResult.hasValue("comments")) {

        this._setLastFetchTime(aResult.getIntegerValue("timestamp"));

        var commentDTO = null;
        var event = null;
        var commentArray = new Object();
        var commentCount = new Object();
        var commentsTO = aResult.getObjectValue("comments");
        commentsTO.getObjectArray(commentCount, commentArray);
        commentCount = commentCount.value;
        commentArray = commentArray.value;

        for (var i = commentCount - 1; 0 <= i; i--) {
          commentDTO =
            Cc["@glaxstar.org/digg/comment-dto;1"].
              createInstance(Ci.gsIDiggCommentDTO);
          commentDTO.populateFromTO(commentArray[i]);

          if (commentDTO.storyId == aStoryDTO.storyId) {
            event =
              Cc["@glaxstar.org/digg/event;1"].createInstance(Ci.gsIDiggEvent);
            event.populateFromStoryComment(aStoryDTO, commentDTO);

            if (this._eventDAO.insertEvent(event)) {
              this._thereWereNewEvents = true;
            }
          }
        }
      } else if (aResult.hasValue("message")) {
        this._logService.warn(
          "gsDiggMainService._fetchCommentsLoadHandler: Error received: " +
          aResult.getStringValue("message"));
      }
    } catch (e) {
      this._logService.error(
        "gsDiggEventManager._fetchCommentsLoadHandler: " + e);
    }

    if (this._fetchEventCount == 0) {
      var thereWereNewEvents =
        Cc["@mozilla.org/supports-PRBool;1"].
          createInstance(Ci.nsISupportsPRBool);
      thereWereNewEvents.data = this._thereWereNewEvents;

      aLoadHandler.handleLoad(1, [thereWereNewEvents]);
    }
  },

  /**
   * Fetches administration messages.
   * @param aLastFetchTime The last time admin messages were fetched.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchAdminMessages : function(aLastFetchTime, aLoadHandler) {
    this._logService.trace("gsDiggEventManager._fetchAdminMessages");

    var adminMessagesTO =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);

    if (null != aLastFetchTime) {
      adminMessagesTO.setIntegerValue("min_date", aLastFetchTime);
    }

    this._apiService.api.getAdminMessages(
      adminMessagesTO,
      { handleLoad : function(aResult) {
          gsDiggEventManager.
            _fetchAdminMessagesLoadHandler(aResult, aLoadHandler);
        }
      },
      { handleError : function(aError) {
          gsDiggEventManager.
            _fetchAdminMessagesLoadHandler(aError, aLoadHandler);
        }
      });

    this._fetchEventCount++;
  },

  /**
   * Handles the response from the fetchAdminMessages method. If the response
   * contains messages they are stored as events. The load handler is used to
   * notify the caller regardless.
   * @param aResult The result transfer object returned by the server.
   * @param aLoadHandler The caller's load handler.
   */
  _fetchAdminMessagesLoadHandler : function(aResult, aLoadHandler) {
    this._logService.
      trace("gsDiggEventManager._fetchAdminMessagesLoadHandler");

    this._fetchEventCount--;

    try {
      if (aResult instanceof Ci.gsICMTransferObject &&
          !aResult.hasValue("error") &&
          aResult.hasValue("messages")) {

        this._setLastFetchTime(aResult.getIntegerValue("timestamp"));

        var messageDTO = null;
        var event = null;
        var messageArray = new Object();
        var messageCount = new Object();
        var messagesTO = aResult.getObjectValue("messages");
        messagesTO.getObjectArray(messageCount, messageArray);
        messageCount = messageCount.value;
        messageArray = messageArray.value;

        for (var i = messageCount - 1; 0 <= i; i--) {
          messageDTO =
            Cc["@glaxstar.org/digg/admin-message-dto;1"].
              createInstance(Ci.gsIDiggAdminMessageDTO);
          messageDTO.populateFromTO(messageArray[i]);

          event =
            Cc["@glaxstar.org/digg/event;1"].createInstance(Ci.gsIDiggEvent);
          event.populateFromAdminMessage(messageDTO);

          if (this._eventDAO.insertEvent(event)) {
            this._thereWereNewEvents = true;
          }
        }
      } else {
        if (aResult.hasValue("message")) {
          this._logService.warn(
            "gsDiggMainService._fetchAdminMessagesLoadHandler: " +
            "Error received: " + aResult.getStringValue("message"));
        }
      }
    } catch (e) {
      this._logService.error(
        "gsDiggEventManager._fetchAdminMessagesLoadHandler: " + e);
    }

    if (this._fetchEventCount == 0) {
      var thereWereNewEvents =
        Cc["@mozilla.org/supports-PRBool;1"].
          createInstance(Ci.nsISupportsPRBool);
      thereWereNewEvents.data = this._thereWereNewEvents;

      aLoadHandler.handleLoad(1, [thereWereNewEvents]);
    }
  },

  /**
   * Gets the event at the given index.
   * @param aIndex The index of the event to get. If null, zero is assumed.
   * @return An event object. Null if there isn't any.
   */
  getEventAtIndex : function(aIndex) {
    this._logService.debug("gsDiggEventManager.getEventAtIndex");

    var event = null;
    var eventCount = this._eventDAO.getEventCount();

    if (eventCount > 0) {

      if (null == aIndex) {
        aIndex = 0;
      }

      while (0 > aIndex) {
        aIndex += eventCount;
      }
      while (eventCount <= aIndex) {
        aIndex -= eventCount;
      }

      event = this._eventDAO.getEventAtIndex(aIndex);
    }

    return event;
  },

  /**
   * Obtains the current number of available events.
   * @return The number of events.
   */
  getEventCount : function() {
    this._logService.debug("gsDiggEventManager.getEventCount");
    return this._eventDAO.getEventCount();
  },

  /**
   * Clears (deletes) all the stored events and resets the last fetch time
   * preference.
   */
  _clearEvents : function() {
    this._logService.trace("gsDiggEventManager._clearEvents");

    this._setLastFetchTime(0);
    this._eventDAO.clearEvents();
    this._notifyEventCountObservers();
  },

  /**
   * Sends a notification to the observers of the event count value.
   */
  _notifyEventCountObservers : function() {
    this._logService.trace("gsDiggEventManager._notifyEventCountObservers");

    this._observerService.notifyObservers(null,
      this.OBSERVER_TOPIC_EVENT_COUNT_CHANGED,
      this.getEventCount());
  },

  /**
   * Observes changes in the notifications preferences.
   * @param aSubject The object that experienced the change.
   * @param aTopic The topic being observed.
   * @param aData The data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logService.debug("gsDiggEventManager.observe");

    switch (String(aData)) {
      case PREF_KEY_USER_NAME:
      case PREF_KEY_NOTIFY_FRIENDS_ACTIVITY:
      case PREF_KEY_NOTIFY_NEWS:
      case PREF_KEY_NOTIFY_VIDEOS:
      case PREF_KEY_NOTIFY_IMAGES:
      case PREF_KEY_TOPIC_LIST:
      case PREF_KEY_CONTAINER_LIST:

        this._clearEvents();
        break;
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggEventManager) &&
        !aIID.equals(Ci.gsICMLoadHandler) &&
        !aIID.equals(Ci.gsICMErrorHandler) && !aIID.equals(Ci.nsISupports)) {
      throw(Cr.NS_ERROR_NO_INTERFACE);
    }

    return this;
  }
};

/**
 * The nsIFactory interface allows for the creation of nsISupports derived
 * classes without specifying a concrete class type.
 * More: http://developer.mozilla.org/en/docs/nsIFactory
 */
var gsDiggEventManagerFactory = {
  /* single instance of the component. */
  _singletonObj: null,

  /**
   * Creates an instance of the class associated with this factory.
   * @param aOuter pointer to a component that wishes to be aggregated in the
   * resulting instance. This can be nsnull if no aggregation is requested.
   * @param aIID the interface type to be returned.
   * @return the resulting interface pointer.
   * @throws NS_ERROR_NO_AGGREGATION if aOuter is not null. This component
   * doesn't support aggregation.
   */
  createInstance: function(aOuter, aIID) {
    if (aOuter != null) {
      throw(Cr.NS_ERROR_NO_AGGREGATION);
    }
    // in this case we need a unique instance of the service.
    if (!this._singletonObj) {
      this._singletonObj = gsDiggEventManager;
      gsDiggEventManager._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggEventManagerModule = {
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
      throw(Cr.NS_ERROR_NOT_IMPLEMENTED);
    }

    if (aClass.equals(CLASS_ID)) {
      return gsDiggEventManagerFactory;
    }

    throw(Cr.NS_ERROR_NO_INTERFACE);
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
  return gsDiggEventManagerModule;
}
