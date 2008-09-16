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
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{F1742075-5AAE-427B-B5C1-21E3B2EE4547}");
const CLASS_NAME = "Setup Service";
const CONTRACT_ID = "@glaxstar.org/digg/setup-service;1";

// The quit application observer topic
const OBSERVER_TOPIC_QUIT_APPLICATION = "quit-application";
// The extension manager action requested observer topic
const OBSERVER_TOPIC_EM_ACTION_REQUESTED = "em-action-requested";
// Digg UUID constant
const DIGG_UUID = "{671c8440-f787-11dc-95ff-0800200c9a66}";
// Key of the notify container list preference
const PREF_KEY_CONTAINER_LIST = "extensions.digg.notify.container.list";

/**
 * Setup service. Performs actions when installing or uninstalling the add-on.
 */
var gsDiggSetupService = {

  /* Log service */
  _logService : null,
  /* Observer service */
  _observerService : null,
  /* Utility service */
  _utilityService : null,
  /* SQLite service */
  _sqliteService : null,
  /* Main Digg service */
  _mainDiggService : null,
  /* Preference service */
  _preferenceService : null,

  /* Flag to uninstall the extension on exit */
  _willUninstall : false,

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.trace("gsDiggSetupService._init");

    this._observerService =
      Cc["@mozilla.org/observer-service;1"].
        getService(Ci.nsIObserverService);
    this._utilityService =
      Cc["@glaxstar.org/common/utility-service;2"].
        getService(Ci.gsIUtilityService);
    this._sqliteService =
      Cc["@glaxstar.org/digg/sqlite-service;1"].
        getService(Ci.gsIDiggSQLiteService);
    this._mainDiggService =
      Cc["@glaxstar.org/digg/main-service;1"].
        getService(Ci.gsIDiggMainService);
    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].
        getService(Ci.nsIPrefBranch);

    this._observerService.
      addObserver(this, OBSERVER_TOPIC_QUIT_APPLICATION, false);
    this._observerService.
      addObserver(this, OBSERVER_TOPIC_EM_ACTION_REQUESTED, false);
  },

  /**
   * Sets the default value for the containers preference.
   */
  setContainers : function() {
    this._logService.debug("gsDiggSetupService.setContainers");

    try {
      this._mainDiggService.listContainers(
        {
          handleLoad: function(aResultCount, aResults) {
            gsDiggSetupService.
              _setContainersLoadHandler(aResultCount, aResults);
          }
        });
    } catch(e) {
      this._logService.error("gsDiggSetupService.setContainers: " + e);
    }
  },

  /**
   * Handles the response from the listContainers method. Sets the default
   * values of the containers preference.
   * @param aResultCount The number of objects contained in the response.
   * @param aResults The array of objects in the response.
   */
  _setContainersLoadHandler : function(aResultCount, aResults) {
    this._logService.trace("gsDiggSetupService._setContainersLoadHandler");

    var containerList = "";

    if (aResultCount > 0) {
      var containerElementList = aResults[0].QueryInterface(Ci.nsIArray);
      var containerEnumerator = containerElementList.enumerate();
      var containerDTO = null;

      while (containerEnumerator.hasMoreElements()) {
        containerDTO = containerEnumerator.getNext();
        containerDTO.QueryInterface(Ci.gsIDiggContainerDTO);

        containerList += "\"" + containerDTO.shortName + "\",";
      }
      if (containerList != "") {
        containerList = containerList.substr(0, containerList.length - 1);
      }
    }

    this._preferenceService.
      setCharPref(PREF_KEY_CONTAINER_LIST, containerList);
  },

  /**
   * Runs the clean up of the digg files, directories and preferences.
   */
  _runCleanUp : function() {
    this._logService.trace("gsDiggSetupService._runCleanUp");

    var installFolder = null;

    try {
      // close the sqlite db connection.
      this._sqliteService.closeConnection();
    } catch (e) {
      this._logService.error("gsDiggSetupService._runCleanUp: " + e);
    }

    try {
      // remove the folder.
      installFolder = this._utilityService.getExtensionFolder("Digg");
      if (installFolder.exists() && installFolder.isDirectory()) {
        installFolder.remove(true);
      }
    } catch (e) {
      this._logService.error("gsDiggSetupService._runCleanUp: " + e);
    }
  },

  /**
   * Checks whether the extension needs to be uninstalled and runs the
   * clean uo process.
   */
  _verifyUninstall : function() {
    this._logService.trace("gsDiggSetupService._verifyUninstall");

    if (this._willUninstall) {
      this._runCleanUp();
    }
  },

  /**
   * Sets the digg extension status when uninstalling or canceling the
   * uninstall.
   * @param aSubject the addon object
   * @param aData the selected action
   */
  _setUninstallStatus : function(aSubject, aData) {
    this._logService.trace("gsDiggSetupService._setUninstallStatus");

    aSubject.QueryInterface(Ci.nsIUpdateItem);
    if (DIGG_UUID == aSubject.id) {
      switch (aData) {
        case "item-cancel-action":
          this._willUninstall = false;
          break;
        case "item-uninstalled":
          this._willUninstall = true;
          break;
      }
    }
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logService.debug("gsDiggSetupService.observe");

    switch(aTopic) {
      case OBSERVER_TOPIC_QUIT_APPLICATION:
        this._verifyUninstall();
        break;
      case OBSERVER_TOPIC_EM_ACTION_REQUESTED:
        this._setUninstallStatus(aSubject, aData);
        break;
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggSetupService) &&
        !aIID.equals(Ci.gsICMLoadHandler) &&
        !aIID.equals(Ci.gsICMErrorHandler) && !aIID.equals(Ci.nsISupports)) {
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
var gsDiggSetupServiceFactory = {
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
      throw(Cr.NS_ERROR_NO_AGGREGATION);
    }
    // in this case we need a unique instance of the service.
    if (!this._singletonObj) {
      this._singletonObj = gsDiggSetupService;
      gsDiggSetupService._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the setup entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggSetupServiceModule = {
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
      throw(Cr.NS_ERROR_NOT_IMPLEMENTED);
    }

    if (aClass.equals(CLASS_ID)) {
      return gsDiggSetupServiceFactory;
    }

    throw(Cr.NS_ERROR_NO_INTERFACE);
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
  return gsDiggSetupServiceModule;
}
