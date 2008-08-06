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
const CLASS_ID = Components.ID("{27a89bc0-f7a8-11dc-95ff-0800200c9a66}");
const CLASS_NAME = "Startup Service";
const CONTRACT_ID = "@glaxstar.org/digg/startup-service;1";

/**
 * Startup service
 * Performs startup operations.
 */
var gsDiggStartupService = {

  /* Log service */
  _logService : null,
  /* API service */
  _apiService : null,
  /* Observer service */
  _observerService : null,
  /* SQLite service */
  _sqliteService : null,
  /* Setup service */
  _setupService : null,
  /* Flag that indicates whether the setup wizard has been shown */
  _setupWizardShown : false,

  /**
   * Initializes the component
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggStartupService.init");

    this._apiService =
      Cc["@glaxstar.org/digg/api-service;1"].
        getService(Ci.gsIDiggAPIService);
    this._observerService =
      Cc["@mozilla.org/observer-service;1"].
        getService(Ci.nsIObserverService);
    this._sqliteService =
      Cc["@glaxstar.org/digg/sqlite-service;1"].
        getService(Ci.gsIDiggSQLiteService);
    this._setupService =
      Cc["@glaxstar.org/digg/setup-service;1"].
        getService(Ci.gsIDiggSetupService);

    // initialize api service, and then initialize everything else.
    this._observerService.addObserver(
      this, this._apiService.OBSERVER_TOPIC_API_CONNECTED, false);
    this._apiService.initialize();
  },

  /**
   * Unregisters the user specific datasource
   */
  uninit : function() {
    this._logService.debug("gsDiggStartupService.uninit");

    this._observerService.removeObserver(
      this, this._apiService.OBSERVER_TOPIC_API_CONNECTED);
  },

  /**
   * Indicates whether or not this is the first time the user is running the
   * extension.
   * @return True if this is the first run, false otherwise.
   */
  get isFirstRun() {
    this._logService.debug("gsDiggStartupService.isFirstRun[get]");

    return !this._sqliteService.databaseExisted;
  },

  /**
   * Indicates whether or not the setup wizard has been shown already.
   * @return True if it has been shown already, false if not.
   */
  get setupWizardShown() {
    this._logService.debug("gsDiggStartupService.setupWizardShown[get]");
    return this._setupWizardShown;
  },

  /**
   * Activates the "setup wizard shown" flag.
   */
  setSetupWizardShown : function() {
    this._logService.debug("gsDiggStartupService.setSetupWizardShown");
    this._setupWizardShown = true;
  },

  /**
   * Runs the startup procedures that depend on having a connection with the
   * API.
   */
  _startConnection : function() {
    this._logService.trace("gsDiggStartupService._startConnection");

    if (this.isFirstRun) {
      this._setupService.setContainers();
    } else {
      // start fetching events
      var eventNotifier =
        Cc["@glaxstar.org/digg/event-notifier;1"].
          getService(Ci.gsIDiggEventNotifier);
      eventNotifier.initialize();
    }
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe: function(aSubject, aTopic, aData) {
    this._logService.debug("gsDiggStartupService.observe");

    if (this._apiService.OBSERVER_TOPIC_API_CONNECTED == aTopic) {
      var isConnected = ("true" == aData);
      if (isConnected) {
        this._startConnection();
      }
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggStartupService) &&
        !aIID.equals(Ci.nsISupports)) {
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
var gsDiggStartupServiceFactory = {
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
      this._singletonObj = gsDiggStartupService;
      gsDiggStartupService.init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggStartupServiceModule = {
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
    gsDiggStartupService.uninit();

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
      return gsDiggStartupServiceFactory;
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
  return gsDiggStartupServiceModule;
}
