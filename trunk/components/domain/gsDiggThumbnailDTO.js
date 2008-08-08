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
const CLASS_ID = Components.ID("{60DEC639-B9FD-4DD9-AB5A-DEDD53E82FDF}");
const CLASS_NAME = "Thumbnail DTO";
const CONTRACT_ID = "@glaxstar.org/digg/thumbnail-dto;1";

/**
 * Thumbnail DTO
 * Stores thumbnail info
 */
function gsDiggThumbnailDTO() {
  this._init();
}

gsDiggThumbnailDTO.prototype = {

  /* Thumbnail original width */
  _originalWidth : null,
  /* Thumbnail original height */
  _originalHeight : null,
  /* Thumbnail content type */
  _contentType : null,
  /* Thumbnail src */
  _src : null,
  /* Thumbnail width */
  _width : null,
  /* Thumbnail height */
  _height : null,

  /* Log service */
  _logService : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggThumbnailDTO.init");
  },

  /**
   * Returns the thumbnail original width.
   * @return thumbnail original width
   */
  get originalWidth() {
    this._logService.debug("gsDiggThumbnailDTO.originalWidth[get]");
    return this._originalWidth;
  },

  /**
   * Sets the thumbnail original width.
   * @param aValue thumbnail original width
   */
  set originalWidth(aValue) {
    this._logService.debug("gsDiggThumbnailDTO.originalWidth[set]");
    this._originalWidth = aValue;
  },

  /**
   * Returns the thumbnail original height.
   * @return thumbnail original height
   */
  get originalHeight() {
    this._logService.debug("gsDiggThumbnailDTO.originalHeight[get]");
    return this._originalHeight;
  },

  /**
   * Sets the thumbnail original height.
   * @param aValue thumbnail original height
   */
  set originalHeight(aValue) {
    this._logService.debug("gsDiggThumbnailDTO.originalHeight[set]");
    this._originalHeight = aValue;
  },

  /**
   * Returns the thumbnail content type.
   * @return thumbnail content type
   */
  get contentType() {
    this._logService.debug("gsDiggThumbnailDTO.contentType[get]");
    return this._contentType;
  },

  /**
   * Sets the thumbnail content type.
   * @param aValue thumbnail content type
   */
  set contentType(aValue) {
    this._logService.debug("gsDiggThumbnailDTO.contentType[set]");
    this._contentType = aValue;
  },

  /**
   * Returns the thumbnail src.
   * @return thumbnail src
   */
  get src() {
    this._logService.debug("gsDiggThumbnailDTO.src[get]");
    return this._src;
  },

  /**
   * Sets the thumbnail src.
   * @param aValue thumbnail src
   */
  set src(aValue) {
    this._logService.debug("gsDiggThumbnailDTO.src[set]");
    this._src = aValue;
  },

  /**
   * Returns the thumbnail width.
   * @return thumbnail width
   */
  get width() {
    this._logService.debug("gsDiggThumbnailDTO.width[get]");
    return this._width;
  },

  /**
   * Sets the thumbnail width.
   * @param aValue thumbnail width
   */
  set width(aValue) {
    this._logService.debug("gsDiggThumbnailDTO.width[set]");
    this._width = aValue;
  },

  /**
   * Returns the thumbnail height.
   * @return thumbnail height
   */
  get height() {
    this._logService.debug("gsDiggThumbnailDTO.height[get]");
    return this._height;
  },

  /**
   * Sets the thumbnail height.
   * @param aValue thumbnail height
   */
  set height(aValue) {
    this._logService.debug("gsDiggThumbnailDTO.height[set]");
    this._height = aValue;
  },

  /**
   * Populates the thumbnailDTO with the information contained in the
   * gsICMTransferObject.
   * @param aCMTransferObject the transfer object to extract the thumbnail data.
   */
  populateFromTO : function(aCMTransferObject) {
    this._logService.debug("gsDiggThumbnailDTO.populateFromTO");

    if (null != aCMTransferObject) {
      // thumbnail original width
      if (aCMTransferObject.hasValue("originalwidth")) {
        this.originalWidth = aCMTransferObject.getIntegerValue("originalwidth");
      }
      // thumbnail original height
      if (aCMTransferObject.hasValue("originalheight")) {
        this.originalHeight =
          aCMTransferObject.getIntegerValue("originalheight");
      }
      // thumbnail contentType
      if (aCMTransferObject.hasValue("contentType")) {
        this.contentType = aCMTransferObject.getStringValue("contentType");
      }
      // thumbnail src
      if (aCMTransferObject.hasValue("src")) {
        this.src = aCMTransferObject.getStringValue("src");
      }
      // thumbnail width
      if (aCMTransferObject.hasValue("width")) {
        this.width = aCMTransferObject.getIntegerValue("width");
      }
      // thumbnail height
      if (aCMTransferObject.hasValue("height")) {
        this.height = aCMTransferObject.getIntegerValue("height");
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
    if (!aIID.equals(Ci.gsIDiggThumbnailDTO) &&
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
var gsDiggThumbnailDTOFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsDiggThumbnailDTO()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggThumbnailDTOModule = {
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
      return gsDiggThumbnailDTOFactory;
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
  return gsDiggThumbnailDTOModule;
}
