/**
 * Copyright © 2007-2008 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{E0DB413C-28F3-4365-9539-58A6FBBED69E}");
const CLASS_NAME = "Communication service";
const CONTRACT_ID = "@glaxstar.org/common/communication-service;1";

// URL validation Regular Expression.
const GS_COM_RE_URL =
  new RegExp(
    "(?:(?:(?:http|https|ftp|file)://)(?:w{3}\\.)?(?:[a-zA-Z0-9/;\\?&=:\\-_\\" +
    "$\\+!\\*'\(\\|\\\\~\\[\\]#%\\.])+)");

// Regular expression to obtain parameter strings from an entry point.
const PARAM_IN_URL_REGEX = /\/(\{([^\}]+)\})/g;

/**
 * This is the main communication service, from which the specification and
 * implementation objects of a given API are obtained.
 */
var CommunicationService = {
  /* Log service. */
  _logService : null,
  /* Utility service. */
  _utilityService : null,

  /**
   * Initialize the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CommunicationService._init");

    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;2"].
        getService(Ci.gsIUtilityService);
  },

  /**
   * Obtains an API manifest from the given URL.
   * @param aLoadHandler the load handler for the manifest call.
   * @param aErrorHandler the error handler for the manifest call.
   * @param aURL the URL to get the manifest from.
   * @throws Exception if any of the arguments is invalid, or the call fails
   * before it's sent.
   */
  getManifest : function(aURL, aLoadHandler, aErrorHandler) {
    this._logService.debug("CommunicationService.getManifest");

    HTTPRequestSender.sendRequest(
      aURL, "GET", null,
      function(aEvent) {
        CommunicationService._loadHandler(
          aEvent, aLoadHandler, aErrorHandler, aURL);
      },
      function(aEvent) {
        CommunicationService._errorHandler(aEvent, aErrorHandler);
      });
  },

  /**
   * Internal load handler. Generates an transfer object from the response and
   * passes it along to the handler passed by the caller.
   * @param aEvent the load event triggered by the request.
   * @param aLoadHandler the caller's load handler.
   * @param aErrorHandler the caller's error handler.
   * @param aDomain the server domain.
   */
  _loadHandler : function(aEvent, aLoadHandler, aErrorHandler, aDomain) {
    this._logService.trace("CommunicationService._loadHandler");

    if (null != aLoadHandler) {
      var response = null;

      try {
        response = this._getTransferObject(aEvent, aDomain);
        aLoadHandler.handleLoad(response);
      } catch (e) {
        var error = null;

        this._logService.error(
          "CommunicationService._loadHandler: The transfer object wasn't " +
          "generated correctly.");

        try {
          error =
            this._getErrorObject(
              aEvent, "The received JSON object is invalid.");
        } catch (e) {
          this._logService.error(
            "CommunicationService._loadHandler: The error object wasn't " +
            "generated correctly.");
        }

        aErrorHandler.handleError(error);
      }
    } else {
      this._logService.error(
        "CommunicationService._loadHandler: A null load handler was given.");
    }
  },

  /**
   * Internal load handler. Generates an error object from the response and
   * passes it along to the handler passed by the caller.
   * @param aEvent the load event triggered by the error.
   * @param aErrorHandler the caller's error handler.
   */
  _errorHandler : function(aEvent, aErrorHandler) {
    this._logService.trace("CommunicationService._errorHandler");

    if (null != aErrorHandler) {
      var error = null;

      try {
        error = this._getErrorObject(aEvent);
      } catch (e) {
        this._logService.error(
          "CommunicationService._errorHandler: The error object wasn't " +
          "generated correctly.");
      }

      aErrorHandler.handleError(error);
    } else {
      this._logService.error(
        "CommunicationService._loadHandler: A null error handler was given.");
    }
  },

  /**
   * Creates an object that implements the API described in the given manifest.
   * @param aManifest The manifest object used to generate the implementation
   * object.
   * @return Implementation object for the API described in the manifest.
   * @throws Exception if the manifest is invalid.
   */
  implementManifest : function(aManifest) {
    this._logService.debug("CommunicationService.implementManifest");

    // generate an object with the functions we need.
    var api = new APIObject(aManifest);
    // convert the object into a valid XPCOM wrapper.
    return this._utilityService.wrapJSObject(api);
  },

  /**
   * Generates a transfer object from a response event.
   * @param aEvent the load event triggered by the request.
   * @param aDomain the server domain.
   * @return the transfer object that corresponds to the parsed response text.
   * @throws Exception if parsing fails or the event is invalid.
   */
  _getTransferObject : function(aEvent, aDomain) {
    this._logService.trace("CommunicationService._getTransferObject");

    var tranObject =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);
    var request = aEvent.target;

    tranObject.fromJSON(request.responseText, aDomain);

    return tranObject;
  },

  /**
   * Generates an error object from a request error event.
   * @param aEvent the load event triggered by the error.
   * @param aMessage to set on the error object.
   * @return the error object that corresponds to the response error.
   * @throws Exception if the event is invalid.
   */
  _getErrorObject : function(aEvent, aMessage) {
    this._logService.trace("CommunicationService._getErrorObject");

    var error =
      Cc["@glaxstar.org/common/cm-error;1"].createInstance(Ci.gsICMError);
    var request = aEvent.target;
    var errorCode;
    var errorMessage;

    try {
      errorCode = request.status;
      errorMessage = ((null == aMessage) ? request.statusText : aMessage);
    } catch (e) {
      errorCode = "CM0001";
      errorMessage =
        ((null == aMessage) ?
         "An error occurred in the request but no additional information was " +
         "provided." :
         aMessage);

      this._logService.warn(
        "CommunicationService._getErrorObject: The error object doesn't have " +
        "information from the response object.\n" + e);
    }

    error.initialize(errorCode, errorMessage, null);

    return error;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICommunicationService) &&
        !aIID.equals(Ci.nsISupports)) {
      throw(Cr.NS_ERROR_NO_INTERFACE);
    }

    return this;
  }
};

/**
 * Represents an API implementation object. This object will have its methods
 * generated dynamically using the provided manifest.
 */

function APIObject(aManifest) {
  this._init(aManifest);
};

APIObject.prototype = {
  /* Log service. */
  _logService : null,
  /* The manifest object. */
  _manifest : null,
  /* The currently selected domain index. */
  _selectedDomainIndex : -1,
  /* The currently selected domain. */
  _selectedDomain : null,

  /**
   * Initialize this API object with the given manifest object.
   * @param aManifest the manifest object holding the domains to use and methods
   * this object must implement.
   * @throws Exception if the manifest is invalid.
   */
  _init : function(aManifest) {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("APIObject._init");

    if ((null != aManifest) && aManifest.result) {
      var methodCount;
      var method;
      // set the local manifect object.
      this._manifest = aManifest;
      // select the first domain in the list.
      this._selectedDomainIndex = 0;
      this._selectedDomain =
        this._manifest.getDomainAtIndex(this._selectedDomainIndex).hostname;
      methodCount = this._manifest.methodCount;
      // add functions for each method.
      for (var i = 0; i < methodCount; i++) {
        method = this._manifest.getMethodAtIndex(i);
        this._addMethod(method);
      }
    } else {
      throw Ce("The manifest is null or it contains errors.");
    }
  },

  /**
   * Adds a method to this object.
   * @param aMethod the method object that represents the method to add.
   */
  _addMethod : function(aMethod) {
    this._logService.trace("APIObject._addMethod");

    // XXX: this prevents a Javascript problem where 'this' is different than
    // expected.
    var thisObj = this;

    this[aMethod.mnemonic] =
      function(aSendData, aLoadHandler, aErrorHandler) {
        this._logService.debug("APIObject." + aMethod.mnemonic);

        var url = aMethod.protocol + this._selectedDomain + aMethod.entryPoint;
        var domain = aMethod.protocol + this._selectedDomain;

        // Append fixed parameters.
        var fixedParameterCount = this._manifest.fixedParameterCount;
        var fixedParameter = null;

        // the data to send may be null, so we need to create a new object to
        // add the fixed parameters.
        if ((null == aSendData) && (0 < fixedParameterCount)) {
          aSendData =
            Cc["@glaxstar.org/common/cm-transfer-object;1"].
              createInstance(Ci.gsICMTransferObject);
        }

        for (var i = 0; i < fixedParameterCount; i++) {
          fixedParameter = this._manifest.getFixedParameterAtIndex(i);
          aSendData.setStringValue(fixedParameter.name, fixedParameter.value);
        }

        HTTPRequestSender.sendRequest(
          url, aMethod.method, aSendData,
          function(aEvent) {
            thisObj._loadHandler(
              aEvent, aLoadHandler, aErrorHandler, domain); },
          function(aEvent) { thisObj._errorHandler(aEvent, aErrorHandler); });
      };
  },

  /**
   * Internal load handler. Generates an transfer object from the response and
   * passes it along to the handler passed by the caller.
   * @param aEvent the load event triggered by the request.
   * @param aLoadHandler the caller's load handler.
   * @param aErrorHandler the caller's error handler.
   * @param aDomain the server domain
   */
  _loadHandler : function(aEvent, aLoadHandler, aErrorHandler, aDomain) {
    this._logService.trace("APIObject._loadHandler");

    if (null != aLoadHandler) {
      var transObjError = true;
      var response = null;
      var error = null;

      try {
        response = CommunicationService._getTransferObject(aEvent, aDomain);
        transObjError = false;
      } catch (e) {
        this._logService.error(
          "APIObject._loadHandler: The transfer object wasn't generated " +
          "correctly.");

        try {
          error =
            CommunicationService._getErrorObject(
              aEvent, "The load handler or the received object is invalid.");
        } catch (e) {
          this._logService.error(
            "APIObject._loadHandler: The error object wasn't generated " +
            "correctly.");
        }
      }

      if (!transObjError) {
        aLoadHandler.handleLoad(response);
      } else {
        aErrorHandler.handleError(error);
      }
    } else {
      this._logService.warn(
        "APIObject._loadHandler: A null load handler was given.");
    }
  },

  /**
   * Internal load handler. Generates an error object from the response and
   * passes it along to the handler passed by the caller.
   * @param aEvent the load event triggered by the error.
   * @param aErrorHandler the caller's error handler.
   */
  _errorHandler : function(aEvent, aErrorHandler) {
    this._logService.trace("APIObject._errorHandler");

    // change domains before moving on with the error flow.
    this._selectNextDomain();

    if (null != aErrorHandler) {
      var error = null;

      try {
        error = CommunicationService._getErrorObject(aEvent);
      } catch (e) {
        this._logService.error(
          "APIObject._errorHandler: The error object wasn't generated " +
          "correctly.");
      }

      aErrorHandler.handleError(error);
    } else {
      this._logService.warn(
        "APIObject._loadHandler: A null error handler was given.");
    }
  },

  /**
   * Selects the next domain in the domain list.
   */
  _selectNextDomain : function() {
    this._logService.trace("APIObject._selectNextDomain");

    this._selectedDomainIndex =
      (this._selectedDomainIndex + 1) % this._manifest.domainCount;
    this._selectedDomain =
      this._manifest.getDomainAtIndex(this._selectedDomainIndex).hostname;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    // IMPORTANT: this object in theory implements ALL interfaces, but of course
    // it is pointless to cast it to any interface other that the one it's meant
    // to implement. Perhaps we should filter all nsI interfaces.
    if (aIID.equals(Ci.nsIClassInfo) ||
        aIID.equals(Ci.nsISecurityCheckedComponent)) {
      throw Cr.NS_ERROR_NO_INTERFACE;
    }

    return this;
  }
};

/**
 * Holds a single function in charge of sending HTTP requests for both the
 * communication service and the generated API objects.
 */
var HTTPRequestSender = {
  /* Logging Service. */
  _logService : null,
  /**
   * Sends an asynchronous HTTP request to the URL with the arguments specified
   * in the given transfer object. The callback function is called when the
   * response is received.
   * @param aURL the URL to send the request to.
   * @param aMethod the method (GET or POST) used to send the request.
   * @param aTransferObj a gsICMTransferObject that holds the parameters to send
   * to the remote host by POST. It should be null in case there are no
   * parameters to send.
   * @param aLoadHandler the handler function to use when the response is
   * received correctly.
   * @param aErrorHandler the handler function to use when an error occurs in
   * the request.
   * @throws Exception if any of the arguments is invalid.
   */
  sendRequest : function(
    aURL, aMethod, aTransferObj, aLoadHandler, aErrorHandler) {
    if (null == this._logService) {
      this._logService =
        Cc["@glaxstar.org/common/log-service;1"].
          getService(Ci.gsILoggingService);
    }

    this._logService.debug(
      "HTTPRequestSender.sendRequest. URL: " + aURL + ", method: " + aMethod);

    if ((null == aURL) || !GS_COM_RE_URL.test(aURL)) {
      this._logService.error(
        "HTTPRequestSender.sendRequest: Invalid URL: " + aURL);

      throw Ce("An invalid URL was provided.");
    }

    try {
      // Look for embedded parameters in the url. For each one, replace them
      // with its value from the transfer object, or remove them if not found.
      var paramName = null;
      var match = PARAM_IN_URL_REGEX.exec(aURL);

      while (match) {
        paramName = match[2];

        if (aTransferObj && aTransferObj.hasValue(paramName)) {
          aURL = aURL.replace(match[1], aTransferObj.getStringValue(paramName));
          aTransferObj.removeValue(paramName);
        } else {
          aURL = aURL.replace(match[0], "");
        }
        match = PARAM_IN_URL_REGEX.exec(aURL);
      }

      var request =
        Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
      var postString = this._getPOSTString(aTransferObj);
      var isPOST = ("POST" == aMethod);
      // XXX: the line below should always be commented. Use only for debugging
      // purposes.
      // this._logService.debug("CM.sendRequest. POST string: " + postString);
      // add event handlers.
      request.QueryInterface(Ci.nsIDOMEventTarget);
      request.addEventListener(
        "load", function(aEvent) { aLoadHandler(aEvent) }, false);
      request.addEventListener(
        "error", function(aEvent) { aErrorHandler(aEvent) }, false);
      this._logService.debug("CM.sendRequest. Event listeners added.");

      // prepare the request.
      request.QueryInterface(Ci.nsIXMLHttpRequest);

      if (isPOST) {
        request.open(aMethod, aURL, true);
      } else {
        var postConcat = (aURL.match(/\?/g) ? "&" : "?");
        request.open(aMethod, (aURL + postConcat + postString), true);
      }

      request.setRequestHeader("Connection", "close");
      request.setRequestHeader(
        "Content-Type", "application/x-www-form-urlencoded");
      this._logService.debug("CM.sendRequest. Request opened.");

      request.send((isPOST ? postString : null));
      this._logService.debug("CM.sendRequest. Request sent.");

    } catch (e) {
      this._logService.error(
        "HTTPRequestSender.sendRequest: HttpRequest error. [" + e.name + "] " +
        e.message);

      throw Ce("An error occurred generating the HTTP Request.");
    }
  },

  /**
   * Obtains the POST string from a transfer object.
   * @param aTransferObj the transfer object to get the string from.
   * @return POST string obtained from the transfer object.
   */
  _getPOSTString : function(aTransferObj) {
    this._logService.trace("HTTPRequestSender._getPOSTString");

    var postString = ((null != aTransferObj) ? aTransferObj.toPOST() : "");
    return postString;
  }
};

/**
 * The nsIFactory interface allows for the creation of nsISupports derived
 * classes without specifying a concrete class type.
 * More: http://developer.mozilla.org/en/docs/nsIFactory
 */
var CommunicationServiceFactory = {
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
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    // in this case we need a unique instance of the service.
    if (!this._singletonObj) {
      this._singletonObj = CommunicationService;
      CommunicationService._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CommunicationServiceModule = {
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
      return CommunicationServiceFactory;
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
  return CommunicationServiceModule;
}
