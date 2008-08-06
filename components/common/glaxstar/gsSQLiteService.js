/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Ce = Components.Exception;
const CLASS_ID = Components.ID("{EC091935-C29C-417A-AD60-8DF0F5931773}");
const CLASS_NAME = "SQLite Service";
const CONTRACT_ID = "@glaxstar.org/common/sqlite-service;2";

// NSArray declaration.
const NSArray =
  new Components.Constructor("@mozilla.org/array;1", Ci.nsIMutableArray);
// HashPropertyBag declaration
const HashPropertyBag =
  new Components.Constructor("@mozilla.org/hash-property-bag;1",
    Ci.nsIWritablePropertyBag);

// General select statement.
const SELECT_STATEMENT = "SELECT * FROM ";
// General select statement limite.
const SELECT_STATEMENT_LIMIT = " LIMIT 1";

/**
 * SQLite service
 * Performs sqlite operations on a local database.
 */
function gsSQLiteService() {
  this._init();
}

gsSQLiteService.prototype = {

  /* Name of the folder that contains the database file */
  _dbFileFolder : null,
  /* Name of the database file */
  _dbFileName : null,
  /* Database connection */
  _dbConnection : null,
  /* Storage service */
  _storageService : null,
   /* Log service */
  _logService : null,
  /* Utility service */
  _utilityService : null,

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.trace("gsSQLiteService._init");

    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;1"].
        getService(Ci.gsIUtilityService);
    this._storageService =
      Cc["@mozilla.org/storage/service;1"].
        getService(Ci.mozIStorageService);
  },

  /**
   * Destroys the component. Closes the connection to the database, if any.
   */
  uninit : function() {
    this._logService.debug("gsSQLiteService.uninit");

    this._closeDBConnection();
  },

  /**
   * Initializes the database file values.
   * @param aDBFileFolder The name of the folder that contains the db file.
   * @param aDBFileName The name of the database file.
   */
  initialize : function(aDBFileFolder, aDBFileName) {
    this._logService.debug("gsSQLiteService.initialize");

    this._dbFileFolder = aDBFileFolder;
    this._dbFileName = aDBFileName;
  },

  /**
   * Obtains a connection to the database.
   * @return The connection object.
   * @throws Exception of the database file does not exist.
   */
  _getDBConnection : function() {
    this._logService.trace("gsSQLiteService._getDBConnection");

    if (null == this._dbConnection || !this._dbConnection.connectionReady) {
      var dbFile =
        this._utilityService.getExtensionFolder(this._dbFileFolder);

      dbFile.append(this._dbFileName);

      if (!dbFile.exists()) {
        throw Ce("The database file does not exist.");
      }

      this._dbConnection = this._storageService.openDatabase(dbFile);
    }

    return this._dbConnection;
  },

  /**
   * Closes the database connection.
   */
  _closeDBConnection : function() {
    this._logService.trace("gsSQLiteService._closeDBConnection");

    try {
      this._dbConnection.close();
      delete this._dbConnection;
      this._dbConnection = null;
    } catch (e) {
      this._dbConnection = null;
      this._logService.error("gsSQLiteService._closeDBConnection: " + e);
    }
  },

  /**
   * Creates a query statement based on the given string.
   * @param aQueryString The query string.
   * @return The query statement.
   */
  createStatement : function(aQueryString) {
    this._logService.debug("gsSQLiteService.createStatement");

    var db = this._getDBConnection();

    return db.createStatement(aQueryString);
  },

  /**
   * Executes a non query statement.
   * @param aQueryStatement The query statement to be executed.
   * @return The last inserted row id.
   */
  executeNonQuery : function(aQueryStatement) {
    this._logService.debug("gsSQLiteService.executeNonQuery");

    var db = this._getDBConnection();

    aQueryStatement.execute();

    return db.lastInsertRowID;
  },

  /**
   * Executes a query statement.
   * @param aQueryStatement The query statement to be executed.
   * @return The resulting set from the query.
   */
  executeQuery : function(aQueryStatement) {
    this._logService.debug("gsSQLiteService.executeQuery");

    var resultSet = new NSArray();
    var resultRow;
    var value;

    while (aQueryStatement.executeStep()) {
      resultRow = new HashPropertyBag();

      for (var i = 0; i < aQueryStatement.columnCount; i++) {
        value = "";
        switch (aQueryStatement.getTypeOfIndex(i)) {
          case aQueryStatement.VALUE_TYPE_NULL:
            value = aQueryStatement.getIsNull(i);
            break;
          case aQueryStatement.VALUE_TYPE_INTEGER:
            value = aQueryStatement.getInt32(i);
            break;
          case aQueryStatement.VALUE_TYPE_FLOAT:
            value = aQueryStatement.getDouble(i);
            break;
          case aQueryStatement.VALUE_TYPE_TEXT:
            value = aQueryStatement.getUTF8String(i);
            break;
          case aQueryStatement.VALUE_TYPE_BLOB:
            value = aQueryStatement.getBlob(i);
            break;
        }

        resultRow.setProperty(aQueryStatement.getColumnName(i), value);
      }

      resultSet.appendElement(resultRow, false);
    }

    aQueryStatement.reset();

    return resultSet;
  },

  /**
   * Checks if a column exists in the specified table.
   * @param aTable The table where to look for the column.
   * @param aColumn The column to look for in the table.
   * @return True if exists, false otherwise.
   */
  existsColumnInTable : function(aTable, aColumn) {
    this._logService.debug("gsSQLiteService.existsColumnInTable");

    var exists = false;
    var queryStatement =
      this.createStatement(SELECT_STATEMENT + aTable + SELECT_STATEMENT_LIMIT);

    queryStatement.executeStep();

    for (var i = queryStatement.columnCount - 1; 0 <= i; i--) {
      if (queryStatement.getColumnName(i) == aColumn) {
        exists = true;
        break;
      }
    }

    queryStatement.reset();

    return exists;
  },

  /**
   * Closes the database connection. Note that this won't work as expected in
   * versions before Firefox 3.
   */
  closeConnection : function() {
    this._logService.debug("gsSQLiteService.closeConnection");

    this._closeDBConnection();
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsISQLiteService) && !aIID.equals(Ci.nsISupports)) {
      throw Cr.NS_ERROR_NO_INTERFACE;
    }

    return this;
  }
};

/**
 * The nsIFactory interface allows for the creation of nsISupports derived
 * classes without specifying a concrete class type.
 * More: http://developer.mozilla.org/en/docs/nsIFactory
 */
var gsSQLiteServiceFactory = {
  createInstance: function (aOuter, aIID) {
    if (null != aOuter) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return (new gsSQLiteService()).QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsSQLiteServiceModule = {
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

    // Close db connection
    gsSQLiteService.uninit();

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
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    }

    if (aClass.equals(CLASS_ID)) {
      return gsSQLiteServiceFactory;
    }

    throw Cr.NS_ERROR_NO_INTERFACE;
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
  return gsSQLiteServiceModule;
}
