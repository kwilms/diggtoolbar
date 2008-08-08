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

// Notification type constants
const GS_DIGG_NOTIFICATION_TYPE_BOTTOM_BAR = 0;
const GS_DIGG_NOTIFICATION_TYPE_INNER_POPUP = 1;
const GS_DIGG_NOTIFICATION_TYPE_OUTER_POPUP = 2;

// Notification autohide constants
const GS_DIGG_NOTIFICATION_AUTOHIDE_NEVER_SHOW = 0;
const GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_FIVE = 1;
const GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_TEN = 2;
const GS_DIGG_NOTIFICATION_AUTOHIDE_KEEP_OPEN = 3;

// Notification animation constants
const GS_DIGG_EVENT_BOX_WIDTH = 520;
const GS_DIGG_EVENT_BOX_HEIGHT = 140;
const GS_DIGG_EVENT_ANIMATION_STEPS = 5;
const GS_DIGG_EVENT_ANIMATION_TIMEOUT = 50;

/**
 * Event Notification Viewer script.
 */
var gsDiggEventViewer = {

  /* Log service */
  _logService : null,
  /* Preference service */
  _prefService : null,
  /* Window manager */
  _windowManager : null,
  /* Observer service */
  _observerService : null,
  /* Event manager */
  _eventManager : null,
  /* Event notifier */
  _eventNotifier : null,
  /* Index of the current event being viewed */
  _eventIndex : 0,
  /* Total number of events available */
  _eventTotal : null,
  /* String bundle */
  _stringBundle : null,
  /* Auto-hide timeout id */
  _autohideTimer : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logService =
      Cc["@glaxstar.org/common/log-service;1"].
        getService(Ci.gsILoggingService);
    this._logService.debug("gsDiggEventViewer.init");

    this._eventNotifier =
      Cc["@glaxstar.org/digg/event-notifier;1"].
        getService(Ci.gsIDiggEventNotifier);
    this._eventManager =
      Cc["@glaxstar.org/digg/event-manager;1"].
        getService(Ci.gsIDiggEventManager);
    this._prefService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._windowManager =
      Cc['@mozilla.org/appshell/window-mediator;1'].
        getService(Ci.nsIWindowMediator);
    this._observerService =
      Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);

    this._stringBundle = document.getElementById('gs-digg-main-bundle');

    this._observerService.addObserver(
      this, this._eventNotifier.OBSERVER_TOPIC_NEW_EVENTS, false);
    this._observerService.addObserver(
      this, this._eventManager.OBSERVER_TOPIC_EVENT_COUNT_CHANGED, false);

    // Observers added to watch changes in the notification preferences
    this._prefService.QueryInterface(Ci.nsIPrefBranch2);
    this._prefService.addObserver(GS_DIGG_PREF_KEY_NOTIFY_NEWS, this, false);
    this._prefService.addObserver(GS_DIGG_PREF_KEY_NOTIFY_VIDEOS, this, false);
    this._prefService.addObserver(GS_DIGG_PREF_KEY_NOTIFY_IMAGES, this, false);
    this._prefService.addObserver(GS_DIGG_PREF_KEY_USER_NAME, this, false);
    this._prefService.addObserver(GS_DIGG_PREF_KEY_TOPIC_LIST, this, false);
    this._prefService.addObserver(GS_DIGG_PREF_KEY_CONTAINER_LIST, this, false);
    this._prefService.
      addObserver(GS_DIGG_PREF_KEY_NOTIFICATION_TYPE, this, false);
    this._prefService.QueryInterface(Ci.nsIPrefBranch);

    this._eventTotal = this._eventManager.getEventCount();
    this._updateStatusBarButton(this._eventTotal);
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logService.debug("gsDiggEventViewer.uninit");

    this._observerService.removeObserver(
      this, this._eventNotifier.OBSERVER_TOPIC_NEW_EVENTS);
    this._observerService.removeObserver(
      this, this._eventManager.OBSERVER_TOPIC_EVENT_COUNT_CHANGED);

    this._prefService.QueryInterface(Ci.nsIPrefBranch2);
    this._prefService.removeObserver(GS_DIGG_PREF_KEY_NOTIFY_NEWS, this);
    this._prefService.removeObserver(GS_DIGG_PREF_KEY_NOTIFY_VIDEOS, this);
    this._prefService.removeObserver(GS_DIGG_PREF_KEY_NOTIFY_IMAGES, this);
    this._prefService.removeObserver(GS_DIGG_PREF_KEY_USER_NAME, this);
    this._prefService.removeObserver(GS_DIGG_PREF_KEY_TOPIC_LIST, this);
    this._prefService.removeObserver(GS_DIGG_PREF_KEY_CONTAINER_LIST, this);
    this._prefService.removeObserver(GS_DIGG_PREF_KEY_NOTIFICATION_TYPE, this);
  },

  /**
   * Determines whether the event viewer is visible or not.
   * @return True if the viewer is visible, false otherwise.
   */
  _isViewerVisible : function() {
    this._logService.trace("gsDiggEventViewer._isViewerVisible");

    var popup = document.getElementById('gs-digg-event-popup');
    var bar = document.getElementById('gs-digg-event-bottom-bar');

    return ("open" == popup.state || false == bar.hidden);
  },

  /**
   * Toggles the visibility of the event viewer.
   */
  toggle : function() {
    this._logService.debug("gsDiggEventViewer.toggle");

    if (this._isViewerVisible()) {
      this._hide();
    } else {
      this._show();
    }
  },

  /**
   * Hides the event viewer if it is visible at the moment.
   */
  _hide : function() {
    this._logService.trace("gsDiggEventViewer._hide");

    var popup = document.getElementById('gs-digg-event-popup');
    if ("open" == popup.state) {
      this._animatePopup(false);
    }

    var bar = document.getElementById('gs-digg-event-bottom-bar');
    if (!bar.hidden) {
      this._animateBar(false);
    }
  },

  /**
   * Shows the next available event.
   */
  showNext : function() {
    this._logService.debug("gsDiggEventViewer.showNext");

    this._eventIndex++;
    this._loadEvent();
  },

  /**
   * Shows the previous available event.
   */
  showPrevious : function() {
    this._logService.debug("gsDiggEventViewer.showPrevious");

    this._eventIndex--;
    this._loadEvent();
  },

  /**
   * Loads the event determined by this._eventIndex in the viewer.
   * @return The loaded event object.
   */
  _loadEvent : function() {
    this._logService.trace("gsDiggEventViewer._loadEvent");

    var event = this._eventManager.getEventAtIndex(this._eventIndex);

    if (event != null) {

      var eventBoxes = [
        document.getElementById('gs-digg-event-popup-box'),
        document.getElementById('gs-digg-event-bottom-bar-box')];

      for (var i = 0; i < eventBoxes.length; i++) {
        eventBoxes[i].event = event;
        eventBoxes[i].setAttribute("leftNavigationDisabled",
          (this._eventIndex == 0));
        eventBoxes[i].setAttribute("rightNavigationDisabled",
          ((this._eventIndex + 1) >= this._eventTotal));
      }
    }

    return event;
  },

  /**
   * Shows the event viewer, displaying the event determined by
   * this._eventIndex.
   */
  _show : function() {
    this._logService.trace("gsDiggEventViewer._show");

    if (this._windowManager.getMostRecentWindow("navigator:browser") != window
        || this._isViewerVisible() || !window.document.hasFocus()) {
      return;
    }

    var event = this._loadEvent();
    if (null != event) {

      var notificationType =
        this._prefService.getIntPref(GS_DIGG_PREF_KEY_NOTIFICATION_TYPE);

      switch (notificationType) {

        case GS_DIGG_NOTIFICATION_TYPE_INNER_POPUP:
          var popup = document.getElementById('gs-digg-event-popup');
          var anchor = document.getElementById("browser-bottombox");
          popup.openPopup(anchor, "before_end", 0, 0, false, false);
          this._animatePopup(true);
          break;

        case GS_DIGG_NOTIFICATION_TYPE_OUTER_POPUP:
          var popup = document.getElementById('gs-digg-event-popup');
          var x = (window.screen.availWidth - GS_DIGG_EVENT_BOX_WIDTH);
          var y = (window.screen.availHeight - GS_DIGG_EVENT_BOX_HEIGHT);
          popup.openPopupAtScreen(x, y, false);
          this._animatePopup(true);
          break;

        default:
          var bar = document.getElementById('gs-digg-event-bottom-bar');
          bar.hidden = false;
          this._animateBar(true);
          break;
      }

      this.startAutoHide();
    }
  },

  /**
   * Starts the auto-hide timer depending on the current auto-hide preference.
   */
  startAutoHide : function() {
    this._logService.debug("gsDiggEventViewer.startAutoHide");

    this.stopAutoHide();

    var autohidePref =
      Application.prefs.get(GS_DIGG_PREF_KEY_NOTIFICATION_AUTOHIDE).value;

    var delay = null;
    if (GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_FIVE == autohidePref) {
      delay = 5000;
    } else if (GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_TEN == autohidePref) {
      delay = 10000;
    }

    if (null != delay) {
      var that = this;
      this._autohideTimer =
        window.setTimeout(function() { that._hide(); }, delay);
    }
  },

  /**
   * Stops the auto-hide timer.
   */
  stopAutoHide : function() {
    this._logService.debug("gsDiggEventViewer.stopAutoHide");
    window.clearTimeout(this._autohideTimer);
  },

  /**
   * Animates the notification popup (fade in/fade out).
   * @param aShow Whether to fade in (true) or fade out (false) the popup.
   */
  _animatePopup : function(aShow) {
    this._logService.trace("gsDiggEventViewer._animatePopup");

    var popup = document.getElementById('gs-digg-event-popup');
    var opacity;
    var increment;
    var limit;
    var animationFunction;

    if (aShow) {
      opacity = 0;
      increment = (100 / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = 100;
    } else {
      opacity = 100;
      increment = -(100 / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = 0;
    }

    animationFunction = function() {
      opacity += increment;
      popup.style.opacity = (opacity / 100);

      if (opacity != limit) {
        setTimeout(animationFunction, GS_DIGG_EVENT_ANIMATION_TIMEOUT);
      } else if (0 == opacity) {
        popup.hidePopup();
      }
    }
    animationFunction();
  },

  /**
   * Animates the notification bar (slide in/slide out).
   * @param aShow Whether to slide in (true) or slide out (false) the bar.
   */
  _animateBar : function(aShow) {
    this._logService.trace("gsDiggEventViewer._animateBar");

    var bar = document.getElementById('gs-digg-event-bottom-bar');
    var height;
    var increment;
    var limit;
    var animationFunction;

    if (aShow) {
      height = 0;
      increment = (GS_DIGG_EVENT_BOX_HEIGHT / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = GS_DIGG_EVENT_BOX_HEIGHT;
    } else {
      height = GS_DIGG_EVENT_BOX_HEIGHT;
      increment = -(GS_DIGG_EVENT_BOX_HEIGHT / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = 0;
    }

    animationFunction = function() {
      height += increment;
      bar.style.height = height + "px";

      if (height != limit) {
        setTimeout(animationFunction, GS_DIGG_EVENT_ANIMATION_TIMEOUT);
      } else if (0 == height) {
        bar.hidden = true;
      }
    }
    animationFunction();
  },

  /**
   * Updates the state of the status bar button (disabled property) depending
   * on the given event count.
   * @param aEventCount The number of available events.
   */
  _updateStatusBarButton : function(aEventCount) {
    this._logService.debug("gsDiggEventViewer._updateStatusBarButton");

    var image = document.getElementById('gs-digg-statusbar-image');

    if (0 >= aEventCount) {
      image.setAttribute("disabled", true);
      image.setAttribute("tooltiptext",
        this._stringBundle.getString("gs.digg.statusbar.disabled.tooltip"));
    } else {
      image.setAttribute("disabled", false);
      image.setAttribute("tooltiptext",
        this._stringBundle.getString("gs.digg.statusbar.enabled.tooltip"));
    }
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe: function(aSubject, aTopic, aData) {
    this._logService.debug("gsDiggEventViewer.observe");

    switch (aTopic) {
      case this._eventNotifier.OBSERVER_TOPIC_NEW_EVENTS:
        this._eventIndex = 0;

        var autohidePref =
          Application.prefs.get(GS_DIGG_PREF_KEY_NOTIFICATION_AUTOHIDE).value;

        if (GS_DIGG_NOTIFICATION_AUTOHIDE_NEVER_SHOW != autohidePref) {
          this._show();
        }
        break;

      case this._eventManager.OBSERVER_TOPIC_EVENT_COUNT_CHANGED:
        let newTotal = parseInt(aData);
        if (this._eventTotal != newTotal) {
          this._eventTotal = newTotal;
          this._updateStatusBarButton(this._eventTotal);
        }
        break;

      case "nsPref:changed":
        this._eventIndex = 0;
        this._hide();
        break;
    }
  }
};

window.addEventListener(
  "load", function() { gsDiggEventViewer.init(); }, false);
window.addEventListener(
  "unload", function() { gsDiggEventViewer.uninit(); }, false);
