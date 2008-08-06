/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{DBBC32D7-9C14-4C01-BAFB-971805F5133B}");
const CLASS_NAME = "CM Domain";
const CONTRACT_ID = "@glaxstar.org/common/cm-error;1";

/**
 * Represents an error from the API.
 */
function CMError() {
  this._init();
}

CMError.prototype = {
  /* Log service. */
  _logService : null,
  /* The identifier of the type of error that occurred. */
  _errorCode : null,
  /* The message associated to the error. */
  _errorMessage : null,
  /* The name of the parameter that caused the error. */
  _forParameter : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CMError._init");
  },

  /**
   * Initializes the error object.
   * @param aErrorCode the identifier of the type of error that occurred.
   * @param aErrorMessage the message associated to the error.
   * @param aForParameter the name of the parameter that caused the error.
   * @throws Exception if any of the parameters is invalid.
   */
  initialize : function(aErrorCode, aErrorMessage, aForParameter) {
    this._logService.debug("CMError.initialize");

    this._errorCode = null;
    this._forParameter = null;

    if ((null == aErrorCode) || ("" == aErrorCode)) {
      this._logService.error(
        "CMError.initialize. Invalid error code: " + aErrorCode);

      throw Ce("The error code provided is invalid.");
    }
    // an empty string and null are equivalent for this parameter.
    if ("" != aForParameter) {
      this._forParameter = aForParameter;
    }

    this._errorCode = aErrorCode;
    this._errorMessage = aErrorMessage;
  },

  /**
   * Returns the identifier of the type of error that occurred.
   * @return the identifier of the type of error that occurred.
   */
  get errorCode() {
    this._logService.debug("CMError.get errorCode");

    return this._errorCode;
  },

  /**
   * Returns the message associated to the error.
   * @return the message associated to the error.
   */
  get errorMessage() {
    this._logService.debug("CMError.get errorMessage");

    return this._errorMessage;
  },

  /**
   * Returns the name of the parameter that caused the error.
   * @return the name of the parameter that caused the error.
   */
  get forParameter() {
    this._logService.debug("CMError.get forParameter");

    return this._forParameter;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICMError) && !aIID.equals(Ci.nsISupports)) {
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
var CMErrorFactory = {
  /**
   * Creates an instance of the class associated with this factory.
   * @param aOuter pointer to a component that wishes to be aggregated in the
   * resulting instance. This can be nsnull if no aggregation is requested.
   * @param aIID the interface type to be returned.
   * @return the resulting interface pointer.
   * @throws NS_ERROR_NO_AGGREGATION if aOuter is not null. This component
   * doesn't support aggregation.
   */
  createInstance : function(aOuter, aIID) {
    if (aOuter != null) {
      throw(Cr.NS_ERROR_NO_AGGREGATION);
    }

    return (new CMError()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CMErrorModule = {
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
  unregisterSelf : function(aCompMgr, aLocation, aLoaderStr) {
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
      return CMErrorFactory;
    }

    throw(Cr.NS_ERROR_NO_INTERFACE);
  },

  /**
   * This method may be queried to determine whether or not the component
   * module can be unloaded by XPCOM.
   * @param aCompMgr the global component manager.
   * @return true if the module can be unloaded by XPCOM. false otherwise.
   */
  canUnload : function(aCompMgr) {
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
  return CMErrorModule;
}
