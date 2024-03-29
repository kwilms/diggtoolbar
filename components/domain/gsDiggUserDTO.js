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
const CLASS_ID = Components.ID("{47C77E8D-A00E-4F72-8767-FFC533A485D3}");
const CLASS_NAME = "User DTO";
const CONTRACT_ID = "@glaxstar.org/digg/user-dto;1";

/**
 * User DTO
 * Stores user info
 */
function gsDiggUserDTO() {
  this._init();
}

gsDiggUserDTO.prototype = {

  /* User name */
  _userName : null,
  /* User icon */
  _icon : null,
  /* Registration date */
  _registered : null,
  /* User profile views */
  _profileViews : null,
  /* Date of the event (digg, comment) related with this user */
  _eventDate : null,

  /* Log service */
  _logService : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggUserDTO.init");
  },

  /**
   * Returns the user name.
   * @return user name
   */
  get userName() {
    this._logService.debug("gsDiggUserDTO.userName[get]");
    return this._userName;
  },

  /**
   * Sets the user name.
   * @param aValue user name
   */
  set userName(aValue) {
    this._logService.debug("gsDiggUserDTO.userName[set]");
    this._userName = aValue;
  },

  /**
   * Returns the user icon.
   * @return user icon
   */
  get icon() {
    this._logService.debug("gsDiggUserDTO.icon[get]");
    return this._icon;
  },

  /**
   * Sets the user icon.
   * @param aValue user icon
   */
  set icon(aValue) {
    this._logService.debug("gsDiggUserDTO.icon[set]");
    this._icon = aValue;
  },

  /**
   * Returns the user registered.
   * @return user registered
   */
  get registered() {
    this._logService.debug("gsDiggUserDTO.registered[get]");
    return this._registered;
  },

  /**
   * Sets the user registered.
   * @param aValue user registered
   */
  set registered(aValue) {
    this._logService.debug("gsDiggUserDTO.registered[set]");
    this._registered = aValue;
  },

  /**
   * Returns the user profile views.
   * @return user profile views
   */
  get profileViews() {
    this._logService.debug("gsDiggUserDTO.profileViews[get]");
    return this._profileViews;
  },

  /**
   * Sets the user profile views.
   * @param aValue user profile views
   */
  set profileViews(aValue) {
    this._logService.debug("gsDiggUserDTO.profileViews[set]");
    this._profileViews = aValue;
  },

  /**
   * Returns the event (digg, comment) date related with this user.
   * @return The event date.
   */
  get eventDate() {
    this._logService.debug("gsDiggUserDTO.eventDate[get]");
    return this._eventDate;
  },

  /**
   * Sets the event (digg, comment) date related with this user.
   * @return The event date.
   */
  set eventDate(aValue) {
    this._logService.debug("gsDiggUserDTO.eventDate[set]");
    this._eventDate = aValue;
  },

  /**
   * Populates the userDTO with the information contained in the
   * gsICMTransferObject.
   * @param aCMTransferObject the transfer object to extract the user data.
   */
  populateFromTO : function(aCMTransferObject) {
    this._logService.debug("gsDiggUserDTO.populateFromTO");

    if (null != aCMTransferObject) {
      // user name
      this.userName = aCMTransferObject.getStringValue("name");
      // user icon
      if (aCMTransferObject.hasValue("icon")) {
        this.icon = aCMTransferObject.getStringValue("icon");
      }
      // registration date
      if (aCMTransferObject.hasValue("registered")) {
        this.registered = aCMTransferObject.getIntegerValue("registered");
      }
      // user profile views
      if (aCMTransferObject.hasValue("profileviews")) {
        this.profileViews = aCMTransferObject.getIntegerValue("profileviews");
      }
      // event date related with the user
      if (aCMTransferObject.hasValue("date")) {
        this.eventDate = aCMTransferObject.getIntegerValue("date");
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
    if (!aIID.equals(Ci.gsIDiggUserDTO) &&
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
var gsDiggUserDTOFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsDiggUserDTO()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggUserDTOModule = {
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
      return gsDiggUserDTOFactory;
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
  return gsDiggUserDTOModule;
}
