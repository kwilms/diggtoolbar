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
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{72cd3060-1162-11dd-bd0b-0800200c9a66}");
const CLASS_NAME = "Digg Main Service";
const CONTRACT_ID = "@glaxstar.org/digg/main-service;1";

// Mutable array constructor
const NSArray =
  new Components.Constructor("@mozilla.org/array;1", Ci.nsIMutableArray);

/**
 * Main Digg service. Performs basic actions using the Digg API.
 */
var gsDiggMainService = {

  /* Log service */
  _logService : null,
  /* Digg API service */
  _apiService : null,
  /* Utility service */
  _utilityService : null,
  /* Encryption service */
  _encryptionService : null,

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("gsDiggMainService._init");

    this._apiService =
      Cc["@glaxstar.org/digg/api-service;1"].getService(Ci.gsIDiggAPIService);
    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;2"].
        getService(Ci.gsIUtilityService);
    this._encryptionService =
      Cc["@glaxstar.org/common/encryption-service;2"].
        getService(Ci.gsIEncryptionService);
  },

  /**
   * Gets a story object from a result from the API. If more than one story is
   * contained in the result, the one with the highest Digg count is chosen.
   * @param aResult The API result element.
   * @return The story DTO, NULL if none found.
   */
  _getStoryDTOFromResult : function(aResult) {
    this._logService.trace("gsDiggMainService._getStoryDTOFromResult");

    var bestStory = null;
    var storyDTO = null;
    var storyArray = new Object();
    var storyCount = new Object();
    var storiesTO = aResult.getObjectValue("stories");

    storiesTO.getObjectArray(storyCount, storyArray);

    for (var i = storyCount.value - 1; 0 <= i; i--) {
      storyDTO =
        Cc["@glaxstar.org/digg/story-dto;1"].
          createInstance(Ci.gsIDiggStoryDTO);
      storyDTO.populateFromTO(storyArray.value[i]);

      if (null == bestStory || bestStory.diggs < storyDTO.diggs) {
        bestStory = storyDTO;
      }
    }

    return bestStory;
  },

  /**
   * Gets a story object from its link URL using the API.
   * @param aURL The URL used to obtain the story.
   * @param aLoadHandler The caller's load handler.
   */
  getStoryByURL : function(aURL, aLoadHandler) {
    this._logService.debug("gsDiggMainService.getStoryByURL");

    if (this._utilityService.isNullOrEmpty(aURL)) {
      throw Ce("gsDiggMainService.getStoryByURL: aURL is null or empty");
    }

    var tranObject =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);

    tranObject.setStringValue(
      "linkhash", this._encryptionService.hashMD5Hex(aURL));

    this._apiService.api.listStories(
      tranObject,
      { handleLoad : function(aResult) {
          gsDiggMainService._getStoryByURLLoadHandler(aResult, aLoadHandler);
        }
      },
      { handleError : function(aError) {
          gsDiggMainService._getStoryByURLLoadHandler(aError, aLoadHandler);
        }
      });
  },

  /**
   * Handles the response from the getStoryByURL method.
   * @param aResult The result transfer object returned by the server.
   * @param aLoadHandler The caller's load handler.
   */
  _getStoryByURLLoadHandler : function(aResult, aLoadHandler) {
    this._logService.trace("gsDiggMainService._getStoryByURLLoadHandler");

    try {
      if (aResult instanceof Ci.gsICMTransferObject &&
          !aResult.hasValue("error") &&
          aResult.hasValue("stories")) {

        var storyDTO = this._getStoryDTOFromResult(aResult);

        if (null != storyDTO) {
          aLoadHandler.handleLoad(1, [storyDTO]);
        } else {
          aLoadHandler.handleLoad(null, null);
        }
      } else {
        if (aResult.hasValue("message")) {
          this._logService.warn(
            "gsDiggMainService._getStoryByURLLoadHandler: Error received: " +
            aResult.getStringValue("message"));
        }
        aLoadHandler.handleLoad(null, null);
      }
    } catch (e) {
      this._logService.error(
        "gsDiggMainService._getStoryByURLLoadHandler: " + e);
      aLoadHandler.handleLoad(null, null);
    }
  },

  /**
   * Gets a story object from its link title using the API.
   * @param aTitle The clean title used to obtain the story.
   * @param aLoadHandler The caller's load handler.
   */
  getStoryByTitle : function(aTitle, aLoadHandler) {
    this._logService.debug("gsDiggMainService.getStoryByTitle");

    if (this._utilityService.isNullOrEmpty(aTitle)) {
      throw Ce("gsDiggMainService.getStoryByTitle: aTitle is null or empty");
    }

    var tranObject =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);

    tranObject.setStringValue("storyId", aTitle);

    this._apiService.api.getStory(
      tranObject,
      { handleLoad : function(aResult) {
          gsDiggMainService._getStoryByTitleLoadHandler(aResult, aLoadHandler);
        }
      },
      { handleError : function(aError) {
          gsDiggMainService._getStoryByTitleLoadHandler(aError, aLoadHandler);
        }
      });
  },

  /**
   * Handles the response from the getStoryByTitle method.
   * @param aResult The result transfer object returned by the server.
   * @param aLoadHandler The caller's load handler.
   */
  _getStoryByTitleLoadHandler : function(aResult, aLoadHandler) {
    this._logService.trace("gsDiggMainService._getStoryByTitleLoadHandler");

    try {
      if (aResult instanceof Ci.gsICMTransferObject &&
          !aResult.hasValue("error") &&
          aResult.hasValue("stories")) {

        var storyDTO = this._getStoryDTOFromResult(aResult);

        if (null != storyDTO) {
          aLoadHandler.handleLoad(1, [storyDTO]);
        } else {
          aLoadHandler.handleLoad(null, null);
        }
      } else {
        if (aResult.hasValue("message")) {
          this._logService.warn(
            "gsDiggMainService._getStoryByTitleLoadHandler: Error received: " +
            aResult.getStringValue("message"));
        }
        aLoadHandler.handleLoad(null, null);
      }
    } catch (e) {
      this._logService.error(
        "gsDiggMainService._getStoryByTitleLoadHandler: " + e);
      aLoadHandler.handleLoad(null, null);
    }
  },

  /**
   * Obtains the array of containers, each containing an array of topics inside.
   * @param aLoadHandler The caller's load handler.
   */
  listContainers : function(aLoadHandler) {
    this._logService.debug("gsDiggMainService.listContainers");

    this._apiService.api.listContainers(
      null,
      { handleLoad : function(aResult) {
          gsDiggMainService._listContainersLoadHandler(aResult, aLoadHandler);
        }
      },
      { handleError : function(aError) {
          gsDiggMainService._listContainersLoadHandler(aError, aLoadHandler);
        }
      });
  },

  /**
   * Handles the response from the listContainerAndTopics method.
   * @param aResult The result transfer object returned by the server.
   * @param aLoadHandler The caller's load handler.
   */
  _listContainersLoadHandler : function(aResult, aLoadHandler) {
    this._logService.trace("gsDiggMainService._listContainersLoadHandler");

    try {
      if (aResult instanceof Ci.gsICMTransferObject &&
          !aResult.hasValue("error") &&
          aResult.hasValue("containers")) {

        var containers = new NSArray();
        var containerDTO = null;
        var containerArray = new Object();
        var containerCount = new Object();
        var containersTO = aResult.getObjectValue("containers");

        containersTO.getObjectArray(containerCount, containerArray);

        for (var i = 0; i < containerCount.value; i++) {
          containerDTO =
            Cc["@glaxstar.org/digg/container-dto;1"].
              createInstance(Ci.gsIDiggContainerDTO);
          containerDTO.populateFromTO(containerArray.value[i]);

          containers.appendElement(containerDTO, false);
        }

        aLoadHandler.handleLoad(1, [containers]);
      } else {
        if (aResult.hasValue("message")) {
          this._logService.warn(
            "gsDiggMainService._listContainersLoadHandler: Error received: " +
            aResult.getStringValue("message"));
        }
        aLoadHandler.handleLoad(null, null);
      }
    } catch (e) {
      this._logService.error(
        "gsDiggMainService._listContainersLoadHandler: " + e);
      aLoadHandler.handleLoad(null, null);
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggMainService) &&
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
var gsDiggMainServiceFactory = {
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
      this._singletonObj = gsDiggMainService;
      gsDiggMainService._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggMainServiceModule = {
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
      return gsDiggMainServiceFactory;
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
  return gsDiggMainServiceModule;
}
