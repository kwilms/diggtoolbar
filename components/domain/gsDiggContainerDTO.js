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
const CLASS_ID = Components.ID("{7B785A70-3B84-41CE-888C-E86301D137E5}");
const CLASS_NAME = "Container DTO";
const CONTRACT_ID = "@glaxstar.org/digg/container-dto;1";

// Mutable array constructor
const NSArray =
  new Components.Constructor("@mozilla.org/array;1", Ci.nsIMutableArray);

/**
 * Container DTO
 * Stores container info
 */
function gsDiggContainerDTO() {
  this._init();
}

gsDiggContainerDTO.prototype = {

  /* Container name */
  _name : null,
  /* Container short name */
  _shortName : null,
  /* Container topics */
  _topics : null,

  /* Log service */
  _logService : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggContainerDTO.init");
  },

  /**
   * Returns the container name.
   * @return container name
   */
  get name() {
    this._logService.debug("gsDiggContainerDTO.name[get]");
    return this._name;
  },

  /**
   * Sets the container name.
   * @param aValue container name
   */
  set name(aValue) {
    this._logService.debug("gsDiggContainerDTO.name[set]");
    this._name = aValue;
  },

  /**
   * Returns the container short name.
   * @return container short name
   */
  get shortName() {
    this._logService.debug("gsDiggContainerDTO.shortName[get]");
    return this._shortName;
  },

  /**
   * Sets the container short name.
   * @param aValue container short name
   */
  set shortName(aValue) {
    this._logService.debug("gsDiggContainerDTO.shortName[set]");
    this._shortName = aValue;
  },

  /**
   * Returns the container topics.
   * @return container topics
   */
  get topics() {
    this._logService.debug("gsDiggContainerDTO.topics[get]");
    return this._topics;
  },

  /**
   * Sets the container topics.
   * @param aValue container topics
   */
  set topics(aValue) {
    this._logService.debug("gsDiggContainerDTO.topics[set]");
    this._topics = aValue;
  },

  /**
   * Populates the containerDTO with the information contained in the
   * gsICMTransferObject.
   * @param aCMTransferObject the transfer object to extract the container data.
   */
  populateFromTO : function(aCMTransferObject) {
    this._logService.debug("gsDiggContainerDTO.populateFromTO");

    if (null != aCMTransferObject) {
      // container name
      this.name = aCMTransferObject.getStringValue("name");
      // container short name
      if (aCMTransferObject.hasValue("short_name")) {
        this.shortName = aCMTransferObject.getStringValue("short_name");
      }
      // container topics
      if (aCMTransferObject.hasValue("topics")) {
        var topicDTO = null;
        var topicDTOList = new NSArray();
        var topicsArray = new Object();
        var topicsArrayCount = new Object();
        var topicsArrayValue = null;
        var topicsObject = aCMTransferObject.getObjectValue("topics");

        topicsObject.getObjectArray(topicsArrayCount, topicsArray);
        topicsArrayValue = topicsArray.value;

        for (var i = 0; i < topicsArrayCount.value; i++) {
          topicDTO =
            Cc["@glaxstar.org/digg/topic-dto;1"].
              createInstance(Ci.gsIDiggTopicDTO);
          topicDTO.populateFromTO(topicsArrayValue[i]);

          topicDTOList.appendElement(topicDTO, false);
        }

        this.topics = topicDTOList;
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
    if (!aIID.equals(Ci.gsIDiggContainerDTO) &&
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
var gsDiggContainerDTOFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsDiggContainerDTO()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggContainerDTOModule = {
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
      return gsDiggContainerDTOFactory;
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
  return gsDiggContainerDTOModule;
}
