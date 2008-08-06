/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{2E5168C1-9887-4A6D-8A27-5791168B6BC5}");
const CLASS_NAME = "CM Domain";
const CONTRACT_ID = "@glaxstar.org/common/cm-domain;1";
// Hostname regular expression.
const GS_DAU_RE_HOSTNAME =
  new RegExp(
    "^(?:[a-z0-9](?:[a-z0-9\\-]{0,61}[a-z0-9])?\\.)*[a-z0-9]" +
    "(?:[a-z0-9\\-]{0,61}[a-z0-9])?(?:\\:[0-9]{1,7})?" +
    "(?:[a-z\\/\\?\\=])*$", "i");

/**
 * Represents a domain in an API specification.
 */
function CMDomain() {
  this._init();
}

CMDomain.prototype = {
  /* Log service. */
  _logService : null,
  /* Hostname. */
  _hostname : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CMDomain._init");
  },

  /**
   * Initializes the domain object.
   * @param aHostname the hostname to set on the domain.
   * @throws Exception is the hostname is invalid.
   */
  initialize : function(aHostname) {
    this._logService.debug("CMDomain.initialize");

    this._hostname = null;

    if ((null == aHostname) || !GS_DAU_RE_HOSTNAME.test(aHostname)) {
      this._logService.error(
        "CMDomain.initialize. Invalid hostname: " + aHostname);

      throw Ce("The hostname provided is invalid.");
    }

    this._hostname = aHostname;
  },

  /**
   * Returns the hostname in the domain.
   * @return the hostname in the domain.
   */
  get hostname() {
    this._logService.debug("CMDomain.get hostname");

    return this._hostname;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICMDomain) && !aIID.equals(Ci.nsISupports)) {
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
var CMDomainFactory = {
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

    return (new CMDomain()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CMDomainModule = {
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
      return CMDomainFactory;
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
  return CMDomainModule;
}
