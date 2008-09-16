/***** BEGIN LICENSE BLOCK *****

Copyright (c) 2008, Digg Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.
* Neither the name of Digg Inc. nor the names of its contributors may be used to
endorse or promote products derived from this software without specific prior
written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***** END LICENSE BLOCK *****/

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Ce = Components.Exception;
const CLASS_ID = Components.ID("{8B2B8BB0-19A2-4AF7-BC48-B16133B2A841}");
const CLASS_NAME = "Digg Event DAO";
const CONTRACT_ID = "@glaxstar.org/digg/event-dao;1";

// Maximum number of events to store
const MAX_EVENTS = 50;

// Query to create an event
const QUERY_CREATE_EVENT =
  "INSERT INTO DIGGEVENT ("+
  "id, type, href, link, date, title, description, topic, media, " +
  "imageURL, diggs, comments, user, friends) " +
  "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)";
// Query to delete a preference.
const QUERY_DELETE_EVENT =
  "DELETE FROM DIGGEVENT WHERE id = ?1 AND type = ?2";
// Query to delete the oldest event
const QUERY_DELETE_OLDEST_EVENT =
  "DELETE FROM DIGGEVENT WHERE id in (SELECT id FROM DIGGEVENT " +
  "ORDER BY date ASC LIMIT 1 OFFSET 0)";
// Query to select an event by key.
const QUERY_SELECT_EVENT =
  "SELECT * FROM DIGGEVENT WHERE id = ?1 AND type = ?2";
// Query to select an event at a certain index.
const QUERY_SELECT_EVENT_AT_INDEX =
  "SELECT * FROM DIGGEVENT ORDER BY date DESC LIMIT 1 OFFSET ?1";
// Query to select the event count
const QUERY_SELECT_EVENT_COUNT =
  "SELECT COUNT(*) AS eventCount FROM DIGGEVENT";
// Query to truncate the event table.
const QUERY_CLEAR_EVENTS =
  "DELETE FROM DIGGEVENT";

// Constants for _bindParameters columns
const PARAM_INDEX_ID          = 0;
const PARAM_INDEX_TYPE        = 1;
const PARAM_INDEX_HREF        = 2;
const PARAM_INDEX_LINK        = 3;
const PARAM_INDEX_DATE        = 4;
const PARAM_INDEX_TITLE       = 5;
const PARAM_INDEX_DESCRIPTION = 6;
const PARAM_INDEX_TOPIC       = 7;
const PARAM_INDEX_MEDIA       = 8;
const PARAM_INDEX_IMAGEURL    = 9;
const PARAM_INDEX_DIGGS       = 10;
const PARAM_INDEX_COMMENTS    = 11;
const PARAM_INDEX_USER        = 12;
const PARAM_INDEX_FRIENDS     = 13;

/**
 * Manages events stored in the database.
 */
var gsDiggEventDAO = {

  /* Log service */
  _logService : null,
  /* SQLite service */
  _sqliteService : null,
  /* Utility service */
  _utilityService : null,

  /**
   * Initializes the component.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggEventDAO.init");

    this._sqliteService =
      Cc["@glaxstar.org/digg/sqlite-service;1"].
        getService(Ci.gsIDiggSQLiteService);
    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;2"].
        getService(Ci.gsIUtilityService);
  },

  /**
   * Inserts an event in the database.
   * @param aEvent The event object to be inserted.
   * @return True if the event was inserted, false if it already existed.
   * @throws Exception if the event is invalid.
   */
  insertEvent : function(aEvent) {
    this._logService.debug("gsDiggEventDAO.insertPreference");

    if (!this._isValidEvent(aEvent)) {
      throw Ce("Invalid event object");
    }

    var inserted = false;

    if (!this._exists(aEvent)) {
      var pstmt =
        this._sqliteService.createStatement(QUERY_CREATE_EVENT);
      pstmt = this._bindParameters(aEvent, pstmt);
      this._sqliteService.executeNonQuery(pstmt);

      this._deleteOldestEventIfLimitReached();
      inserted = this._exists(aEvent);
    }

    return inserted;
  },

  /**
   * Deletes the oldest event if the storage limit (preference) has been
   * reached.
   */
  _deleteOldestEventIfLimitReached : function() {
    this._logService.debug("gsDiggEventDAO.insertPreference");

    var count = this.getEventCount();

    while (MAX_EVENTS < count) {
      var pstmt =
        this._sqliteService.createStatement(QUERY_DELETE_OLDEST_EVENT);
      this._sqliteService.executeNonQuery(pstmt);
      count--;
    }
  },

  /**
   * Deletes an event from the database.
   * @param aEvent The event to be deleted.
   * @throws Exception if aEvent is invalid.
   */
  deleteEvent : function(aEvent) {
    this._logService.debug("gsDiggEventDAO.deleteEvent");

    if (!this._isValidEvent(aEvent)) {
      throw Ce("Invalid event object");
    }

    var pstmt =
      this._sqliteService.createStatement(QUERY_DELETE_EVENT);
    pstmt.bindUTF8StringParameter(0, aEvent.id);
    pstmt.bindInt32Parameter(1, aEvent.type);
    this._sqliteService.executeNonQuery(pstmt);
  },

  /**
   * Obtains the event object at the given index.
   * @param aIndex The index of the event to obtain.
   * @return The event at the given index. Null if no event is found.
   */
  getEventAtIndex : function(aIndex) {
    this._logService.debug("gsDiggEventDAO.getPreference");

    var event = null;
    var resultSet;
    var resultRow;
    var enu;
    var pstmt =
      this._sqliteService.createStatement(QUERY_SELECT_EVENT_AT_INDEX);

    pstmt.bindUTF8StringParameter(0, aIndex);
    resultSet = this._sqliteService.executeQuery(pstmt);

    enu = resultSet.enumerate();

    if (enu.hasMoreElements()) {
      resultRow = enu.getNext().QueryInterface(Ci.nsIPropertyBag);
      event = this._populateEvent(resultRow);
    }

    return event;
  },

  /**
   * Obtains the current number of events stored in the database.
   * @return The number of events.
   */
  getEventCount : function() {
    this._logService.debug("gsDiggEventDAO.getEventCount");

    var count = 0;
    var resultSet;
    var resultRow;
    var enu;
    var pstmt =
      this._sqliteService.createStatement(QUERY_SELECT_EVENT_COUNT);

    resultSet = this._sqliteService.executeQuery(pstmt);
    enu = resultSet.enumerate();

    if (enu.hasMoreElements()) {
      resultRow = enu.getNext().QueryInterface(Ci.nsIPropertyBag);
      count = parseInt(resultRow.getProperty("eventCount"));
    }

    return count;
  },

  /**
   * Truncates the event table from the database.
   */
  clearEvents : function() {
    this._logService.debug("gsDiggEventDAO.clearEvents");

    var pstmt =
      this._sqliteService.createStatement(QUERY_CLEAR_EVENTS);
    this._sqliteService.executeNonQuery(pstmt);
  },

  /**
   * Determines whether an event exists in the database.
   * @param aEvent The event to look for.
   * @return True if the event exists, false otherwise.
   */
  _exists : function(aEvent) {
    this._logService.trace("gsDiggEventDAO._exists");

    var pstmt = this._sqliteService.createStatement(QUERY_SELECT_EVENT);
    pstmt.bindUTF8StringParameter(0, aEvent.id);
    pstmt.bindInt32Parameter(1, aEvent.type);

    var resultSet = this._sqliteService.executeQuery(pstmt);
    var enu = resultSet.enumerate();

    return enu.hasMoreElements();
  },

  /**
   * Populates a gsIDiggEvent from a property bag.
   * @param aPropertyBag The property bag with the information.
   * @return The populated gsIDiggEvent object.
   */
  _populateEvent : function(aPropertyBag) {
    this._logService.trace("gsDiggEventDAO._populateEvent");

    var event =
      Cc["@glaxstar.org/digg/event;1"].createInstance(Ci.gsIDiggEvent);

    event.id = aPropertyBag.getProperty("id");
    event.type = aPropertyBag.getProperty("type");
    event.href = aPropertyBag.getProperty("href");
    event.link = aPropertyBag.getProperty("link");
    event.date = aPropertyBag.getProperty("date");
    event.title = aPropertyBag.getProperty("title");
    event.description = aPropertyBag.getProperty("description");
    event.topic = aPropertyBag.getProperty("topic");
    event.media = aPropertyBag.getProperty("media");
    event.imageURL = aPropertyBag.getProperty("imageURL");
    event.diggs = aPropertyBag.getProperty("diggs");
    event.comments = aPropertyBag.getProperty("comments");
    event.user = aPropertyBag.getProperty("user");
    event.friends = aPropertyBag.getProperty("friends");

    return event;
  },

  /**
   * Binds the parameters to a prepared statement.
   * @param aEvent The event object from which to extract the values.
   * @param aStatement The query statement.
   * @return aStatement with the bound parameters.
   */
  _bindParameters : function(aEvent, aStatement) {
    this._logService.trace("gsDiggEventDAO._bindParameters");

    aStatement.bindUTF8StringParameter(PARAM_INDEX_ID, aEvent.id);
    aStatement.bindInt32Parameter(PARAM_INDEX_TYPE, aEvent.type);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_HREF, aEvent.href);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_LINK, aEvent.link);
    aStatement.bindInt32Parameter(PARAM_INDEX_DATE, aEvent.date);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_TITLE, aEvent.title);
    aStatement.
      bindUTF8StringParameter(PARAM_INDEX_DESCRIPTION, aEvent.description);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_TOPIC, aEvent.topic);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_MEDIA, aEvent.media);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_IMAGEURL, aEvent.imageURL);
    aStatement.bindInt32Parameter(PARAM_INDEX_DIGGS, aEvent.diggs);
    aStatement.bindInt32Parameter(PARAM_INDEX_COMMENTS, aEvent.comments);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_USER, aEvent.user);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_FRIENDS, aEvent.friends);

    return aStatement;
  },

  /**
   * Determines whether the given event object is valid.
   * @param aEvent The event object to be validated.
   * @return True if valid, false if invalid.
   */
  _isValidEvent : function(aEvent) {
    this._logService.trace("gsDiggEventDAO._isValidEvent");

    var isValid = false;

    if ((aEvent instanceof Ci.gsIDiggEvent) &&
        (!this._utilityService.isNullOrEmpty(aEvent.id))) {
      isValid = true;
    }

    return isValid;
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggEventDAO) && !aIID.equals(Ci.nsISupports)) {
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
var gsDiggEventDAOFactory = {
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
      this._singletonObj = gsDiggEventDAO;
      gsDiggEventDAO.init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggEventDAOModule = {

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
      return gsDiggEventDAOFactory;
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
  return gsDiggEventDAOModule;
}
