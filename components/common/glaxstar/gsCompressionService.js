/**
 * Copyright © 2007-2008 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{AB035496-11E7-4E8C-A150-CF51A6581521}");
const CLASS_NAME = "Compression Service";
const CONTRACT_ID = "@glaxstar.org/common/compression-service;1";

// The maximum size of block to read, in bytes.
const READ_BLOCK_SIZE = 512;
// Character mapping for Base 64 conversions.
const ENCODE_MAPPING =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Compression service. It handles compression and uncompression of strings.
 */
var CompressionService = {
  /* Log service. */
  _logService : null,
  /* Utility service. */
  _utilityService : null,
  /* Base 64 encoder. */
  _encoder : null,

  /**
   * Initialize the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("CompressionService._init");

    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;2"].
        getService(Ci.gsIUtilityService);
    this._encoder = new Base64Encoder();
  },

  /**
   * Uncompresses a string of data using the ZIP algorithm.
   * @param aData the data to uncompress. It must be an UTF-8 encoded
   * representation of a ZIP file, holding a single file entry. The name of the
   * entry must not begin with '_' or '.'.
   * @return uncompressed data.
   * @throws Exception if the data string is null, or the data format is
   * invalid.
   */
  uncompressZIP : function(aData) {
    this._logService.debug("CompressionService.uncompressZIP");

    var zipReader =
      Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
    var foStream =
      Cc["@mozilla.org/network/file-output-stream;1"].
        createInstance(Ci.nsIFileOutputStream);
    var zipInputStream =
      Cc["@mozilla.org/scriptableinputstream;1"].
        createInstance(Ci.nsIScriptableInputStream);
    // XXX: the interface changed on Gecko 1.9, so we need to validate this.
    var isGecko18Reader = ("function" == typeof(zipReader.init));
    var tempFile = this._utilityService.getExtensionFolder(null);
    var tempFileId = (new Date()).getTime(); // good enough for uniqueness.
    var unzipped = "";
    var foundEntry = false;
    var byteArray;
    var binaryData;
    var zipEntryEnum;
    var zipEntry;
    var zipEntryName;
    var block;
    var firstChar;

    if (null == aData) {
      this._logService.error(
        "CompressionService.uncompressZIP: null data received.");

      throw Ce("null data to uncompress.");
    }

    byteArray = this._encoder.decodeString(aData);
    binaryData = this._encoder.stringifyArray(byteArray);
    // create a temporary file with the received data.
    tempFile.append("Zip-" + tempFileId + ".zip");
    // write, create, truncate.
    foStream.init(tempFile, 0x02 | 0x08 | 0x20, 0664, 0);
    foStream.write(binaryData, binaryData.length);

    if (foStream instanceof Ci.nsISafeOutputStream) {
      foStream.finish();
    } else {
      foStream.close();
    }

    this._logService.debug(
      "CompressionService.uncompressZIP: Temp file written.");

    try {
      // use the zip reader to extract a file with the unzipped data.
      // XXX handle changes in nsIZipReader for FF3
      if (isGecko18Reader) {
        zipReader.init(tempFile);
        zipReader.open();
        zipEntryEnum = zipReader.findEntries("*"); // all entries.

        // look for the first valid entry. All entries starting with a _ or a .
        // will be ignored, as well as any additional entries.
        while (!foundEntry && zipEntryEnum.hasMoreElements()) {
          zipEntry = zipEntryEnum.getNext();
          zipEntry.QueryInterface(Ci.nsIZipEntry);
          firstChar = zipEntry.name.charAt(0);
          foundEntry = (("." != firstChar) && ("_" != firstChar));
        }
      } else {
        zipReader.open(tempFile);
        zipEntryEnum = zipReader.findEntries("*"); // all entries.
        // look for the first valid entry. All entries starting with a _ or a .
        // will be ignored, as well as any additional entries.
        while (!foundEntry && zipEntryEnum.hasMore()) {
          zipEntry = zipEntryEnum.getNext();
          firstChar = zipEntry.charAt(0);
          foundEntry = (("." != firstChar) && ("_" != firstChar));
        }
      }

      if (!foundEntry) {
        this._logService.error(
          "CompressionService.uncompressZIP: no valid entries in the ZIP.");
        throw Ce("There are no valid entries in the ZIP.");
      }

      zipEntryName = (isGecko18Reader ? zipEntry.name : zipEntry);
      zipInputStream.init(zipReader.getInputStream(zipEntryName));

      // read the contents of the zip file into our return value.
      do {
        block = zipInputStream.read(READ_BLOCK_SIZE);
        unzipped += block;
      } while (0 < block.length);
      // close streams.
      zipInputStream.close();
      zipReader.close();
    } catch (e) {
      this._logService.error(
        "CompressionService.uncompressZIP: Invalid ZIP string:\n" + e);
      throw Ce("Invalid ZIP string.");
    } finally {
      // remove the temporary file.
      tempFile.remove(false);
      this._logService.debug(
        "CompressionService.uncompressZIP: Temp file removed.");
    }

    return unzipped;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsICompressionService) &&
        !aIID.equals(Ci.nsISupports)) {
      throw(Cr.NS_ERROR_NO_INTERFACE);
    }

    return this;
  }
};

/**
 * Base64 en/decoder. Based from
 * http://lxr.mozilla.org/mozilla1.8/source/toolkit/components/url-classifier/
 * content/moz/base64.js
 * XXX: this is copied verbatim on the EncryptionService and CompressionService.
 * If we need to use it in more places then we should move it to a the utility
 * service, perhaps.
 */
function Base64Encoder() {
  this._init();
}

Base64Encoder.prototype = {
  /**
   * We want quick mappings back and forth, so we precompute two maps.
   */
  _init : function() {
    this._byteToCharMap = new Object();
    this._charToByteMap = new Object();

    for (var i = 0; i < ENCODE_MAPPING.length; i++) {
      this._byteToCharMap[i] = ENCODE_MAPPING.charAt(i);
      this._charToByteMap[this._byteToCharMap[i]] = i;
    }
  },

  /**
   * Base64-encode an array of bytes.
   * @param aInput an array of bytes (numbers with value in [0, 255]) to encode.
   * @return String containing the base64 encoding.
   */
  encodeByteArray : function(aInput) {
    var output = new Array();
    var i = 0;
    var byte1;
    var byte2;
    var byte3;
    var haveByte2;
    var haveByte3;
    var outByte1;
    var outByte2;
    var outByte3;
    var outByte4;

    if (!(aInput instanceof Array)) {
      throw Ce("encodeByteArray takes an array as a parameter");
    }

    while (i < aInput.length) {
      byte1 = aInput[i];
      haveByte2 = ((i + 1) < aInput.length);
      byte2 = (haveByte2 ? aInput[i + 1] : 0);
      haveByte3 = ((i + 2 ) < aInput.length);
      byte3 = (haveByte3 ? aInput[i + 2] : 0);
      outByte1 = byte1 >> 2;
      outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
      outByte3 = ((byte2 & 0x0F) << 2) | (byte3 >> 6);
      outByte4 = byte3 & 0x3F;

      if (!haveByte3) {
        outByte4 = 64;

        if (!haveByte2) {
          outByte3 = 64;
        }
      }

      output.push(this._byteToCharMap[outByte1]);
      output.push(this._byteToCharMap[outByte2]);
      output.push(this._byteToCharMap[outByte3]);
      output.push(this._byteToCharMap[outByte4]);
      i += 3;
    }

    return output.join("");
  },

  /**
   * Base64-decode a string.
   * @param aInput String to decode.
   * @return Array of bytes representing the decoded value.
   * @throws Exception is the input string is invalid.
   */
  decodeString : function(aInput) {
    var output = new Array();
    var i = 0;
    var byte1;
    var byte2;
    var byte3;
    var byte4;
    var outByte1;
    var outByte2;
    var outByte3;

    if (aInput.length % 4) {
      throw Ce("Length of b64-encoded data must be zero mod four");
    }

    while (i < aInput.length) {
      byte1 = this._charToByteMap[aInput.charAt(i)];
      byte2 = this._charToByteMap[aInput.charAt(i + 1)];
      byte3 = this._charToByteMap[aInput.charAt(i + 2)];
      byte4 = this._charToByteMap[aInput.charAt(i + 3)];

      if ((byte1 === undefined) || (byte2 === undefined) ||
          (byte3 === undefined) || (byte4 === undefined)) {
        throw Ce("String contains characters not in our alphabet: " + aInput);
      }

      outByte1 = (byte1 << 2) | (byte2 >> 4);
      output.push(outByte1);

      if (byte3 != 64) {
        outByte2 = ((byte2 << 4) & 0xF0) | (byte3 >> 2);
        output.push(outByte2);

        if (byte4 != 64) {
          outByte3 = ((byte3 << 6) & 0xC0) | byte4;
          output.push(outByte3);
        }
      }

      i += 4;
    }

    return output;
  },

  /**
   * Helper function that turns a string into an array of numbers.
   * @param aString String to arrify.
   * @return Array holding numbers corresponding to the UCS character codes
   * of each character in aString.
   */
  arrayifyString : function(aString) {
    var output = new Array();

    for (var i = 0; i < aString.length; i++) {
      output.push(aString.charCodeAt(i));
    }

    return output;
  },

  /**
   * Helper function that turns an array of numbers into the string given by the
   * concatenation of the characters to which the numbers correspond (got
   * that?).
   * @param aArray Array of numbers representing characters.
   * @return Stringification of the array.
   */
  stringifyArray : function(aArray) {
    var output = new Array();

    for (var i = 0; i < aArray.length; i++) {
      output[i] = String.fromCharCode(aArray[i]);
    }

    return output.join("");
  }
};

/**
 * The nsIFactory interface allows for the creation of nsISupports derived
 * classes without specifying a concrete class type.
 * More: http://developer.mozilla.org/en/docs/nsIFactory
 */
var CompressionServiceFactory = {
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
      this._singletonObj = CompressionService;
      CompressionService._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var CompressionServiceModule = {
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
      return CompressionServiceFactory;
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
  return CompressionServiceModule;
}
