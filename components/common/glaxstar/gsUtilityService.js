/**
 * Copyright © 2007-2008 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{6025CBF0-AC03-45EF-8448-9A4B8B6C9353}");
const CLASS_NAME = "Utility Service";
const CONTRACT_ID = "@glaxstar.org/common/utility-service;2";

// Constructor for the mutable array object
const NSArray =
  new Components.Constructor("@mozilla.org/array;1", Ci.nsIMutableArray);

// The common Glaxstar folder name.
const GS_FOLDER_NAME_GLAXSTAR_COMMON = "Glaxstar";
// Windows operating system regular expression.
const GS_DAU_RE_OS_WINDOWS = /^Win/i;
// Mac operating system regular expression.
const GS_DAU_RE_OS_MAC = /^Mac/i;
// Linux operating system regular expression.
const GS_DAU_RE_OS_LINUX = /^Linux/i;
// Window Vista regular expression for user agent.
const GS_UA_RE_OS_WINDOWS_VISTA = /Windows NT 6.0/i;
// The earliest Firefox 3 version string.
const FF3_MIN_VERSION = "3.0a0pre";
// Regular expression to check a valid email address.
const EMAIL_ADDRESS_REGEX =
  new RegExp("^[a-z0-9_\\-\\.\\!%]+@[a-z0-9_\\-\\.]+\\.[a-z0-9_\\-\\.]*" +
    "[a-z]{2,4}$", "i");

/**
 * Utility service. Contains some general utility methods that are commonly
 * used in our extensions.
 */
var UtilityService = {

  /* Log service. */
  _logService : null,
  /* Directory service. */
  _directoryService : null,
  /* Extension manager. */
  _extensionManager : null,
  /* Identifier for the operating system this extension is running on. */
  _os : null,
  /* The current Firefox version (full version number). */
  _firefoxVersion : null,

  /**
   * Getter of the firefoxVersion property.
   * @return string with the current Firefox version (full version number).
   */
  get firefoxVersion() {
    this._logService.debug("UtilityService.firefoxVersion [get]");

    if (null == this._firefoxVersion) {
      this._firefoxVersion = this._getCurrentFirefoxVersion();
    }

    return this._firefoxVersion;
  },

  /**
   * Initialize the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.debug("UtilityService.init");

    this._directoryService =
      Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
    this._extensionManager =
      Cc["@mozilla.org/extensions/manager;1"].
        getService(Ci.nsIExtensionManager);
  },

  /**
   * Gets the app (Firefox) version number.
   * @return the current app (Firefox) version number.
   */
  _getCurrentFirefoxVersion : function() {
    this._logService.trace("UtilityService._getCurrentFirefoxVersion");

    var appInfo =
      Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);

    return appInfo.version;
  },

  /**
   * Determines if the current firefox version is a specified one.
   * @param aFirefoxVersion A short number of the version to compare with.
   * @return boolean flag indicating if the current firefox version is or is not
   * the one specified by the parameter.
   */
  isCurrentFirefoxVersion : function(aFirefoxVersion) {
    this._logService.trace("UtilityService.isCurrentFirefoxVersion");

    var isSameVersion = false;
    var versionChecker =
      Cc["@mozilla.org/xpcom/version-comparator;1"].
        getService(Ci.nsIVersionComparator);

    switch(aFirefoxVersion) {
      case Ci.gsIUtilityService.FIREFOX_VERSION_2:
        if (versionChecker.compare(
              this.firefoxVersion, FF3_MIN_VERSION) < 0) {
          isSameVersion = true;
        }
        break;

      case Ci.gsIUtilityService.FIREFOX_VERSION_3:
        if (versionChecker.compare(
              FF3_MIN_VERSION, this.firefoxVersion) <= 0) {
          isSameVersion = true;
        }
        break;
    }

    return isSameVersion;
  },

  /**
   * Obtains a reference to the folder where a particular extension will write
   * and keep its persistent files. The folder will be created if it doesn't
   * exist.
   * @param aFolderName the name of the folder to obtain / create. It should be
   * unique to the extension. A null or empty value will cause the common
   * Glaxstar folder to be returned.
   * @return nsIFile reference to the extension folder.
   */
  getExtensionFolder : function(aFolderName) {
    // XXX: we don't use the logging service in this method because logging
    // depends on this method to be initialized.
    var folder = this._directoryService.get("ProfD", Ci.nsIFile);

    folder.append(GS_FOLDER_NAME_GLAXSTAR_COMMON);

    if (null != aFolderName) {
      folder.append(aFolderName);
    }

    if (!folder.exists() || !folder.isDirectory()) {
      // read and write permissions to owner and group, read-only for others.
      folder.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
    }

    return folder;
  },

  /**
   * Obtains a reference to the defaults folder for a specific extension.
   * @param aExtensionUUID the UUID of the extension.
   * @return nsIFile reference to the defaults folder for the extension matching
   * the given UUID.
   */
  getDefaultsFolder : function(aExtensionUUID) {
    this._logService.debug(
      "UtilityService.getDefaultsFolder. UUID: " + aExtensionUUID);

    var defaultsFolder =
      this._extensionManager.
        getInstallLocation(aExtensionUUID).getItemLocation(aExtensionUUID);

    defaultsFolder.append("defaults");

    return defaultsFolder;
  },

  /**
   * Wraps a JS object in the native XPCOM wrapper. This is used when an XPCOM
   * is not instantiated throught the regular Components.classes procedure and
   * it's necessary for it to behave as a regular XPCOM, particularly work with
   * the 'instanceof' operator.
   * @param aJSObject regular JS object that represents an XPCOM component.
   * @return wrapped native XPCOM component that corresponds to the given
   * object.
   */
  wrapJSObject : function(aJSObject) {
    this._logService.debug("UtilityService.wrapJSObject");

    // nothing to do here. When a JS object is passed as a parameter an XPCOM
    // method, the XPConnect API automatically wraps the object.
    // XXX: this a workaround that should be investigated. There might be better
    // ways to do this.
    return aJSObject;
  },

  /**
   * Obtains an identifier for the operating system this extension is running
   * on.
   * @return any of the OS constants defined in this interface.
   */
  getOperatingSystem : function() {
    this._logService.debug("UtilityService.getOperatingSystem");

    var operatingSystem = Ci.gsIUtilityService.OS_OTHER;

    if (null == this._os) {
      var appShellService =
        Cc["@mozilla.org/appshell/appShellService;1"].
          getService(Ci.nsIAppShellService);
      var platform = appShellService.hiddenDOMWindow.navigator.platform;
      var userAgent = appShellService.hiddenDOMWindow.navigator.userAgent;

      if (platform.match(GS_DAU_RE_OS_MAC)) {
        operatingSystem = Ci.gsIUtilityService.OS_MAC;
      } else if (platform.match(GS_DAU_RE_OS_WINDOWS)) {
        if (userAgent.match(GS_UA_RE_OS_WINDOWS_VISTA)) {
          operatingSystem = Ci.gsIUtilityService.OS_WINDOWS_VISTA;
        } else {
          operatingSystem = Ci.gsIUtilityService.OS_WINDOWS;
        }
      } else if (platform.match(GS_DAU_RE_OS_LINUX)) {
        operatingSystem = Ci.gsIUtilityService.OS_LINUX;
      } else {
        operatingSystem = Ci.gsIUtilityService.OS_OTHER;
      }
    } else {
      operatingSystem = this._os;
    }

    return operatingSystem;
  },

  /**
   * Get the operating sytem name.
   * @return string name of the operating system.
   */
  getOperatingSystemName : function() {
    this._logService.debug("UtilityService.getOperatingSystemName");

    var operatingSystemName = "other";
    var operatingSystemNumber = this.getOperatingSystem();

    switch (operatingSystemNumber) {
      case Ci.gsIUtilityService.OS_WINDOWS:
      case Ci.gsIUtilityService.OS_WINDOWS_VISTA:
        operatingSystemName = "windows";
        break;
      case Ci.gsIUtilityService.OS_MAC:
        operatingSystemName = "mac";
        break;
      case Ci.gsIUtilityService.OS_LINUX:
        operatingSystemName = "linux";
        break;
      case Ci.gsIUtilityService.OS_OTHER:
        operatingSystemName = "other";
        break;
    }

    return operatingSystemName;
  },

  /**
   * Trims a string (both start and end).
   * @param aString The string to be trimmed.
   * @return The trimmed string.
   */
  trim : function(aString) {
    this._logService.debug("UtilityService.trim");

    aString = new String(aString);
    return aString.replace(/^\s+|\s+$/g, '');
  },

  /**
   * Returns true if the given string is null or empty.
   * @param aString the string to check.
   * @return true if the string is null or empty. Returns false otherwise. Note
   * that this method returns false for strings with blank characters, like " ".
   */
  isNullOrEmpty : function(aString) {
    this._logService.debug("UtilityService.isNullOrEmpty");

    return ((null == aString) || (0 == aString.length));
  },

  /**
   * Returns true if the given string is a valid email address.
   * @param aString the string to check.
   * @return true if the string is a valir email address. Returns false
   * otherwise. Note that this method returns false for empty an null strings.
   */
  isValidEmailAddress : function(aString) {
    this._logService.debug("UtilityService.isValidEmailAddress");

    return (!this.isNullOrEmpty(aString) && aString.match(EMAIL_ADDRESS_REGEX));
  },

  /**
   * Generates a UUID.
   * @return an UUID.
  */
  generateUUID : function() {
    this._logService.debug("UtilityService.generateUUID");

    var uuidGenerator =
      Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator);
    var uuid = uuidGenerator.generateUUID().toString();

    // Remove the brackets from the generated UUID
    if (uuid.indexOf("{") == 0 ) {
      uuid = uuid.substring(1, (uuid.length - 1));
    }

    return uuid;
  },

  /**
   * Returns a nsIArray of elements that match the given aXPathExpression,
   * from the aXMLNode specified, using xpath.
   * @param aXMLNode The XML node or document to search for matches.
   * @param aXPathExpresion The xpath expression to be used in the search.
   * @return A nsIArray with the elements that matched the xpath expression.
   */
  evaluateXPath : function (aXMLNode, aXPathExpression) {
    this._logService.debug("evaluateXPath");

    var matches = new NSArray();
    var xpe =
      Cc["@mozilla.org/dom/xpath-evaluator;1"].
        getService(Ci.nsIDOMXPathEvaluator);

    var nsResolver = xpe.createNSResolver(aXMLNode.ownerDocument == null ?
      aXMLNode.documentElement : aXMLNode.ownerDocument.documentElement);

    var result = xpe.evaluate(aXPathExpression, aXMLNode, nsResolver, 0, null);

    var res = result.iterateNext();
    while (res) {
      matches.appendElement(res, false);
      res = result.iterateNext();
    }

    return matches;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIUtilityService) && !aIID.equals(Ci.nsISupports)) {
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
var UtilityServiceFactory = {
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
  createInstance : function(aOuter, aIID) {
    if (aOuter != null) {
      throw(Cr.NS_ERROR_NO_AGGREGATION);
    }
    // in this case we need a unique instance of the service.
    if (!this._singletonObj) {
      this._singletonObj = UtilityService;
      UtilityService._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var UtilityServiceModule = {
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
      return UtilityServiceFactory;
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
  return UtilityServiceModule;
}
