/**
 * Copyright © 2008 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const CLASS_ID = Components.ID("{49ffef70-63f5-11dd-ad8b-0800200c9a66}");
const CLASS_NAME = "Cookie Manager";
const CONTRACT_ID = "@glaxstar.org/common/cookie-manager;1";

// XXX: cookies expiration date. According to
// http://www.howtocreate.co.uk/tutorials/javascript/cookies
// UNIX and mac computers won't accept a date after 03:14 on 18 Jan 2038 and
// 06:28 6 Feb 2040 respectively, so we use 00:00:00 on 1 Jan 2038 just to be
// sure it works and is good enough for us
const GS_COOKIE_MAX_EXPIRATION_DATE = "January, 1 2038 00:00:00";

/**
 * Cookie manager. It handles common cookie related operations.
 */
var CookieManager = {
  /* Log service. */
  _logService : null,
  /* Utility service */
  _utilityService : null,
  /* Cookie service */
  _cookieService : null,
  /* Input/Output service */
  _ioService : null,

  /**
   * Returns the maximum expiration date possible for Mac, Linux and Windows.
   * @return The GMT string representation of the maximum expiration date.
   */
  get maxExpirationDate() {
    this._logService.
      debug("gsGluBrowserControlService.maxExpirationDate[get]");

    var expirationDate = new Date();

    expirationDate.setDate(Date.parse(GS_COOKIE_MAX_EXPIRATION_DATE));

    return expirationDate.toGMTString();
  },

  /**
   * Initializes the required services.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.debug("Cookiemanager.init");

    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;2"].
        getService(Ci.gsIUtilityService);
    this._cookieService =
      Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);
    this._ioService =
      Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  },

  /**
   * Sets a cookie for the desired domain with the desired name, value and
   * attributes.
   * @param aCookieDomain the domain the cookie belongs to
   * @param aCookieName cookie name
   * @param aCookieValue cookie value
   * @param aCookieAttributes cookie attributes(expires,domain,path,secure)
   */
  setCookie : function(
    aCookieDomain, aCookieName, aCookieValue, aCookieAttributes) {
    this._logService.debug("Cookiemanager.setCookie");

    var cookieString = null;
    var cookieURI = null;

    if (!this._utilityService.isNullOrEmpty(aCookieName) &&
        !this._utilityService.isNullOrEmpty(aCookieDomain)) {
      cookieURI = this._ioService.newURI(aCookieDomain, null, null);
      cookieString =
        aCookieName + "=" + (aCookieValue != null ? aCookieValue : "") + ";";
      cookieString += (aCookieAttributes != null ? aCookieAttributes : "");

      this._cookieService.setCookieString(cookieURI, null, cookieString, null);
    }
  },

  /**
   * Returns the value of the cookie specified by its name and domain.
   * @param aCookieDomain The domain the cookie belongs to
   * @param aCookieName The cookie name.
   * @return The cookie value.
   */
  getCookie : function(aCookieDomain,aCookieName) {
    this._logService.debug("Cookiemanager.getCookie");

    var cookieString = null;
    var cookieURI = null;
    var search = aCookieName + "=";
    var cookieStartIndex = -1;
    var cookieEndIndex = null;
    var cookieValue = null;

    if (!this._utilityService.isNullOrEmpty(aCookieName) &&
        !this._utilityService.isNullOrEmpty(aCookieDomain)) {

      cookieURI = this._ioService.newURI(aCookieDomain, null, null);
      cookieString = this._cookieService.getCookieString(cookieURI, null);

      if (!this._utilityService.isNullOrEmpty(cookieString)) {
        cookieStartIndex = cookieString.indexOf(search);

        if (cookieStartIndex != -1) {
          cookieStartIndex += search.length;
          cookieEndIndex = cookieString.indexOf(';', cookieStartIndex);

          if (cookieEndIndex == -1) {
            cookieEndIndex = cookieString.length;
          }

          cookieValue =
            cookieString.substring(cookieStartIndex, cookieEndIndex);
          cookieValue = (cookieValue.length == 0 ? null : cookieValue);
        }
      }
    }

    return cookieValue;
  },

  /**
   * Removes the cookie specified by its domain and name by setting an empty
   * string.
   * @param aCookieDomain The domain the cookie belongs to
   * @param aCookieName The cookie name
   */
  removeCookie : function(aCookieDomain, aCookieName) {
    this._logService.debug("Cookiemanager.getCookie");

    if (!this._utilityService.isNullOrEmpty(aCookieName) &&
        !this._utilityService.isNullOrEmpty(aCookieDomain)) {
      this.setCookie(aCookieDomain, aCookieName, null, null);
    }
  },

  /**
   * Checks if a cookie does exist.
   * @param aCookieDomain The domain to which the cookie does belong to.
   * @param aCookieName The cookie name.
   * @return True if it exists, false otherwise.
   */
  cookieExists : function(aCookieDomain, aCookieName) {
    this._logService.debug("Cookiemanager.cookieExists");

    var cookieString = null;
    var cookieURI = null;
    var cookieStartIndex = -1;
    var cookieExists = false;

    if (!this._utilityService.isNullOrEmpty(aCookieName) &&
        !this._utilityService.isNullOrEmpty(aCookieDomain)) {

      cookieURI = this._ioService.newURI(aCookieDomain, null, null);
      cookieString = this._cookieService.getCookieString(cookieURI, null);

      if (!this._utilityService.isNullOrEmpty(cookieString)) {
        cookieStartIndex = cookieString.indexOf(aCookieName);

        if (cookieStartIndex != -1 &&
            this.getCookie(aCookieDomain,aCookieName) != null) {
          cookieExists = true;
        }
      }
    }

    return cookieExists;
  },

  /**
   * Generates a string with the cookie attributes so it can be passed to the
   * setCookie method.
   * @param aExpires Date in GMT string. Null if not needed.
   * @param aDomain Cookie domain. Start with a '.'.Null if not needed.
   * @param aPath Path of the cookie. Null if not needed
   * @param aSecure true or false.
   */
  generateCookieAttributeString : function(aExpires, aDomain, aPath, aSecure) {
    this._logService.debug("Cookiemanager.setCookie");

    var attributeString = "";

    if (!this._utilityService.isNullOrEmpty(aExpires)) {
      attributeString = "; expires=" + aExpires;
    }

    if (!this._utilityService.isNullOrEmpty(aDomain)) {
      attributeString = "; domain=" + aDomain;
    }

    if (!this._utilityService.isNullOrEmpty(aPath)) {
      attributeString = "; path=" + aPath;
    }

    if (aSecure) {
      attributeString = "; secure";
    }

    return attributeString;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICookieManager) &&
        !aIID.equals(Ci.nsISupports)) {
      throw CR.NS_ERROR_NO_INTERFACE;
    }

    return this;
  }
};

/**
* The nsIFactory interface allows for the creation of nsISupports derived
* classes without specifying a concrete class type.
* More: http://developer.mozilla.org/en/docs/nsIFactory
*/
var CookieManagerFactory = {
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
      this._singletonObj = CookieManager;
      CookieManager.init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CookieManagerModule = {
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
      return CookieManagerFactory;
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
  return CookieManagerModule;
}
