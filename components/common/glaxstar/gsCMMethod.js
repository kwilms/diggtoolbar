/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{36A6FD2D-766F-4D00-A00B-1652ED9D5511}");
const CLASS_NAME = "CM Method";
const CONTRACT_ID = "@glaxstar.org/common/cm-method;1";

// Mnemonic regular expression.
const GS_DAU_RE_MNEMONIC = /^[a-zA-Z][a-zA-Z0-9_]*$/;
// Entry point regular expression.
const GS_DAU_RE_ENTRY_POINT = /^(\/[^\/\s]+)+(\/)?$/;

/**
 * Represents a method in an API specification.
 */
function CMMethod() {
  this._init();
}

CMMethod.prototype = {
  /* Log service. */
  _logService : null,
  /* The rememberable name of the method. */
  _mnemonic : null,
  /* The URL entry point that identifies this particular method. */
  _entryPoint : null,
  /* The protocol used to invoke this method. */
  _protocol : null,
  /* The method (GET or POST) used to send data. */
  _method : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CMMethod._init");
  },

  /**
   * Initializes the method object.
   * @param aMnemonic the mnemonic associated to the method.
   * @param aEntryPoint the URL entry point to set on the method.
   * @param aProtocol the protocol to set on the method.
   * @param aMethod the method (GET or POST) used to send data. A null value
   * defaults to GET.
   * @throws Exception if any of the parameters is invalid.
   */
  initialize : function(aMnemonic, aEntryPoint, aProtocol, aMethod) {
    this._logService.debug("CMMethod.initialize");

    this._mnemonic = null;
    this._entryPoint = null;
    this._protocol = null;
    this._method = null;

    if ((null == aMnemonic) || !GS_DAU_RE_MNEMONIC.test(aMnemonic)) {
      this._logService.error(
        "CMMethod.initialize. Invalid mnemonic: " + aMnemonic);

      throw Ce("The provided mnemonic is invalid.");
    }

    if ((null == aEntryPoint) || !GS_DAU_RE_ENTRY_POINT.test(aEntryPoint)) {
      this._logService.error(
        "CMMethod.initialize. Invalid entry point: " + aEntryPoint);

      throw Ce("The provided entry point is invalid.");
    }

    if (("http://" != aProtocol) && ("https://" != aProtocol)) {
      this._logService.error(
        "CMMethod.initialize. Invalid protocol: " + aProtocol);

      throw Ce("The provided protocol is invalid.");
    }

    if ((null == aMethod) || ("" == aMethod)) {
      this._method = "GET";
    } else if (("GET" == aMethod) || ("POST" == aMethod)) {
      this._method = aMethod;
    } else {
      this._logService.error(
        "CMMethod.initialize. Invalid method (GET or POST): " + aMethod);

      throw Ce("The provided method (GET or POST) is invalid.");
    }

    this._mnemonic = this._canonicMnemonic(aMnemonic);
    this._entryPoint = aEntryPoint;
    this._protocol = aProtocol;
  },

  /**
   * Returns the rememberable name of the method.
   * @return the rememberable name of the method.
   */
  get mnemonic() {
    this._logService.debug("CMMethod.get mnemonic");

    return this._mnemonic;
  },

  /**
   * Returns the URL entry point that identifies this particular method.
   * @return the URL entry point that identifies this particular method.
   */
  get entryPoint() {
    this._logService.debug("CMMethod.get entryPoint");

    return this._entryPoint;
  },

  /**
   * Returns the protocol used to invoke this method.
   * @return the protocol used to invoke this method.
   */
  get protocol() {
    this._logService.debug("CMMethod.get protocol");

    return this._protocol;
  },

  /**
   * Returns the method (GET or POST) used to send data.
   * @return the method (GET or POST) used to send data.
   */
  get method() {
    this._logService.debug("CMMethod.get method");

    return this._method;
  },

  /**
   * Converts a mnemonic to a canonic camel casing. It's also the best method
   * name I've ever come up with :).
   * @param aMnemonic the mnemonic to convert.
   * @return canonic camel case version of the given mnemonic.
   * @throws Exception if the mnemonic is invalid.
   */
  _canonicMnemonic : function(aMnemonic) {
    this._logService.trace("CMMethod._canonicMnemonic");

    var canonic = null;
    var split = aMnemonic.toLowerCase().split("_");
    var splitCount = split.length;
    var firstSection = true;
    var section;

    for (var i = 0; i < splitCount; i++) {
      section = split[i];
      // ignore empty sections (consecutive underscores).
      if ("" != section) {
        if (firstSection) {
          // keep the first section in lower case.
          canonic = section;
          firstSection = false;
        } else if (1 < section.length) {
          // capitalize the first letter of the section.
          canonic += (section.charAt(0).toUpperCase() + section.substring(1));
        } else {
          // capitalize the whole section (one letter only).
          canonic += section.toUpperCase();
        }
      }
    }

    if (firstSection) {
      this._logService.error(
        "CMMethod._canonicMnemonic. Invalid mnemonic: " + aMnemonic);

      throw Ce("The provided mnemonic is invalid.");
    }

    return canonic;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICMMethod) && !aIID.equals(Ci.nsISupports)) {
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
var CMMethodFactory = {
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

    return (new CMMethod()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CMMethodModule = {
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
      return CMMethodFactory;
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
  return CMMethodModule;
}
