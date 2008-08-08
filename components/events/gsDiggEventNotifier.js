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
const CLASS_ID = Components.ID("{BB37C0E7-D3AB-494A-8C5E-A95B68E04705}");
const CLASS_NAME = "Event Notifier";
const CONTRACT_ID = "@glaxstar.org/digg/event-notifier;1";

// Key of the snooze preference
const PREF_KEY_SNOOZE = "extensions.digg.snooze";

/**
 * Event Notifier. Uses the event manager to check for new events once every
 * certain amount of time, and sends out notifications using an observer topic.
 */
var gsDiggEventNotifier = {

  /* Log service */
  _logService : null,
  /* Digg API service */
  _apiService : null,
  /* Event manager */
  _eventManager : null,
  /* Preference service */
  _prefService : null,
  /* Observer service */
  _observerService : null,
  /* Timer to check for events */
  _timer : null,
  /* Throttle time (milliseconds, how often the event checkup occurs) */
  _throttle : (3 * 60 * 1000), // Default is 3 minutes
  /* The most recent event Id, used to determine if there are in fact new events
    since last check */
  _mostRecentEventId : null,

  /**
   * Getter of the "new events" observer topic.
   * @return The "new events" observer topic string.
   */
  get OBSERVER_TOPIC_NEW_EVENTS() {
    return "gs-digg-new-events-observer-topic";
  },

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].getService(Ci.gsILoggingService);
    this._logService.trace("gsDiggEventNotifier._init");

    this._apiService =
      Cc["@glaxstar.org/digg/api-service;1"].getService(Ci.gsIDiggAPIService);
    this._eventManager =
      Cc["@glaxstar.org/digg/event-manager;1"].
        getService(Ci.gsIDiggEventManager);
    this._prefService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._observerService =
      Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
    this._timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

    this._prefService.QueryInterface(Ci.nsIPrefBranch2);
    this._prefService.addObserver(PREF_KEY_SNOOZE, this, false);
    this._prefService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Initialize the timer for notifications. This method is required to delay
   * the timer startup until the startup service initializes the API.
   */
  initialize : function() {
    this._logService.debug("gsDiggEventNotifier.initialize");

    this.checkForEvents();
    this._updateTimer();
    this._updateThrottle();
  },

  /**
   * Updates the notifications timer according to the snooze preference.
   */
  _updateTimer : function() {
    this._logService.trace("gsDiggEventNotifier._updateTimer");

    var snoozed = this._prefService.getBoolPref(PREF_KEY_SNOOZE);

    this._timer.cancel();
    if (!snoozed) {
      this._timer.initWithCallback(
        { notify: function(aTimer) {
            gsDiggEventNotifier.checkForEvents();
            gsDiggEventNotifier._updateThrottle();
          }
        }, this._throttle, Ci.nsITimer.TYPE_REPEATING_SLACK);
    }
  },

  /**
   * Uses the event manager to check for new events. If there are, in fact, new
   * events available then the "new events" topic is fired. Only executes if
   * the snooze preference is set to false.
   */
  checkForEvents : function() {
    this._logService.debug("gsDiggEventNotifier.checkForEvents");

    if (!this._prefService.getBoolPref(PREF_KEY_SNOOZE)) {
      this._eventManager.fetchNewEvents(
        { handleLoad: function(aResultCount, aResults) {
          gsDiggEventNotifier.checkForEventsLoadHandler(aResultCount, aResults);
        }});
    }
  },

  /**
   * Handles the checkForEvents response. Notifies the observers of the "new
   * events" topic if there are new events available.
   * @param aResultCount The number of results contained in aResults.
   * @param aResults The array of returned objects.
   */
  checkForEventsLoadHandler : function(aResultCount, aResults) {
    this._logService.trace("gsDiggEventNotifier.checkForEventsLoadHandler");

    if (aResults && aResultCount == 1 &&
        aResults[0].QueryInterface(Ci.nsISupportsPRBool).data) {

      let mostRecentEvent = this._eventManager.getEventAtIndex(0);
      if (mostRecentEvent && mostRecentEvent.id != this._mostRecentEventId) {
        this._mostRecentEventId = mostRecentEvent.id;

        this._observerService.notifyObservers(
          null, this.OBSERVER_TOPIC_NEW_EVENTS, null);
      }
    }
  },

  /**
   * Calls the getThrottle API method to obtain the throttle value. The throttle
   * is updated in the callback if its value differs from the local one.
   */
  _updateThrottle : function() {
    this._logService.trace("gsDiggMainService._updateThrottle");

    var tranObject =
      Cc["@glaxstar.org/common/cm-transfer-object;1"].
        createInstance(Ci.gsICMTransferObject);

    this._apiService.api.getThrottle(
      tranObject,
      { handleLoad : function(aResult) {
          gsDiggEventNotifier._updateThrottleLoadHanadler(aResult);
        }
      },
      { handleError : function(aError) {
          gsDiggEventNotifier._updateThrottleLoadHanadler(aError);
        }
      });
  },

  /**
   * Handles the response from the _updateThrottle method. If the throttle
   * value is different from the local one, the timer is updated.
   * @param aResult The result transfer object returned by the server.
   */
  _updateThrottleLoadHanadler : function(aResult) {
    this._logService.trace("gsDiggMainService._updateThrottleLoadHanadler");

    try {
      if (aResult instanceof Ci.gsICMTransferObject &&
          !aResult.hasValue("error") &&
          aResult.hasValue("seconds")) {

        var newThrottle = parseInt(aResult.getStringValue("seconds")) * 1000;

        if (this._throttle != newThrottle) {
          this._throttle = newThrottle;
          this._updateTimer();
        }
      } else {
        this._logService.warn(
          "gsDiggMainService._updateThrottleLoadHanadler: Result had errors");
      }
    } catch (e) {
      this._logService.error(
        "gsDiggMainService._updateThrottleLoadHanadler: " + e);
    }
  },

  /**
   * Observes changes in the snooze notifications preference.
   * @param aSubject The object that experienced the change.
   * @param aTopic The topic being observed.
   * @param aData The data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logService.debug("gsDiggEventNotifier.observe");

    if (PREF_KEY_SNOOZE == String(aData)) {
      this._updateTimer();
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsIDiggEventNotifier) &&
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
var gsDiggEventNotifierFactory = {
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
      this._singletonObj = gsDiggEventNotifier;
      gsDiggEventNotifier._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var gsDiggEventNotifierModule = {
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
      return gsDiggEventNotifierFactory;
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
  return gsDiggEventNotifierModule;
}
