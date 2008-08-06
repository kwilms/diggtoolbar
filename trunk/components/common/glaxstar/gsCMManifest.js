/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{C2D63A1F-036E-46C7-96CC-B3FC5946F053}");
const CLASS_NAME = "CM Manifest";
const CONTRACT_ID = "@glaxstar.org/common/cm-manifest;1";

/**
 * Represents the specification for an API, with its methods and possible
 * calling domains.
 */
function CMManifest() {
  this._init();
}

CMManifest.prototype = {
  /* Log service. */
  _logService : null,
  /* Indicates if the object has been initialized properly. */
  _initialized : false,
  /* The result of the manifest generation. true if the manifest was obtained
     and generated successfully, false otherwise. */
  _result : false,
  /* The domains contained in this manifest. */
  _domains : null,
  /* The methods contained in this manifest. */
  _methods : null,
  /* The fixed parameters contained in the manifest. */
  _fixedParameters : null,
  /* The errors that were returned with this manifest. */
  _errors : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CMManifest._init");
  },

  /**
   * Initializes the manifest.
   * @param aTransferObj the gsICMTransferObject that holds the manifest
   * information.
   * @throws Exception if the transfer object is invalid or incomplete.
   */
  initialize : function(aTransferObj) {
    this._logService.debug("CMManifest.initialize");

    this._initialized = false;
    this._result = false;
    this._domains = null;
    this._methods = null;
    this._fixedParameters = null;
    this._errors = null;

    if (null != aTransferObj) {
      var lengthObj = new Object();
      var arrayObj = new Object();
      var lengthValue;
      var arrayValue;
      var transArray;
      var transObj;
      var newObj;

      try {
        // initialize domain array.
        if (aTransferObj.hasValue("domains")) {
          this._domains = new Array();
          transArray = aTransferObj.getObjectValue("domains");
          transArray.getObjectArray(lengthObj, arrayObj);
          lengthValue = lengthObj.value;
          arrayValue = arrayObj.value;

          for (var i = 0; i < lengthValue; i++) {
            newObj =
              Cc["@glaxstar.org/common/cm-domain;1"].
                createInstance(Ci.gsICMDomain);
            transObj = arrayValue[i];
            newObj.initialize(transObj.getStringValue("hostname"));
            this._domains.push(newObj);
          }
        }
        // initialize method array.
        if (aTransferObj.hasValue("methods")) {
          this._methods = new Array();
          transArray = aTransferObj.getObjectValue("methods");
          transArray.getObjectArray(lengthObj, arrayObj);
          lengthValue = lengthObj.value;
          arrayValue = arrayObj.value;

          for (var i = 0; i < lengthValue; i++) {
            newObj =
              Cc["@glaxstar.org/common/cm-method;1"].
                createInstance(Ci.gsICMMethod);
            transObj = arrayValue[i];
            newObj.initialize(
              transObj.getStringValue("mnemonic"),
              transObj.getStringValue("entry_point"),
              transObj.getStringValue("protocol"),
              (transObj.hasValue("method") ?
               transObj.getStringValue("method") : null));
            this._methods.push(newObj);
          }
        }
        // initialize fixed parameters array
        if (aTransferObj.hasValue("fixed_parameters")) {
          this._fixedParameters = new Array();
          transArray = aTransferObj.getObjectValue("fixed_parameters");
          transArray.getObjectArray(lengthObj, arrayObj);
          lengthValue = lengthObj.value;
          arrayValue = arrayObj.value;

          for (var i = 0; i < lengthValue; i++) {
            newObj =
              Cc["@glaxstar.org/common/cm-fixed-parameter;1"].
                createInstance(Ci.gsICMFixedParameter);
            transObj = arrayValue[i];
            newObj.initialize(
              transObj.getStringValue("name"),
              transObj.getStringValue("value"));
            this._fixedParameters.push(newObj);
          }
        }
        // initialize error array.
        if (aTransferObj.hasValue("errors")) {
          this._errors = new Array();
          transArray = aTransferObj.getObjectValue("errors");
          transArray.getObjectArray(lengthObj, arrayObj);
          lengthValue = lengthObj.value;
          arrayValue = arrayObj.value;

          for (var i = 0; i < lengthValue; i++) {
            newObj =
              Cc["@glaxstar.org/common/cm-error;1"].
                createInstance(Ci.gsICMError);
            transObj = arrayValue[i];
            newObj.initialize(
              transObj.getIntegerValue("error_code"),
              (transObj.hasValue("error_msg") ?
               transObj.getStringValue("error_msg") : null),
              (transObj.hasValue("for_parameter") ?
               transObj.getStringValue("for_parameter") : null));
            this._errors.push(newObj);
          }
        }
      } catch (e) {
        this._logService.error(
          "CMManifest.initialize: Invalid transfer object. [" + e.name + "] " +
          e.message);

        throw Ce("Invalid transfer object.");
      }
      // verify we have a good result and no errors.
      if ((null != this._domains) && (0 < this._domains.length) &&
          (null != this._methods) && (0 < this._methods.length) &&
          ((null == this._errors) || (0 == this._errors.length))) {
        this._result = true;
      }
      // set the object as initialized.
      this._initialized = true;
    } else {
      this._logService.error("CMManifest.initialize: Null transfer object.");

      throw Ce("Null transfer object.");
    }
  },

  /**
   * Obtains the domain in the given index.
   * @param aIndex the index to obtain the domain from.
   * @return the gsICMDomain in the given index.
   * @throws Exception if the object is not initialized or the index is invalid.
   */
  getDomainAtIndex : function(aIndex) {
    this._logService.debug("CMManifest.getDomainAtIndex. Index: " + aIndex);

    var domain = null;

    if (this._initialized) {
      if (null != this._domains) {
        if ((0 <= aIndex) && (aIndex < this._domains.length)) {
          domain = this._domains[aIndex];
        } else {
          this._logService.error(
            "CMManifest.getDomainAtIndex: Invalid index.");

          throw Ce("Invalid index for domain.");
        }
      } else {
        this._logService.error(
          "CMManifest.getDomainAtIndex: There are no domains in this "+
          "manifest.");

        throw Ce("There are no domains in this manifest.");
      }
    } else {
      this._logService.error(
        "CMManifest.getDomainAtIndex: Manifest not initialized.");

      throw Ce("The manifest has not been initialized.");
    }

    return domain;
  },

  /**
   * Obtains the method in the given index.
   * @param aIndex the index to obtain the method from.
   * @return the gsICMMethod in the given index.
   * @throws Exception if the object is not initialized or the index is invalid.
   */
  getMethodAtIndex : function(aIndex) {
    this._logService.debug("CMManifest.getMethodAtIndex. Index: " + aIndex);

    var method = null;

    if (this._initialized) {
      if (null != this._methods) {
        if ((0 <= aIndex) && (aIndex < this._methods.length)) {
          method = this._methods[aIndex];
        } else {
          this._logService.error(
            "CMManifest.getMethodAtIndex: Invalid index.");

          throw Ce("Invalid index for method.");
        }
      } else {
        this._logService.error(
          "CMManifest.getMethodAtIndex: There are no methods in this "+
          "manifest.");

        throw Ce("There are no methods in this manifest.");
      }
    } else {
      this._logService.error(
        "CMManifest.getMethodAtIndex: Manifest not initialized.");

      throw Ce("The manifest has not been initialized.");
    }

    return method;
  },

  /**
   * Obtains the fixed parameter in the given index.
   * @param aIndex The index to obtain the fixed parameter from.
   * @return The gsICMFixedParameter in the given index.
   * @throws Exception if the object is not initialized or the index is invalid.
   */
  getFixedParameterAtIndex : function(aIndex) {
    this._logService.debug(
      "CMManifest.getFixedParameterAtIndex. Index: " + aIndex);

    var parameter = null;

    if (this._initialized) {
      if (null != this._fixedParameters) {
        if ((0 <= aIndex) && (aIndex < this._fixedParameters.length)) {
          parameter = this._fixedParameters[aIndex];
        } else {
          this._logService.error(
            "CMManifest.getFixedParameterAtIndex: Invalid index.");

          throw Ce("Invalid index for fixed parameter.");
        }
      } else {
        this._logService.error(
          "CMManifest.getFixedParameterAtIndex: There are no fixed " +
          "parameters in this manifest.");

        throw Ce("There are no fixed parameters in this manifest.");
      }
    } else {
      this._logService.error(
        "CMManifest.getFixedParameterAtIndex: Manifest not initialized.");

      throw Ce("The manifest has not been initialized.");
    }

    return parameter;
  },

  /**
   * Obtains the error in the given index.
   * @param aIndex the index to obtain the error from.
   * @return the gsICMError in the given index.
   * @throws Exception if the object is not initialized or the index is invalid.
   */
  getErrorAtIndex : function(aIndex) {
    this._logService.debug("CMManifest.getErrorAtIndex. Index: " + aIndex);

    var error = null;

    if (this._initialized) {
      if (null != this._errors) {
        if ((0 <= aIndex) && (aIndex < this._errors.length)) {
          error = this._errors[aIndex];
        } else {
          this._logService.error(
            "CMManifest.getErrorAtIndex: Invalid index.");

          throw Ce("Invalid index for error.");
        }
      } else {
        this._logService.error(
          "CMManifest.getErrorAtIndex: There are no errors in this "+
          "manifest.");

        throw Ce("There are no errors in this manifest.");
      }
    } else {
      this._logService.error(
        "CMManifest.getErrorAtIndex: Manifest not initialized.");

      throw Ce("The manifest has not been initialized.");
    }

    return error;
  },

  /**
   * Returns the result of the manifest generation. true if the manifest was
   * obtained and generated successfully, false otherwise.
   * @return true if the manifest was obtained and generated successfully, false
   * otherwise.
   */
  get result() {
    this._logService.debug("CMManifest.get result");

    return this._result;
  },

  /**
   * Returns the amount of domains contained in this manifest. -1 if the object
   * is not initialized.
   * @return the amount of domains contained in this manifest. -1 if the object
   * is not initialized.
   */
  get domainCount() {
    this._logService.debug("CMManifest.get domainCount");

    var count = -1;

    if (this._initialized) {
      if (null != this._domains) {
        count =  this._domains.length;
      } else {
        count = 0;
      }
    }

    return count;
  },

  /**
   * Returns the amount of methods contained in this manifest. -1 if the object
   * is not initialized.
   * @return the amount of methods contained in this manifest. -1 if the object
   * is not initialized.
   */
  get methodCount() {
    this._logService.debug("CMManifest.get methodCount");

    var count = -1;

    if (this._initialized) {
      if (null != this._methods) {
        count =  this._methods.length;
      } else {
        count = 0;
      }
    }

    return count;
  },

  /**
   * Returns the amount of fixed parameters contained in this manifest. -1 if
   * the object is not initialized.
   * @return The amount of fixed parameters contained in this manifest. -1 if
   * the objectis not initialized.
   */
  get fixedParameterCount() {
    this._logService.debug("CMManifest.get fixedParameterCount");

    var count = -1;

    if (this._initialized) {
      if (null != this._fixedParameters) {
        count =  this._fixedParameters.length;
      } else {
        count = 0;
      }
    }

    return count;
  },

  /**
   * Returns the amount of errors that occurred when trying to obtain the
   * manifest. -1 if the object is not initialized.
   * @return the amount of errors that occurred when trying to obtain the
   * manifest. -1 if the object is not initialized.
   */
  get errorCount() {
    this._logService.debug("CMManifest.get errorCount");

    var count = -1;

    if (this._initialized) {
      if (null != this._errors) {
        count =  this._errors.length;
      } else {
        count = 0;
      }
    }

    return count;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICMManifest) && !aIID.equals(Ci.nsISupports)) {
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
var CMManifestFactory = {
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

    return (new CMManifest()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CMManifestModule = {
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
      return CMManifestFactory;
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
  return CMManifestModule;
}
