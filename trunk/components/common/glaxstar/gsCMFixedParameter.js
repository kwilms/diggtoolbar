/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{64399450-f7a2-11dc-95ff-0800200c9a66}");
const CLASS_NAME = "CM Fixed Parameter";
const CONTRACT_ID = "@glaxstar.org/common/cm-fixed-parameter;1";

/**
 * Represents a fixed parameter in an API specification.
 */
function CMFixedParameter() {
  this._init();
}

CMFixedParameter.prototype = {
  /* Log service */
  _logService : null,
  /* Name */
  _name : null,
  /* Value */
  _value : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CMFixedParameter._init");
  },

  /**
   * Initializes the fixed parameter object.
   * @param aName The name of the fixed parameter.
   * @param aValue The value of the fixed parameter.
   * @throws Exception is the name or value are invalid.
   */
  initialize : function(aName, aValue) {
    this._logService.debug("CMFixedParameter.initialize");

    this._name = null;
    this._value = null;

    if (null == aName) {
      this._logService.error(
        "CMFixedParameter.initialize. Invalid name (null).");
      throw Ce("The name provided is invalid (null).");
    }
    if (null == aValue) {
      this._logService.error(
        "CMFixedParameter.initialize. Invalid value (null).");
      throw Ce("The valueprovided is invalid (null).");
    }

    this._name = aName;
    this._value = aValue;
  },

  /**
   * Returns the name of the fixed parameter.
   * @return The name of the fixed parameter.
   */
  get name() {
    this._logService.debug("CMFixedParameter.name[get]");
    return this._name;
  },

  /**
   * Returns the value of the fixed parameter.
   * @return The value of the fixed parameter.
   */
  get value() {
    this._logService.debug("CMFixedParameter.value[get]");
    return this._value;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICMFixedParameter) && !aIID.equals(Ci.nsISupports)) {
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
var CMFixedParameterFactory = {
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

    return (new CMFixedParameter()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CMFixedParameterModule = {
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
      return CMFixedParameterFactory;
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
  return CMFixedParameterModule;
}
