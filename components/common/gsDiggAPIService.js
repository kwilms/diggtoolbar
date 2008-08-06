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
const CLASS_ID = Components.ID("{8447dcf0-f6c3-11dc-95ff-0800200c9a66}");
const CLASS_NAME = "Digg API Service";
const CONTRACT_ID = "@glaxstar.org/digg/api-service;1";

// The name of the type fixed parameter.
const FIXED_API_PARAM_TYPE_NAME = "type";
// The value of the type fixed parameter.
const FIXED_API_PARAM_TYPE_VALUE = "json";
// The name of the appkey fixed parameter.
const FIXED_API_PARAM_APPKEY_NAME = "appkey";
// The value of the appkey fixed parameter.
const FIXED_API_PARAM_APPKEY_VALUE = "http://digg.com/tools/firefox?v=1.0";

// The Digg API manifest
const MANIFEST = '{'
  + ' "methods": ['
  + '  {"mnemonic": "LIST_CONTAINERS",'
  + '   "entry_point": "/containers",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_CONTAINER",'
  + '   "entry_point": "/container/{containerShortName}",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_ERRORS",'
  + '   "entry_point": "/errors",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_ERROR",'
  + '   "entry_point": "/error/{errorCode}",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_GALLERY_PHOTOS",'
  + '   "entry_point": "/galleryphotos/{photoIdList}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_GALLERY_PHOTOS_COMMENTS",'
  + '   "entry_point": "/galleryphotos/{photoIdList}/comments",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "GET_GALLERY_PHOTO",'
  + '   "entry_point": "/galleryphoto/{photoId}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_GALLERY_PHOTO_COMMENTS",'
  + '   "entry_point": "/galleryphoto/{photoId}/comments",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_GALLERY_PHOTO_COMMENT",'
  + '   "entry_point": "/galleryphoto/{photoId}/comment/{commentId}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_GALLERY_PHOTO_COMMENT_REPLIES",'
  + '   "entry_point": "/galleryphoto/{photoId}/comment/{commentId}/replies",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_MEDIA",'
  + '   "entry_point": "/media",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_MEDIUM",'
  + '   "entry_point": "/medium/{mediumShortName}",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_STORIES",'
  + '   "entry_point": "/stories/{storyIdList}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_STORIES_COMMENTS",'
  + '   "entry_point": "/stories/{storyIdList}/comments",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_STORIES_DIGGS",'
  + '   "entry_point": "/stories/{storyIdList}/diggs",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_STORIES_BY_CONTAINER",'
  + '   "entry_point": "/stories/container/{containerName}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_STORIES_BY_TOPIC",'
  + '   "entry_point": "/stories/topic/{topicName}",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_HOT_STORIES",'
  + '   "entry_point": "/stories/hot",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_HOT_STORIES_BY_CONTAINER",'
  + '   "entry_point": "/stories/container/{containerName}/hot",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_HOT_STORIES_BY_TOPIC",'
  + '   "entry_point": "/stories/topic/{topicName}/hot",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_TOP_STORIES",'
  + '   "entry_point": "/stories/top",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_TOP_STORIES_BY_CONTAINER",'
  + '   "entry_point": "/stories/container/{containerName}/top",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_TOP_STORIES_BY_TOPIC",'
  + '   "entry_point": "/stories/topic/{topicName}/top",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_POPULAR_STORIES",'
  + '   "entry_point": "/stories/popular",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_POPULAR_STORIES_COMMENTS",'
  + '   "entry_point": "/stories/popular/comments",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_POPULAR_STORIES_DIGGS",'
  + '   "entry_point": "/stories/popular/diggs",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_POPULAR_STORIES_BY_CONTAINER",'
  + '   "entry_point": "/stories/container/{containerName}/popular",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_POPULAR_STORIES_BY_TOPIC",'
  + '   "entry_point": "/stories/topic/{topicName}/popular",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_UPCOMING_STORIES",'
  + '   "entry_point": "/stories/upcoming",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_UPCOMING_STORIES_COMMENTS",'
  + '   "entry_point": "/stories/upcoming/comments",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_UPCOMING_STORIES_DIGGS",'
  + '   "entry_point": "/stories/upcoming/diggs",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_UPCOMING_STORIES_BY_CONTAINER",'
  + '   "entry_point": "/stories/container/{containerName}/upcoming",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_UPCOMING_STORIES_BY_TOPIC",'
  + '   "entry_point": "/stories/topic/{topicName}/upcoming",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "GET_STORY",'
  + '   "entry_point": "/story/{storyId}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_STORY_COMMENTS",'
  + '   "entry_point": "/story/{storyId}/comments",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_STORY_DIGGS",'
  + '   "entry_point": "/story/{storyId}/diggs",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_STORY_COMMENT",'
  + '   "entry_point": "/story/{storyId}/comment/{commentId}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_STORY_COMMENT_REPLIES",'
  + '   "entry_point": "/story/{storyId}/comment/{commentId}/replies",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_STORY_USER_DIGG",'
  + '   "entry_point": "/story/{storyId}/user/{userName}/digg",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_TOPICS",'
  + '   "entry_point": "/topics",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_USERS",'
  + '   "entry_point": "/users",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USERS_COMMENTS",'
  + '   "entry_point": "/users/{userNameList}/comments",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USERS_DIGGS",'
  + '   "entry_point": "/users/{userNameList}/diggs",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "GET_USER",'
  + '   "entry_point": "/user/{userName}",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_USER_COMMENTS",'
  + '   "entry_point": "/user/{userName}/comments",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_DIGGS",'
  + '   "entry_point": "/user/{userName}/diggs",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_COMMENTED_STORIES",'
  + '   "entry_point": "/user/{userName}/commented",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_DUGG_STORIES",'
  + '   "entry_point": "/user/{userName}/dugg",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_POPULAR_STORIES",'
  + '   "entry_point": "/user/{userName}/popular",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_SUBMITTED_STORIES",'
  + '   "entry_point": "/user/{userName}/submissions",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_UPCOMING_STORIES",'
  + '   "entry_point": "/user/{userName}/upcoming",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "LIST_USER_FANS",'
  + '   "entry_point": "/user/{userName}/fans",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_USER_FAN",'
  + '   "entry_point": "/user/{userName}/fan/{fanUserName}",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "GET_USER_FRIEND",'
  + '   "entry_point": "/user/{userName}/friend/{friendUserName}",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_FRIENDS",'
  + '   "entry_point": "/user/{userName}/friends",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_FRIENDS_COMMENTED_STORIES",'
  + '   "entry_point": "/user/{userName}/friends/commented",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_FRIENDS_DUGG_STORIES",'
  + '   "entry_point": "/user/{userName}/friends/dugg",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_FRIENDS_POPULAR_STORIES",'
  + '   "entry_point": "/user/{userName}/friends/popular",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_FRIENDS_SUBMITTED_STORIES",'
  + '   "entry_point": "/user/{userName}/friends/submissions",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "LIST_USER_FRIENDS_UPCOMING_STORIES",'
  + '   "entry_point": "/user/{userName}/friends/upcoming",'
  + '   "method": "GET", "protocol": "http://"},'

  + '  {"mnemonic": "GET_THROTTLE",'
  + '   "entry_point": "/throttle",'
  + '   "method": "GET", "protocol": "http://"},'
  + '  {"mnemonic": "GET_ADMIN_MESSAGES",'
  + '   "entry_point": "/messages",'
  + '   "method": "GET", "protocol": "http://"}'
  + '],'
  + '"domains" : ['
  + '  {"hostname": "digg.com/tools/services\?endPoint="}'
  + ']'
  + '}';

/**
 * API service. Initializes and holds the only instance of the Digg API object.
 */
var gsDiggAPIService = {

  /* Log service */
  _logService : null,
  /* Common communication service */
  _commService : null,
  /* Observer service */
  _observerService : null,

  /* The Digg API object */
  _api : null,
  /* The last registered exception when trying to initialize the API object */
  _lastException : null,

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("gsDiggAPIService._init");

    this._commService =
      Cc["@glaxstar.org/common/communication-service;1"].
        getService(Ci.gsICommunicationService);
    this._observerService =
      Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
  },

  /**
   * Initializes the service with the server manifest.
   * @return true if the object was properly initialized, false otherwise.
   * @throws Exception if an unexpected error occurs.
   */
  initialize : function() {
    this._logService.debug("gsDiggAPIService.initialize");

    var manifestTranObject =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);
    var manifestObj =
      Cc["@glaxstar.org/common/cm-manifest;1"].createInstance(Ci.gsICMManifest);

    manifestTranObject.fromJSON(MANIFEST, "http://www.digg.com");
    manifestTranObject = this._appendFixedParameters(manifestTranObject);

    manifestObj.initialize(manifestTranObject);
    this._api = this._commService.implementManifest(manifestObj);

    this._observerService.notifyObservers(
      null, this.OBSERVER_TOPIC_API_CONNECTED, true);
  },

  /**
   * Returns the Digg API object.
   * @return the Digg API object.
   * @throws Exception if the object hasn't been initialized properly yet.
   */
  get api() {
    this._logService.debug("gsDiggAPIService.api[get]");

    var api = null;

    if (null != this._api) {
      api = this._api;

    } else if (null != this._lastException) {
      this._logService.error(
        "gsDiggAPIService._handleManifestLoad. The API object " +
        "was requested after an error occurred.");
      throw(this._lastException);

    } else {
      this._logService.error(
        "gsDiggAPIService._handleManifestLoad. The API object " +
        "was requested before it was initialized.");
      throw Ce("The object has not been initialized yet.");
    }

    return api;
  },

  /**
   * Returns the observer topic used to notify if the API service connected
   * properly.
   * @return the observer topic used to notify if the API service connected
   * properly.
   */
  get OBSERVER_TOPIC_API_CONNECTED() {
    this._logService.
      debug("gsDiggAPIService.OBSERVER_TOPIC_API_CONNECTED[get]");

    return "gs-digg-api-connected";
  },

  /**
   * Appends the array of fixed API parameters to the manifest transfer object.
   * @param aTransferObject The manifest transfer object.
   * @return The modified manifest transfer object.
   */
  _appendFixedParameters : function(aTransferObject) {
    this._logService.trace("gsDiggAPIService._appendFixedParameters");

    var paramsTO =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);
    var paramArray = new Array();
    var paramTO = null;

    // Digg requires the following parameters on every call:
    // type=json
    paramTO =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);
    paramTO.setStringValue("name", FIXED_API_PARAM_TYPE_NAME);
    paramTO.setStringValue("value", FIXED_API_PARAM_TYPE_VALUE);
    paramArray.push(paramTO);
    // appkey=our appkey
    paramTO =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);
    paramTO.setStringValue("name", FIXED_API_PARAM_APPKEY_NAME);
    paramTO.setStringValue("value", FIXED_API_PARAM_APPKEY_VALUE);
    paramArray.push(paramTO);

    paramsTO.setObjectArray(paramArray.length, paramArray);
    aTransferObject.setObjectValue("fixed_parameters", paramsTO);

    return aTransferObject;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggAPIService) &&
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
var gsDiggAPIServiceFactory = {
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
      this._singletonObj = gsDiggAPIService;
      gsDiggAPIService._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggAPIServiceModule = {
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
      return gsDiggAPIServiceFactory;
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
  return gsDiggAPIServiceModule;
}
