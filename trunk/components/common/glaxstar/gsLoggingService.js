/**
 * Copyright © 2007 Glaxstar Ltd. All rights reserved.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Ce = Components.Exception;
const Cr = Components.results;
const CLASS_ID = Components.ID("{b3d1d390-63a8-11db-bd13-0800200c9a66}");
const CLASS_NAME = "Logging Service";
const CONTRACT_ID = "@glaxstar.org/common/log-service;1";

// Logging preference for level.
const GS_PREFERENCE_LOGLEVEL = "extensions.glaxstar.logger.level";
// Logging preference for appender.
const GS_PREFERENCE_APPENDER = "extensions.glaxstar.logger.appender";
// Logging preference for max size of file.
const GS_PREFERENCE_FILE_MAXSIZE = "extensions.glaxstar.logger.file.maxSize";
// Logging preference for max files.
const GS_PREFERENCE_FILE_MAXFILES = "extensions.glaxstar.logger.file.maxFiles";
// Logging preference for last backup file.
const GS_PREFERENCE_FILE_LASTBACKUP =
  "extensions.glaxstar.logger.file.lastBackup";
// Default max size.
const GS_DEFAULT_FILE_MAXSIZE = 10;
// Default max files.
const GS_DEFAULT_FILE_MAXFILES = 10;
// File name.
const GS_LOG_FILE_NAME = "log";
// File name plain extension.
const GS_LOG_FILE_PLAIN_EXTENSION = "txt";

/**
 * Logging Service.
 * Logs messages of various levels, through different output methods.
 */
var LoggingService = {
  /* Preferences service. */
  _firefoxPreferenceService : null,
  /* Current log level. */
  _logLevel : null,
  /* Current type of appender. */
  _appenderType : null,

  /**
   * Initialize the component.
   */
  _init : function() {
    dump("LoggingService._init\n");

    var observerService =
      Cc["@mozilla.org/observer-service;1"].
        getService(Ci.nsIObserverService);

    this._firefoxPreferenceService =
      Cc["@mozilla.org/preferences-service;1"].
        getService(Ci.nsIPrefBranch2);
    // register observers.
    this._firefoxPreferenceService.
      addObserver(GS_PREFERENCE_LOGLEVEL, this, false);
    this._firefoxPreferenceService.
      addObserver(GS_PREFERENCE_APPENDER, this, false);
    // initialize logging options.
    try {
      var logLevel =
        this._firefoxPreferenceService.getIntPref(GS_PREFERENCE_LOGLEVEL);

      this._updateLogLevel(logLevel);
    } catch (e) {
      this._firefoxPreferenceService.
        setIntPref(GS_PREFERENCE_LOGLEVEL, Ci.gsILoggingService.LEVEL_WARN);
      this._updateLogLevel(Ci.gsILoggingService.LEVEL_WARN);
    }

    try {
      this._appenderType =
        this._firefoxPreferenceService.getCharPref(GS_PREFERENCE_APPENDER);
    } catch (e) {
      this._firefoxPreferenceService.
        setCharPref(GS_PREFERENCE_APPENDER, this.APPENDER_FILE_PLAIN);
      this._appenderType = this.APPENDER_FILE_PLAIN;
    }
  },

  /**
   * Attempts to log a message in FATAL level.
   * @param aMessage the message to log.
   */
  fatal : function(aMessage) {
    this._logMessage(aMessage, Ci.gsILoggingService.LEVEL_FATAL);
  },

  /**
   * Attempts to log a message in ERROR level.
   * @param aMessage the message to log.
   */
  error : function(aMessage) {
    this._logMessage(aMessage, Ci.gsILoggingService.LEVEL_ERROR);
  },

  /**
   * Attempts to log a message in WARN level.
   * @param aMessage the message to log.
   */
  warn : function(aMessage) {
    this._logMessage(aMessage, Ci.gsILoggingService.LEVEL_WARN);
  },

  /**
   * Attempts to log a message in INFO level.
   * @param aMessage the message to log.
   */
  info : function(aMessage) {
    this._logMessage(aMessage, Ci.gsILoggingService.LEVEL_INFO);
  },

  /**
   * Attempts to log a message in DEBUG level.
   * @param aMessage the message to log.
   */
  debug : function(aMessage) {
    this._logMessage(aMessage, Ci.gsILoggingService.LEVEL_DEBUG);
  },

  /**
   * Attempts to log a message in TRACE level.
   * @param aMessage the message to log.
   */
  trace : function(aMessage) {
    this._logMessage(aMessage, Ci.gsILoggingService.LEVEL_TRACE);
  },

  /**
   * Attempts to log a message in the specified level.
   * @param aMessage the message to log.
   * @param aLevel the level of the message.
   */
  _logMessage : function(aMessage, aLevel) {
    if (this._logLevel >= aLevel) {
      var levelString = this._levelToString(aLevel);
      var timestamp = (new Date()).toUTCString();
      var logEntry;

      logEntry = "[" + timestamp + "]" + " " + levelString + " " + aMessage;

      // write it to the log.
      this._dumpLogEntry(logEntry);
    }
  },

  /**
   * Dumps a log entry depending of the current appender type.
   * @param aEntry the log entry to be dumped.
   */
  _dumpLogEntry : function(aEntry) {
    try {
      if (this._appenderType == this.APPENDER_CONSOLE_PLAIN) {
        dump(aEntry + "\n");
      } else {
        // XXX: look into keeping the output stream open as part of the
        // component instead of creating it every time.
        var foStream =
          Cc["@mozilla.org/network/file-output-stream;1"].
            createInstance(Ci.nsIFileOutputStream);
        var file = this._getLogFileReference();
        var entry = aEntry + "\r\n";
        // write, append, append.
        foStream.init(file, 0x02 | 0x08 | 0x10, 0664, 0);
        foStream.write(entry, entry.length);
        foStream.close();
      }
    } catch (e) {
      dump("LoggingService. Error: the log entry wasn't generated.\n");
    }
  },

  /**
   * Gets a reference to the log file, depending on preferences.
   * @return the reference to the log file.
   */
  _getLogFileReference : function() {
    var fileName = GS_LOG_FILE_NAME + "." + GS_LOG_FILE_PLAIN_EXTENSION;
    var file = this._getFileReference(fileName);
    var maxSize = this._getMaxFileSize();

    if (file.exists() && (file.fileSize >= maxSize)) {
      this._backupLogFile();
    }

    return file;
  },

  /**
   * Backups the current log file in the log directory with a new number.
   * If a backup file with the designated number already exists it is replaced.
   */
  _backupLogFile : function() {
    var nextNumber = this._getNextBackupNumber();
    var logFileName = GS_LOG_FILE_NAME + "." + GS_LOG_FILE_PLAIN_EXTENSION;
    var bakFileName =
      GS_LOG_FILE_NAME + "." + nextNumber + "." + GS_LOG_FILE_PLAIN_EXTENSION;
    var logFile;
    var bakFile;

    if (0 <= this._getMaxFiles()) {
      logFile = this._getFileReference(logFileName);

      if (logFile.exists()) {
        // remove file/plain backup file.
        bakFile =
          this._getFileReference(
            GS_LOG_FILE_NAME + "." + nextNumber + "." +
            GS_LOG_FILE_PLAIN_EXTENSION);

        if (bakFile.exists()) {
          bakFile.remove(false);
        }

        logFile.moveTo(null, bakFileName);
      }
    }
  },

  /**
   * Gets a reference to a specified file in the log directory.
   * @param aFileName the name of the file to get.
   * @return a nsIFile object.
   */
  _getFileReference : function(aFileName) {
    var utilityService =
      Cc["@glaxstar.org/common/utility-service;2"].
        getService(Ci.gsIUtilityService);

    var file = utilityService.getExtensionFolder(null);
    file.append(aFileName);

    return file;
  },

  /**
   * Converts a log level to its string representation.
   * @param aLevel the level to be converted.
   * @return the log level converted to string.
   */
  _levelToString : function(aLevel) {
    var levelStr = "";

    switch (aLevel) {
      case Ci.gsILoggingService.LEVEL_FATAL:
        levelStr = "FATAL";
        break;
      case Ci.gsILoggingService.LEVEL_ERROR:
        levelStr = "ERROR";
        break;
      case Ci.gsILoggingService.LEVEL_WARN:
        levelStr = "WARN ";
        break;
      case Ci.gsILoggingService.LEVEL_INFO:
        levelStr = "INFO ";
        break;
      case Ci.gsILoggingService.LEVEL_DEBUG:
        levelStr = "DEBUG";
        break;
      case Ci.gsILoggingService.LEVEL_TRACE:
        levelStr = "TRACE";
        break;
    }

    return levelStr;
  },

  /**
   * Obtains the max file size preference value.
   * @return the max file size allowed in bytes.
   */
  _getMaxFileSize : function() {
    var maxFileSize = -1;

    try {
      var prefValue =
        this._firefoxPreferenceService.getIntPref(GS_PREFERENCE_FILE_MAXSIZE);

      maxFileSize =
        ((0 < prefValue) ? prefValue : GS_DEFAULT_FILE_MAXSIZE) * 1024;
    } catch (e) {
      this._firefoxPreferenceService.
        setIntPref(GS_PREFERENCE_FILE_MAXSIZE, GS_DEFAULT_FILE_MAXSIZE);
      maxFileSize = GS_DEFAULT_FILE_MAXSIZE * 1024;
    }

    return maxFileSize;
  },

  /**
   * Obtains the max files preference value.
   * @return the value of the preference.
   */
  _getMaxFiles : function() {
    var maxFiles;

    try {
      var prefValue =
        this._firefoxPreferenceService.getIntPref(GS_PREFERENCE_FILE_MAXFILES);

      maxFiles = ((0 <= prefValue) ? prefValue : GS_DEFAULT_FILE_MAXFILES);
    } catch (e) {
      this._firefoxPreferenceService.
        setIntPref(GS_PREFERENCE_FILE_MAXFILES, GS_DEFAULT_FILE_MAXFILES);
      maxFiles = GS_DEFAULT_FILE_MAXFILES;
    }

    return maxFiles;
  },

  /**
   * Obtains the number of the next backup file.
   * @return the number of the next backup file.
   */
  _getNextBackupNumber : function() {
    var maxFiles = this._getMaxFiles();
    var logNumber;

    try {
      logNumber = this._firefoxPreferenceService.
        getIntPref(GS_PREFERENCE_FILE_LASTBACKUP);
      logNumber = (logNumber % maxFiles) + 1;
    } catch (e) {
      logNumber = 1;
    }

    this._firefoxPreferenceService.
      setIntPref(GS_PREFERENCE_FILE_LASTBACKUP, logNumber);

    return logNumber;
  },

  /**
   * Getter of the current log level
   * @return The current log level
   */
  get logLevel() {
    return this._logLevel;
  },

  /**
   * Setter of the log level.
   * @param aLogLevel The log level to be set.
   * @throws NS_ERROR_INVALID_ARG when the aLogLevel is null or not recognized.
   */
  set logLevel(aLogLevel) {
    if (!aLogLevel ||
        !((aLogLevel == Ci.gsILoggingService.LEVEL_OFF) ||
          (aLogLevel == Ci.gsILoggingService.LEVEL_FATAL) ||
          (aLogLevel == Ci.gsILoggingService.LEVEL_ERROR) ||
          (aLogLevel == Ci.gsILoggingService.LEVEL_WARN) ||
          (aLogLevel == Ci.gsILoggingService.LEVEL_DEBUG) ||
          (aLogLevel == Ci.gsILoggingService.LEVEL_INFO) ||
          (aLogLevel == Ci.gsILoggingService.LEVEL_TRACE))) {
      dump("LoggingService.set logLevel called with invalid argument.\n");
      throw Cr.NS_ERROR_INVALID_ARG;
    }

    this._firefoxPreferenceService.
      setIntPref(GS_PREFERENCE_LOGLEVEL, aLogLevel);
  },

  /**
   * Getter of the current appender type.
   * @return the current appender type.
   */
  get appenderType() {
    return this._appenderType;
  },

  /**
   * Setter of the apender type.
   * @param aAppenderType the appender type to be set.
   * @throws Exception when the appender type is not recognized.
   */
  set appenderType(aAppenderType) {
    if (!aApenderType ||
        !((aApenderType == this.APPENDER_FILE_PLAIN) ||
          (aApenderType == this.APPENDER_CONSOLE_PLAIN))) {
      dump("LoggingService.set appenderType called with invalid argument.\n");
      throw Ce("Invalid argument.");
    }

    this._firefoxPreferenceService.
      setCharPref(GS_PREFERENCE_LOGLEVEL, aAppenderType);
  },

  /**
   * Getter of the APPENDER_CONSOLE_PLAIN constant.
   * @return the APPENDER_CONSOLE_PLAIN constant.
   */
  get APPENDER_CONSOLE_PLAIN() {
    return "console/plain";
  },

  /**
   * Getter of the APPENDER_FILE_PLAIN constant.
   * @return the APPENDER_FILE_PLAIN constant.
   */
  get APPENDER_FILE_PLAIN() {
    return "file/plain";
  },

  /**
   * Updates the value of the logLevel property.
   * @param aLogLevel the log level to be set.
   */
  _updateLogLevel : function(aValue) {
    var newLogLevel = aValue;

    if (Ci.gsILoggingService.LEVEL_OFF > aValue) {
      newLogLevel = Ci.gsILoggingService.LEVEL_OFF;
    } else if (Ci.gsILoggingService.LEVEL_TRACE < aValue) {
      newLogLevel = Ci.gsILoggingService.LEVEL_TRACE;
    } else if ((aValue % 100) != 0) {
      newLogLevel = Math.floor(aValue / 100) * 100;
    }

    this._logLevel = newLogLevel;
  },

  /**
   * Updates the value of the appenderType property.
   * @param aLogLevel the appenderType to be set.
   */
  _updateAppenderType : function(aValue) {
    this._appenderType = aValue;
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    var prefValue = null;

    if (GS_PREFERENCE_LOGLEVEL == aData) {
      prefValue =
        this._firefoxPreferenceService.getIntPref(GS_PREFERENCE_LOGLEVEL);
      this._updateLogLevel(prefValue);
    } else if (GS_PREFERENCE_APPENDER == aData) {
      prefValue =
        this._firefoxPreferenceService.getCharPref(GS_PREFERENCE_APPENDER);
      this._updateAppenderType(prefValue);
    }
  },

  /**
   * The QueryInterface method provides runtime type discovery.
   * More: http://developer.mozilla.org/en/docs/nsISupports
   * @param aIID the IID of the requested interface.
   * @return the resulting interface pointer.
   */
  QueryInterface : function(aIID) {
    if (!aIID.equals(Ci.gsILoggingService) && !aIID.equals(Ci.nsISupports)) {
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
var LoggingServiceFactory = {
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
      this._singletonObj = LoggingService;
      LoggingService._init();
    }

    return this._singletonObj.QueryInterface(aIID);
  }
};

/**
 * The nsIModule interface must be implemented by each XPCOM component. It is
 * the main entry point by which the system accesses an XPCOM component.
 * More: http://developer.mozilla.org/en/docs/nsIModule
 */
var LoggingServiceModule = {
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
      return LoggingServiceFactory;
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
  return LoggingServiceModule;
}
