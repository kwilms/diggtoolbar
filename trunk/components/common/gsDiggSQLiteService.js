/***** BEGIN LICENSE BLOCK *****

The contents of this file are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
License for the specific language governing rights and limitations
under the License.

The Original Code is GLaxstar Ltd code.

The Initial Developer of the Original Code is Glaxstar Ltd.
Portions created by the Initial Developer are
Copyright (C) 2008 Digg Inc. All Rights Reserved.

Contributor(s):
  Jose Enrique Bolanos <jose@glaxstar.com>
  Andres Hernandez <andres@glaxstar.com>
  Erik van Eykelen <erik@glaxstar.com>

***** END LICENSE BLOCK *****/

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Ce = Components.Exception;
const CLASS_ID = Components.ID("{882150c0-fb5c-11dc-95ff-0800200c9a66}");
const CLASS_NAME = "Digg SQLite Service";
const CONTRACT_ID = "@glaxstar.org/digg/sqlite-service;1";

// Digg database file name.
const SQLITE_FILENAME = "digg.sqlite";
// Digg database template file name.
const SQLITE_TEMPLATE = "digg.template.sqlite";
// Digg extension UUID
const DIGG_UUID = "{671c8440-f787-11dc-95ff-0800200c9a66}";

/**
 * Digg SQLite service
 * Initializes the Digg database and performs operations on it.
 */
var gsDiggSQLiteService = {

  /* SQLite database service */
  _dbService : null,

  /* Log service */
  _logService : null,
  /* Utility service */
  _utilityService : null,

  /* Holds the value for the databaseExisted property */
  _databaseExisted : null,

  /**
   * Initializes the component.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggSQLiteService.init");

    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;1"].
        getService(Ci.gsIUtilityService);
    this._dbService =
      Cc["@glaxstar.org/common/sqlite-service;2"].
        createInstance(Ci.gsISQLiteService);

    this._initializeDatabase();
  },

  /**
   * Destroys the service.
   */
  uninit : function() {
    this._logService.debug("gsDiggSQLiteService.uninit");
  },

  /**
   * Indicates whether or not the database file existed when the service was
   * initialized.
   */
  get databaseExisted() {
    this._logService.debug("gsDiggSQLiteService.databaseExisted[get]");
    return this._databaseExisted;
  },

  /**
   * Copies the default database file (if necessary), and initializes the
   * database service.
   */
  _initializeDatabase : function() {
    this._logService.trace("gsDiggSQLiteService._initializeDatabase");

    this._databaseExisted = true;

    var dbFile = this._utilityService.getExtensionFolder("Digg");
    dbFile.append(SQLITE_FILENAME);

    if (!dbFile.exists()) {
      this._databaseExisted = false;

      var defaultFile = this._utilityService.getDefaultsFolder(DIGG_UUID);
      defaultFile.append(SQLITE_TEMPLATE);
      defaultFile.copyTo(dbFile.parent, dbFile.leafName);
    }

    this._dbService.initialize("Digg", SQLITE_FILENAME);
  },

  /**
   * Closes the database connection. Note that this won't work as expected in
   * versions before Firefox 3.
   */
  closeConnection : function() {
    this._logService.debug("gsDiggSQLiteService.closeConnection");

    this._dbService.closeConnection();
  },

  /**
   * Creates a query statement based on the given string.
   * @param aQueryString The query string.
   * @return The query statement.
   */
  createStatement : function(aQueryString) {
    this._logService.debug("gsDiggSQLiteService.createStatement");

    return this._dbService.createStatement(aQueryString);
  },

  /**
   * Executes a non query statement.
   * @param aQueryStatement The query statement to be executed.
   * @return The last inserted row id.
   */
  executeNonQuery : function(aQueryStatement) {
    this._logService.debug("gsDiggSQLiteService.executeNonQuery");

    return this._dbService.executeNonQuery(aQueryStatement);
  },

  /**
   * Executes a query statement.
   * @param aQueryStatement The query statement to be executed.
   * @return The resulting set from the query.
   */
  executeQuery : function(aQueryStatement) {
    this._logService.debug("gsDiggSQLiteService.executeQuery");

    return this._dbService.executeQuery(aQueryStatement);
  },

  /**
   * Checks if a column exists in the specified table.
   * @param aTable The table where to look for the column.
   * @param aColumn The column to look for in the table.
   * @return True if exists, false otherwise.
   */
  existsColumnInTable : function(aTable, aColumn) {
    this._logService.debug("gsDiggSQLiteService.existsColumnInTable");

    return this._dbService.existsColumnInTable(aTable, aColumn);
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggSQLiteService) && !aIID.equals(Ci.nsISupports)) {
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
var gsDiggSQLiteServiceFactory = {
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
  createInstance: function(aOuter, aIID) {
    if (aOuter != null) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    // in this case we need a unique instance of the service.
    if (!this._singletonObj) {
      this._singletonObj = gsDiggSQLiteService;
      gsDiggSQLiteService.init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggSQLiteServiceModule = {
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
  unregisterSelf : function (aCompMgr, aLocation, aLoaderStr) {

    // Close db connection
    gsDiggSQLiteService.uninit();

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
      return gsDiggSQLiteServiceFactory;
    }

    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  /**
   * This method may be queried to determine whether or not the component
   * module can be unloaded by XPCOM.
   * @param aCompMgr the global component manager.
   * @return true if the module can be unloaded by XPCOM. false otherwise.
   */
  canUnload: function(aCompMgr) {
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
  return gsDiggSQLiteServiceModule;
}
