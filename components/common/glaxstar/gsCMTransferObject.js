/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const Cu = Components.utils;
const CLASS_ID = Components.ID("{6A7E3C29-D842-48FF-AABF-31B12EB6BE71}");
const CLASS_NAME = "CM JSON Object";
const CONTRACT_ID = "@glaxstar.org/common/cm-transfer-object;1";

// JSON string regular expression.
const RE_JSON_STRING =
  /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/;
// Array constructor regular expression.
const RE_ARRAY_CONSTRUCTOR = /^function Array\(\)/;
// The suffix used to identify a zipped value represented as a base 64 string.
const SUFFIX_ZIPPED_DATA = "_zip_base64";

/**
 * The data transfer object to be user between API methods and API consumers.
 */
function CMTransferObject() {
  this._init();
}

CMTransferObject.prototype = {
  /* Log service. */
  _logService : null,
  /* Compression service. */
  _compressionService : null,
  /* Utility service. */
  _utilityService : null,
  /* The object that resulted from parsing the JSON string. */
  _parsedObject : null,

  /**
   * Initialize the object.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CMTransferObject._init");

    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;1"].
        getService(Ci.gsIUtilityService);
    this._compressionService =
      Cc["@glaxstar.org/common/compression-service;1"].
        getService(Ci.gsICompressionService);
  },

  /**
   * Parses the given JSON string and initializes the object. Existing name /
   * value mappings will be removed.
   * The code is based on Mozilla code,
   * http://lxr.mozilla.org/mozilla/source/browser/components/search/
   * nsSearchSuggestions.js#525
   * @param aJSONString the string used to initialize the object.
   * @param aDomain the domain from which the JSON string was obtained.
   * @throws Exception for any parse error that may occur.
   */
  fromJSON : function(aJSONString, aDomain) {
    this._logService.debug("CMTransferObject.fromJSON");

    var parseError = true;

    if ((null != aDomain) && (null != aJSONString) &&
        RE_JSON_STRING.test(aJSONString)) {
      var sandbox = null;
      var parsedObject = null;

      try {
        // create a safe sandbox to evaluate the code.
        sandbox = new Cu.Sandbox(aDomain);
      } catch (e) {
        this._parsedObject = null;
        this._logService.error(
          "CMTransferObject.fromJSON: Invalid domain given to Sandbox. "  + e);

        throw Ce("Invalid domain for JSON parsing.");
      }

      try {
        // evaluate (parse) the code in the sandbox.
        parsedObject = Cu.evalInSandbox("(" + aJSONString + ")", sandbox);
      } catch (e) {
        this._parsedObject = null;
        this._logService.error(
          "CMTransferObject.fromJSON: evalInSandbox error. [" + e.name + "] " +
          e.message);

        throw Ce("JSON String evaluation error.");
      }
      // verify it's a valid object.
      if ((null != parsedObject) && ("object" == typeof(parsedObject)) &&
          !this._isArray(parsedObject)) {
        this._initializeWithObject(parsedObject);
        parseError = false;
      }
    }

    if (parseError) {
      this._parsedObject = null;
      throw Ce("JSON String validation error.");
    }
  },

  /**
   * Initializes this JSON object with and object that was extracted from a JSON
   * string.
   * @param aObject object extracted from a JSON string.
   */
  _initializeWithObject : function(aObject) {
    this._logService.trace("CMTransferObject._initializeWithObject");

    this._parsedObject = aObject;
  },

  /**
   * Indicates if this object has been correctly initialized.
   * @return true if this object has been initialized. false otherwise.
   */
  _isInitialized : function() {
    this._logService.trace("CMTransferObject._isInitialized");

    return (null != this._parsedObject);
  },

  /**
   * Outputs the contents of this object as a POST string.
   * XXX: an object can be converted to POST only if it contains either:
   * - Simple (not object or array) values.
   * - String arrays.
   * - Arrays of objects with simple (not object or array) values.
   * Different data structures are not guaranteed to work.
   * @return POST string representation of this object.
   * @throws Exception if the object doesn't have the expected structure.
   */
  toPOST : function() {
    this._logService.debug("CMTransferObject.toPOST");

    var post = "";

    if (this._isInitialized()) {
      var attributeValue;
      var attributeType;
      var innerObject;
      var arrayObj;
      var arrayLengthObj;
      var isStringArray;
      var arrayContents;
      var postName;

      for (var attribute in this._parsedObject) {
        attributeValue = this._parsedObject[attribute];
        attributeType = typeof(attributeValue);

        if ("" != post) {
          post += "&";
        }

        switch (attributeType) {
          case "function":
            this._parsedObject = null;
            this._logService.fatal(
              "CMTransferObject.toPOST: SECURITY ERROR, a function was found " +
              "in the transfer object.");

            throw Ce("Function found inside the transfer object.");
            break;

          case "object":
            innerObject = this.getObjectValue(attribute);
            innerObject.QueryInterface(Ci.gsICMTransferObject);

            if (innerObject.isArray()) {
              arrayObj = new Object();
              arrayLengthObj = new Object();
              // get the array.
              // XXX: we don't have type resolution in the transfer object, so
              // we have to use try / catch to determine the type.
              try {
                innerObject.getStringArray(arrayLengthObj, arrayObj);
                isStringArray = true;
              } catch (e) {
                try {
                  innerObject.getObjectArray(arrayLengthObj, arrayObj);
                  isStringArray = false;
                } catch (e) {
                  this._logService.error(
                    "CMTransferObject.toPOST: unexpected type of array.");

                  throw Ce(
                    "Unexpected type of array found converting to POST.");
                }
              }

              arrayContents = arrayObj.value;
              postName = attribute + "[]";

              if (0 != arrayContents.length) {
                if (isStringArray) {
                  post += this._getStringArrayPOST(postName, arrayContents);
                } else {
                  post += this._getObjectArrayPOST(postName, arrayContents);
                }
              } else {
                post += this._generatePOSTParameter(postName, "");
              }
            } else {
              this._logService.error(
                "CMTransferObject.toPOST: inner objects found in conversion " +
                "to POST format.");

              throw Ce("Inner objects found converting to POST.");
            }

            break;
          default:
            post += this._generatePOSTParameter(attribute, attributeValue);
            break;
        }
      }
    } else {
      this._logService.warn(
        "CMTransferObject.toPOST: The object has not been initialized.");
    }

    return post;
  },

  /**
   * Generates a POST string for a parameter with a given name and value.
   * @param aName the parameter name.
   * @param aValue the parameter value.
   * @return generated POST parameter string.
   */
  _generatePOSTParameter : function(aName, aValue) {
    this._logService.trace("CMTransferObject._generatePOSTParameter");

    var postString = encodeURIComponent(String(aName));
    var valueString = encodeURIComponent(String(aValue));

    if ("" != valueString) {
      postString += ("=" + encodeURIComponent(String(aValue)));
    }

    return postString;
  },

  /**
   * Obtains the POST string from a string array.
   * @param aName the name of the POST parameter.
   * @param aArray the string array to set as value.
   * @return POST string for the given string array.
   */
  _getStringArrayPOST : function(aName, aArray) {
    var arrayLength = aArray.length;
    var post = "";

    for (var i = 0; i < arrayLength; i++) {
      if (0 < i) {
        post += "&";
      }

      post += this._generatePOSTParameter(aName, aArray[i]);
    }

    return post;
  },

  /**
   * Obtains the POST string from an object array.
   * @param aName the name of the POST parameter.
   * @param aArray the object array to set as value.
   * @return POST string for the given object array.
   */
  _getObjectArrayPOST : function(aName, aArray) {
    var arrayLength = aArray.length;
    var post = "";
    var innerPOST;
    var innerPOSTParts;
    var innerPOSTPartLength;
    var part;
    var paramParts;
    var partName;
    var partValue;

    for (var i = 0; i < arrayLength; i++) {
      if (0 < i) {
        post += "&";
      }

      innerPOST = aArray[i].toPOST();
      innerPOSTParts = innerPOST.split("&");
      innerPOSTPartLength = innerPOSTParts.length;

      for (var j = 0; j < innerPOSTPartLength; j++) {
        if (0 < j) {
          post += "&";
        }

        part = innerPOSTParts[j];
        paramParts = part.split("=");
        // get the original values because they are encoded.
        partName = "[" + decodeURIComponent(paramParts[0]) + "]";
        partValue = (paramParts[1] ? decodeURIComponent(paramParts[1]) : "");
        // generate the post string.
        post += this._generatePOSTParameter((aName + partName), partValue);
      }
    }

    return post;
  },

  /**
   * Indicates if this object represents an array or not.
   * @return true if the object represents an array. false otherwise.
   * @throws Exception if the object has not been initialized.
   */
  isArray : function() {
    this._logService.debug("CMTransferObject.isArray");

    var isArrayObj = false;

    if (this._isInitialized()) {
      isArrayObj = this._isArray(this._parsedObject);

    } else {
      this._logService.error(
        "CMTransferObject.isArray: The object has not been initialized.");

      throw Ce("Object not initialized.");
    }

    return isArrayObj;
  },

  /**
   * Indicates if the given argument corresponds to an array.
   * This code is based on code from:
   * http://snipplr.com/view/1996/typeof--a-more-specific-typeof/
   * @param aValue the value to check wether it's an array or not.
   * @return true if the argument is an array. false otherwise.
   */
  _isArray : function(aValue) {
    this._logService.trace("CMTransferObject._isArray");

    var isArrayObj =
      (null != aValue) && ("object" == typeof(aValue)) &&
      (RE_ARRAY_CONSTRUCTOR.test(aValue.constructor.toString()));

    return isArrayObj;
  },

  /**
   * Indicates if the object holds a value identified by the given name.
   * @param aName the name of the value to look for.
   * @return true if the object has a value with the given name. false
   * otherwise.
   * @throws Exception if the object has not been initialized or if the object
   * represents an array.
   */
  hasValue : function(aName) {
    this._logService.trace("CMTransferObject.hasValue. Name: " + aName);

    var hasValue = false;

    if (!this.isArray()) {
      var attValue = this._parsedObject[aName];
      var attributeType;

      if (null == attValue) {
        attValue = this._parsedObject[aName + SUFFIX_ZIPPED_DATA];
        hasValue = ("string" == typeof(attValue));
      } else {
        attributeType = typeof(attValue);

        switch (attributeType) {
          case "function":
            this._parsedObject = null;
            this._logService.fatal(
              "CMTransferObject.hasValue: SECURITY ERROR, a function was " +
              "found in the transfer object.");

            throw Ce("Function found inside the transfer object.");
            break;

          case "undefined":
            hasValue = false;
            break;

          default:
            hasValue = true;
            break;
        }
      }
    } else {
      this._logService.error(
        "CMTransferObject.hasValue: The object is an array.");

      throw Ce("The object is an array.");
    }

    return hasValue;
  },

  /**
   * Removes a value from the transfer object by its name.
   * @param aName The name of the value to look for.
   * @return True if the value was found and removed, false otherwise.
   * @throws Exception if the object has not been initialized or if the object
   * represents an array.
   */
  removeValue : function(aName) {
    this._logService.trace("CMTransferObject.removeValue. Name: " + aName);

    var wasRemoved = false;

    if (this.hasValue(aName)) {
      delete this._parsedObject[aName];
      wasRemoved = true;
    }

    return wasRemoved;
  },

  /**
   * Gets the boolean value identified by the given name.
   * @param aName the name of the boolean value to obtain.
   * @return boolean value that corresponds to the name.
   * @throws Exception if the object has not been initialized, if the type
   * does not match the given name, or if the name is null or empty.
   */
  getBooleanValue : function(aName) {
    this._logService.debug("CMTransferObject.getBooleanValue. Name: " + aName);

    return this._getValue(aName, "boolean");
  },

  /**
   * Gets the boolean array represented by this object.
   * @param aLength the length of the resulting array.
   * @param aArray the resulting array.
   * @throws Exception if the object has not been initialized or if the object
   * is not an array or doesn't match the requested type.
   */
  getBooleanArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.getBooleanArray");

    this._getArray(aLength, aArray, "boolean");
  },

  /**
   * Sets the boolean value identified by the given name.
   * @param aName the name of the boolean value to set.
   * @param aValue the value to set.
   * @throws Exception if the name is null or empty.
   */
  setBooleanValue : function(aName, aValue) {
    this._logService.debug("CMTransferObject.setBooleanValue. Name: " + aName);

    this._setValue(aName, aValue);
  },

  /**
   * Sets this object to be a boolean array.
   * @param aLength the length of the array.
   * @param aArray the array to set.
   */
  setBooleanArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.setBooleanArray");

    this._initializeWithObject(aArray);
  },

  /**
   * Gets the integer value identified by the given name.
   * @param aName the name of the integer value to obtain.
   * @return integer value that corresponds to the name.
   * @throws Exception if the object has not been initialized, if the type
   * does not match the given name, or if the name is null or empty.
   */
  getIntegerValue : function(aName) {
    this._logService.debug("CMTransferObject.getIntegerValue. Name: " + aName);

    return this._getValue(aName, "number");
  },

  /**
   * Gets the integer array represented by this object.
   * @param aLength the length of the resulting array.
   * @param aArray the resulting array.
   * @throws Exception if the object has not been initialized or if the object
   * is not an array or doesn't match the requested type.
   */
  getIntegerArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.getIntegerArray");

    this._getArray(aLength, aArray, "number");
  },

  /**
   * Sets the integer value identified by the given name.
   * @param aName the name of the integer value to set.
   * @param aValue the value to set.
   * @throws Exception if the name is null or empty.
   */
  setIntegerValue : function(aName, aValue) {
    this._logService.debug("CMTransferObject.setIntegerValue. Name: " + aName);

    this._setValue(aName, aValue);
  },

  /**
   * Sets this object to be an integer array.
   * @param aLength the length of the array.
   * @param aArray the array to set.
   */
  setIntegerArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.setIntegerArray");

    this._initializeWithObject(aArray);
  },

  /**
   * Gets the string value identified by the given name.
   * @param aName the name of the string value to obtain.
   * @return string value that corresponds to the name.
   * @throws Exception if the object has not been initialized, if the type
   * does not match the given name, or if the name is null or empty.
   */
  getStringValue : function(aName) {
    this._logService.debug("CMTransferObject.getStringValue. Name: " + aName);

    return this._getValue(aName, "string");
  },

  /**
   * Gets the string array represented by this object.
   * @param aLength the length of the resulting array.
   * @param aArray the resulting array.
   * @throws Exception if the object has not been initialized or if the object
   * is not an array or doesn't match the requested type.
   */
  getStringArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.getStringArray");

    this._getArray(aLength, aArray, "string");
  },

  /**
   * Sets the string value identified by the given name.
   * @param aName the name of the string value to set.
   * @param aValue the value to set.
   * @throws Exception if a null string is passed.
   */
  setStringValue : function(aName, aValue) {
    this._logService.debug("CMTransferObject.setStringValue. Name: " + aName);

    // null strings are not allowed.
    if (null != aValue) {
      this._setValue(aName, aValue);
    } else {
      this._logService.error(
        "CMTransferObject.setStringValue. null string set.");

      throw Ce("null value used to set string.");
    }
  },

  /**
   * Sets this object to be a string array.
   * @param aLength the length of the array.
   * @param aArray the array to set.
   * @throws Exception if a null string is passed or if the name is null or
   * empty.
   */
  setStringArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.setStringArray");

    var noNulls = true;
    // verify no null values are found in the array.
    for (var i = 0; i < aLength; i++) {
      if (null == aArray[i]) {
        noNulls = false;
        break;
      }
    }

    if (noNulls) {
      this._initializeWithObject(aArray);
    } else {
      this._logService.error(
        "CMTransferObject.setStringArray. array with null strings set.");

      throw Ce("null value inside string array.");
    }
  },

  /**
   * Gets the object value identified by the given name.
   * @param aName the name of the object value to obtain.
   * @return gsICMTransferObject value that corresponds to the name.
   * @throws Exception if the object has not been initialized, if the type
   * does not match the given name, or if the name is null or empty.
   */
  getObjectValue : function(aName) {
    this._logService.debug("CMTransferObject.getObjectValue. Name: " + aName);

    var objectValue = null;
    var obj = this._getValue(aName, "object");

    if (obj instanceof Ci.gsICMTransferObject) {
      objectValue = obj;
    } else {
      // create a new JSON object.
      var jsonObj = new CMTransferObject();
      // initialize it with the obtained value.
      jsonObj._initializeWithObject(obj);
      // convert the object into a valid XPCOM wrapper.
      objectValue = this._utilityService.wrapJSObject(jsonObj);
      // set it locally for future reference.
      this._parsedObject[aName] = objectValue;
    }

    return objectValue;
  },

  /**
   * Gets the object array represented by this object.
   * @param aLength the length of the resulting array.
   * @param aArray the resulting array.
   * @throws Exception if the object has not been initialized or if the object
   * is not an array or doesn't match the requested type.
   */
  getObjectArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.getObjectArray");

    var resultLength;
    var obj;

    this._getArray(aLength, aArray, "object");
    resultLength = aLength.value;
    // initilize the objects in the array if necessary.
    for (var i = 0; i < resultLength; i++) {
      obj = aArray.value[i];

      if (!(obj instanceof Ci.gsICMTransferObject)) {
        // create a new JSON object.
        var jsonObj = new CMTransferObject();
        // initialize it with the obtained value.
        jsonObj._initializeWithObject(obj);
        // convert the object into a valid XPCOM wrapper.
        aArray.value[i] = this._utilityService.wrapJSObject(jsonObj);
        // set it locally for future reference.
        this._parsedObject[i] = aArray.value[i];
      }
    }
  },

  /**
   * Sets the object value identified by the given name.
   * @param aName the name of the object value to set.
   * @param aValue the gsICMTransferObject value to set.
   * @throws Exception if a null object is passed or if the name is null or
   * empty.
   */
  setObjectValue : function(aName, aValue) {
    this._logService.debug("CMTransferObject.setObjectValue. Name: " + aName);

    // null strings are not allowed.
    if (null != aValue) {
      this._setValue(aName, aValue);
    } else {
      this._logService.error(
        "CMTransferObject.setObjectValue. null object set.");

      throw Ce("null value used to set object.");
    }
  },

  /**
   * Sets this object to be an object array.
   * @param aLength the length of the array.
   * @param aArray the array to set.
   * @throws Exception if a null object is passed.
   */
  setObjectArray : function(aLength, aArray) {
    this._logService.debug("CMTransferObject.setObjectArray");

    var noNulls = true;
    // verify no null values are found in the array.
    for (var i = 0; i < aLength; i++) {
      if (null == aArray[i]) {
        noNulls = false;
        break;
      }
    }

    if (noNulls) {
      this._initializeWithObject(aArray);
    } else {
      this._logService.error(
        "CMTransferObject.setObjectArray. array with null objects set.");

      throw Ce("null value inside object array.");
    }
  },

  /**
   * Verifies that the attribute specified by the given name matches the given
   * type and then returns its value if it does.
   * @param aName the name of the attribute to verify and obtain.
   * @param aType the type to verify the attribute against.
   * @return the value that matches the given name and type.
   * @throws Exception if the object has not been initialized, if the type
   * does not match the given name, or if the name is null or empty.
   */
  _getValue : function(aName, aType) {
    this._logService.trace(
      "CMTransferObject._getValue. Name: " + aName + ", type: " + aType);

    var attributeValue = null;

    if ((null != aName) && ("" != aName)) {
      if (!this.isArray()) {
        var attValue = this._parsedObject[aName];

        if (null != attValue) {
          var attributeType = typeof(attValue);

          switch (attributeType) {
            case "function":
              this._parsedObject = null;
              this._logService.fatal(
                "CMTransferObject._getValue: SECURITY ERROR, a function was " +
                "found in the transfer object.");

              throw Ce("Function found inside the transfer object.");
              break;

            case aType:
              attributeValue = attValue;
              break;

            default:
              this._logService.error(
                "CMTransferObject._getValue: The type does not match the " +
                "name: " + aName);

              throw Ce(
                "The attribute type doesn't match the given name: " + aName);
              break;
          }
        } else if ("string" == aType) {
          // see if we have a zipped field.
          attValue = this._parsedObject[aName + SUFFIX_ZIPPED_DATA];

          if (null != attValue) {
            attributeValue =
              this._compressionService.uncompressZIP(
                decodeURIComponent(attValue));
          } else {
            this._logService.error(
              "CMTransferObject._getValue: null value found: " + aName);

            throw Ce("null value set for attribute: " + aName);
          }
        } else {
          this._logService.error(
            "CMTransferObject._getValue: null value found: " + aName);

          throw Ce("null value set for attribute: " + aName);
        }
      } else {
        this._logService.error(
          "CMTransferObject._getValue: The object is an array.");

        throw Ce("The object is an array.");
      }
    } else {
      this._logService.error(
        "CMTransferObject._getValue: The attribute name is invalid.");

      throw Ce("The attribute name is invalid.");
    }

    return attributeValue;
  },

  /**
   * Gets the array represented by this object if it matches the given type.
   * @param aLength the length of the resulting array.
   * @param aArray the resulting array.
   * @param aType the type to check the array members against.
   * @throws Exception if the object has not been initialized or if the object
   * is not an array or doesn't match the requested type.
   */
  _getArray : function(aLength, aArray, aType) {
    this._logService.trace("CMTransferObject._getArray");

    if (this.isArray()) {
      var thisLength = this._parsedObject.length;
      var attValue;
      var attributeType;
      var isCorrectType;
      // go through the array and verify the items have the correct type.
      for (var i = 0; i < thisLength; i++) {
        attValue = this._parsedObject[i];
        attributeType = typeof(attValue);
        isCorrectType = false;

        if (null != attValue) {
          switch (attributeType) {
            case "function":
              this._parsedObject = null;
              this._logService.fatal(
                "CMTransferObject._getArray: SECURITY ERROR, a function was " +
                "found in the transfer object.");

              throw Ce("Function found inside the transfer object.");
              break;

            case aType:
              isCorrectType = true;
              break;
          }
        } else {
          this._logService.error(
            "CMTransferObject._getArray: null value found.");
        }

        if (!isCorrectType) {
          this._logService.error(
            "CMTransferObject._getArray: The array does not hold the " +
            "requested type of element at index: " + i);

          throw Ce("Member of array is not the correct type.");
        }
      }
      // at this point all items should have the correct type.
      aLength.value = thisLength;
      aArray.value = this._parsedObject;

    } else {
      this._logService.error(
        "CMTransferObject._getArray: The object is not an array.");

      throw Ce("The object is not an array.");
    }
  },

  /**
   * Sets the value identified by the given name.
   * @param aName the name of the value to set.
   * @param aValue the value to set.
   * @throws Exception if the name is null or empty.
   */
  _setValue : function(aName, aValue) {
    this._logService.trace("CMTransferObject._setValue. Name: " + aName);

    if ((null != aName) && ("" != aName)) {
      if (!this._isInitialized() || this.isArray()) {
        this._parsedObject = new Object();
      }

      this._parsedObject[aName] = aValue;

    } else {
      this._logService.error(
        "CMTransferObject._setValue: The attribute name is invalid.");

      throw Ce("The attribute name is invalid.");
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICMTransferObject) && !aIID.equals(Ci.nsISupports)) {
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
var CMTransferObjectFactory = {
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

    return (new CMTransferObject()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CMTransferObjectModule = {
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
      return CMTransferObjectFactory;
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
  return CMTransferObjectModule;
}
