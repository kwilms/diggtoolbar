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
const CLASS_ID = Components.ID("{F1832925-252B-4705-911C-88CC4478C728}");
const CLASS_NAME = "Administration Message DTO";
const CONTRACT_ID = "@glaxstar.org/digg/admin-message-dto;1";

/**
 * AdminMessageDTO. Stores the information of an administration message.
 */
function gsDiggAdminMessageDTO() {
  this._init();
}

gsDiggAdminMessageDTO.prototype = {

  /* Id of the message */
  _messageId : null,
  /* Date of the message */
  _date : null,
  /* Title of the message */
  _title : null,
  /* Description of the message */
  _description : null,
  /* Target URL of the message */
  _url : null,

  /* Log service */
  _logService : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggAdminMessageDTO.init");
  },

  /**
   * Gets the id of the message.
   * @return The id of the message.
   */
  get messageId() {
    this._logService.debug("gsDiggAdminMessageDTO.messageId[get]");
    return this._messageId;
  },

  /**
   * Sets the id of the message.
   * @param aValue The new id value for the message.
   */
  set messageId(aValue) {
    this._logService.debug("gsDiggAdminMessageDTO.messageId[set]");
    this._messageId = aValue;
  },

  /**
   * Gets the date of the message.
   * @return The date of the message.
   */
  get date() {
    this._logService.debug("gsDiggAdminMessageDTO.date[get]");
    return this._date;
  },

  /**
   * Sets the date of the message.
   * @param aValue The new date value for the message.
   */
  set date(aValue) {
    this._logService.debug("gsDiggAdminMessageDTO.date[set]");
    this._date = aValue;
  },

  /**
   * Gets the title of the message.
   * @return The title of the message.
   */
  get title() {
    this._logService.debug("gsDiggAdminMessageDTO.title[get]");
    return this._title;
  },

  /**
   * Sets the title of the message.
   * @param aValue The new title value for the message.
   */
  set title(aValue) {
    this._logService.debug("gsDiggAdminMessageDTO.title[set]");
    this._title = aValue;
  },

  /**
   * Gets the description of the message.
   * @return The description of the message.
   */
  get description() {
    this._logService.debug("gsDiggAdminMessageDTO.description[get]");
    return this._description;
  },

  /**
   * Sets the description of the message.
   * @param aValue The new description value for the message.
   */
  set description(aValue) {
    this._logService.debug("gsDiggAdminMessageDTO.description[set]");
    this._description = aValue;
  },

  /**
   * Gets the target URL of the message.
   * @return The target URL of the message.
   */
  get url() {
    this._logService.debug("gsDiggAdminMessageDTO.url[get]");
    return this._url;
  },

  /**
   * Sets the target URL of the message.
   * @param aValue The new target URL value for the message.
   */
  set url(aValue) {
    this._logService.debug("gsDiggAdminMessageDTO.url[set]");
    this._url = aValue;
  },

  /**
   * Populates the AdminMessageDTO with the information contained in the
   * gsICMTransferObject.
   * @param aCMTransferObject The transfer object from which to extract the
   * message data.
   */
  populateFromTO : function(aCMTransferObject) {
    this._logService.debug("gsDiggAdminMessageDTO.populateFromTO");

    if (null != aCMTransferObject) {

      // XXX: The server does not return an Id for these messages so we it to
      // the current time.
      var now = ((new Date()).getTime() / 1000);
      this.messageId = now;

      if (aCMTransferObject.hasValue("date")) {
        this.date = aCMTransferObject.getIntegerValue("date");
      }
      if (aCMTransferObject.hasValue("title")) {
        this.title = aCMTransferObject.getStringValue("title");
      }
      if (aCMTransferObject.hasValue("content")) {
        this.description = aCMTransferObject.getStringValue("content");
      }
      if (aCMTransferObject.hasValue("url")) {
        this.url = aCMTransferObject.getStringValue("url");
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
    if (!aIID.equals(Ci.gsIDiggAdminMessageDTO) &&
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
var gsDiggAdminMessageDTOFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsDiggAdminMessageDTO()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggAdminMessageDTOModule = {
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
      return gsDiggAdminMessageDTOFactory;
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
  return gsDiggAdminMessageDTOModule;
}
