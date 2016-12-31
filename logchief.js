(function() {

  /**
   * @namespace
   * @name logger
   * @description Make logging simple and hierarchical. This project API is close to Java Logging
   *              and Slf4j. And it is well tested with Karma.
   *              <p><strong>Warning</strong>, by default, debug message are not logged.</p>
   *              <p>The root logger (window.logger) is a {@link logger.Logger}.</p> 
   * @example 
   * var mylogger = window.logger.get("com.example.afunctionality");
   * mylogger.info("a super log message") 
   * if(mylogger.isInfo) {
   *   mylogger.info("a complex message : " + JSON.stringify(somedata)) 
   * }
   */

  /**
   * @namespace
   * @name levels
   * @memberof logger
   * @description All available levels
   */

  var root = this;
  var defaultlevel = 1;

  var setConfig0 = function(config, key, value) {
    if (value === undefined) {
      delete config[key];
    } else {
      config[key] = value;
    }
    var nb = 0;
    for (var k in config) {
      nb++;
    }
    return nb == 2;
  };

  var builder = {
    noop: function() {
    },
    createLogFun: function(type, name, logger) {
      var logFn = logger._console[type];
      var formatter = logger._formatter;

      if (!logFn) { return this.noop; }

      return function(arg) {
        Array.prototype.unshift.call(arguments, name);
        var formatted = formatter.apply(formatter, arguments);
        if(formatted && typeof formatted !== "string" && formatted.length) {
          logFn.apply(logger._console, formatted);
        } else {
          logFn(formatted);
        }
      };
    },
    parameters: ["level", "console", "formatter"],
    logNames: ['debug', 'info', 'warn', 'error'],
    loggerCache: {},
    loggerConfig: [],
    eachConfig: function(list, loggerPath, action, inverse) {
      for (var i = list.length - 1; i >= 0; i--) {
        var path = inverse ? loggerPath : list[i].path;
        var path2 = inverse ? list[i].path : loggerPath;
        if (path2.length >= path.length) {
          var j = 0;
          for (; j < path.length; j++) {
            if (path[j] != path2[j]) {
              break;
            }
          }
          if (j == path.length) {
            if (action(list[i], path.length)) {
              list.splice(i, 1);
            }
          }
        }
      }
    },
    formatName: function(name, localName) {
      if (name && localName) {
        name = localName + "." + name;
      }
      if (!name && localName) {
        name = localName;
      }
      if (!name) {
        name = "";
      }
      return name;
    },
    setConfig: function(name, key, value) {
      var found;
      for (var j = 0; j < this.loggerConfig.length; j++) {
        if (this.loggerConfig[j].loggerName === name) {
          found = this.loggerConfig[j];
          if (setConfig0(this.loggerConfig[j], key, value)) {
            this.loggerConfig.splice(j, 1);
          }
          break;
        }
      }
      if (!found) {
        var newConfig = {
          loggerName: name,
          path: name.split(".")
        };
        found = newConfig;
        if (!setConfig0(newConfig, key, value)) {
          this.loggerConfig.push(newConfig);
        }
      }
      this.initAll(found.path);
    },
    resetLevels: function() {
      this.logNamesCapitalized = [];
      for (var i = 0; i < this.logNames.length; i++) {
        this.logNamesCapitalized.push(this.logNames[i].substring(0, 1).toUpperCase() + this.logNames[i].substring(1));
      }

      var level = function(nb) {
        return function(name) {
          this.builder.setConfig(this.builder.formatName(name, this.loggerName), "level", nb);
        };
      };

      Logger.prototype.levels = {};

      for (var j = 0; j < this.logNames.length; j++) {
        Logger.prototype.levels[this.logNames[j]] = j;
        Logger.prototype["level" + this.logNamesCapitalized[j]] = level(j);
      }
      var offLevel = Logger.prototype.levels.off = this.logNames.length;
      Logger.prototype.levelOff = function(name) {
        this.builder.setConfig(this.builder.formatName(name, this.loggerName), "level", offLevel);
      };
      this.initAll();
    },
    resetParameters: function() {
      var paramFactory = function(parameter) {
        return function(value, name) {
          if (value === undefined) {
            return this["_" + parameter];
          } else {
            this.builder.setConfig(this.builder.formatName(name, this.loggerName), parameter, value);
          }
        };
      };

      var unsetParamFactory = function(parameter) {
        return function(name) {
          name = this.builder.formatName(name, this.loggerName);
          if (!name) { throw new Error("cannot unset root " + parameter+" but you can override it"); }
          this.builder.setConfig(name, parameter);
        };
      };

      for (var i = 0; i < this.parameters.length; i++) {
        var name = this.parameters[i];
        Logger.prototype[name] = paramFactory(name);
        Logger.prototype["unset" + name.substring(0, 1).toUpperCase() + name.substring(1)] = unsetParamFactory(name);
      }
      this.initAll();
    },
    postInit: [function(logger) {
      for (var k = 0; k < this.logNames.length; k++) {
        if (k < logger._level) {
          logger[this.logNames[k]] = this.noop;
        } else {
          logger[this.logNames[k]] = this.createLogFun(this.logNames[k], logger.loggerName, logger);
        }
        logger["is" + this.logNamesCapitalized[k]] = logger[this.logNames[k]] !== this.noop;
      }
    }],
    init: function(logger) {
      var max = [];
      for (var i = 0; i < this.parameters.length; i++) {
        max.push(-1);
      }
      var self = this;
      this.eachConfig(this.loggerConfig, logger.path, function(config, pathlength) {
        for (var k = 0; k < self.parameters.length; k++) {
          if (max[k] < pathlength && config[self.parameters[k]] !== undefined) {
            logger["_" + self.parameters[k]] = config[self.parameters[k]];
            max[k] = pathlength;
          }
        }
      });

      for (var k = 0; k < this.postInit.length; k++) {
        this.postInit[k].call(this, logger);
      }
    },
    initAll: function(path) {
      if (!path || !path.length) {
        if (_logger) {
          this.init(_logger);
        }
        for (var key in this.loggerCache) {
          this.init(this.loggerCache[key]);
        }
      } else {
        var all = [];
        for (var k in this.loggerCache) {
          all.push(this.loggerCache[k]);
        }
        var self = this;
        builder.eachConfig(all, path, function(logger) {
          self.init(logger);
        }, true);
      }
    }
  };

  /**
   * @classdesc Logger implementation
   * @class
   * @protected
   * @name Logger
   * @param {string} name
   * @memberof logger
   */

  function Logger(name) {
    this.loggerName = name || "";
    this.path = name ? name.split(".") : [];
  }

  var _logger;

  Logger.prototype.builder = builder;
  builder.resetLevels();
  builder.resetParameters();

  /**
   * @description Get or create a logger with the given name.
   * @function get
   * @param {string}
   *          name Logger name
   * @memberof logger.Logger#
   * @example 
   * var mylogger = window.logger.get("com.example");
   * mylogger.debug("message"); 
   * mylogger.info("message");
   * mylogger.warn("message"); 
   * mylogger.error("message");
   * @example <caption>Use the global logger</caption>
   * window.logger.debug("message"); 
   * window.logger.info("message");
   * window.logger.warn("message"); 
   * window.logger.error("message");
   * @example <caption>Create a relative logger</caption>
   * var mylogger = window.logger.get("com.example");
   * var sublogger = sublogger.get("sub"); // window.logger.get("com.example.sub")
   */
  Logger.prototype.get = function(name) {
    if (!name) { return this; }
    var builder = this.builder;
    name = builder.formatName(name, this.loggerName);
    var logger = builder.loggerCache[name];
    if (!logger) {
      builder.loggerCache[name] = logger = new Logger(name);
      builder.init(logger);
    }
    return logger;
  };

  /**
   * @description Reset the current logger and all its children
   * @function reset
   * @memberof logger.Logger#
   * @example 
   * var mylogger = window.logger.get("com.example");
   * mylogger.reset();
   * @example <caption>Reset all loggers</caption>
   *          window.logger.reset();
   */
  Logger.prototype.reset = function() {
    this.builder.eachConfig(this.builder.loggerConfig, this.path, function() {
      return true;
    }, true);
    if (!this.loggerName) {
      // root logger
      this.builder.loggerConfig.push({
        formatter: function(name, arg) {
          if (arg instanceof Error) {
            if (arg.stack) {
              arg = (arg.message && arg.stack.indexOf(arg.message) === -1) ? 'Error: ' + arg.message + '\n' + arg.stack : arg.stack;
            } else if (arg.sourceURL) {
              arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
            }
          }
          if (name) {
            arg = name + " - " + arg;
          }
          return [arg];
        },
        console: root.console || {},
        level: 1,
        loggerName: "",
        path: []
      });

    }
    this.builder.initAll(this.path);
  };

  /**
   * @description Set/Get the logging message formatter. By default, it formats error and add
   *              the name of the logger.
   * @function formatter
   * @param {function(object,string)} [formatter]
   * @param {string} [name] logger name
   * @memberof logger.Logger#
   * @example 
   *     window.logger.formatter(function(value) { 
   *       return value.toUpperCase(); 
   *     });
   * @example 
   *     var currentFormatter = window.logger.formatter();
   * @example <caption>With the logger name</caption> 
   *     window.logger.formatter(function(value, name) { 
   *       return (name ? name + " - " : "") + value.toUpperCase(); 
   *     });
   * @example <caption>a formatter for a specific log</caption> 
   *     var mylogger = window.logger.get("com.example");
   *     mylogger.formatter(function(value, name) { 
   *       return value.toUpperCase();
   *     });
   * @example <caption>a formatter for a specific log from the root logger</caption>
   *     window.logger.formatter(function(value, name) { 
   *       return value.toUpperCase();
   *     }, "com.example");
   */

  /**
   * @description Set/Get the console. By default, it is the global console.
   * @function console
   * @param {console} [console]
   * @param {string} [name] logger name
   * @memberof logger.Logger#
   * @example 
   *     window.logger.console({
   *       debug: function(msg) { ... },
   *       info: function(msg) { ... },
   *       warn: function(msg) { ... },
   *       error: function(msg) { ... }
   *     });
   * @example <caption>a console for a specific log</caption> 
   *     var mylogger = window.logger.get("com.example");
   *     mylogger.console({
   *       debug: function(msg) { ... },
   *       info: function(msg) { ... },
   *       warn: function(msg) { ... },
   *       error: function(msg) { ... }
   *     });
   * @example <caption>a console for a specific log from the root logger</caption> 
   *     window.logger.console({
   *       debug: function(msg) { ... },
   *       info: function(msg) { ... },
   *       warn: function(msg) { ... },
   *       error: function(msg) { ... }
   *     }, "com.example");
   */

  /**
   * @description Set/Get the logging level.
   * @function level
   * @param {integer}
   *          level
   * @param {string}
   *          [package]
   * @memberof logger.Logger#
   * @example <caption>Change the default level</caption>
   *          window.logger.level(window.logger.levels.debug)
   * @example <caption>Change the level for a specific package</caption>
   *          window.logger.level(window.logger.levels.warn, "com.example")
   * @example <caption>Get the default level</caption> window.logger.level()
   * @example <caption>Get the default level for a specific package</caption>
   *          window.logger.get("com.example").level()
   */

  /**
   * @description Remove a logging level.
   * @function unsetLevel
   * @param {string}
   *          [package]
   * @memberof logger.Logger#
   * @example <caption>Remove all logging level.</caption>
   *          window.logger.unsetLevel()
   * @example <caption>Remove the level for a specific package</caption>
   *          window.logger.unsetLevel("com.example")
   * @example <caption>Remove the level for a specific logger</caption>
   *          var mylogger = window.logger.get("com.example");
   *          mylogger.unsetLevel()
   */

  /**
   * @description Set the logging level to debug.
   * @function levelDebug
   * @param {string}
   *          [package]
   * @memberof logger.Logger#
   * @example <caption>Change the default level</caption>
   *          window.logger.levelDebug()
   * @example <caption>Change the level for a specific package</caption>
   *          window.logger.levelDebug("com.example")
   * @example <caption>Change the level from a logger</caption>
   *          var mylogger = window.logger.get("com.example");
   *          mylogger.levelDebug()
   */
  /**
   * @description Set the logging level to info.
   * @function levelInfo
   * @param {string}
   *          [package]
   * @memberof logger.Logger#
   * @example <caption>Change the default level</caption>
   *          window.logger.levelInfo()
   * @example <caption>Change the level for a specific package</caption>
   *          window.logger.levelInfo("com.example")
   * @example <caption>Change the level from a logger</caption>
   *          var mylogger = window.logger.get("com.example");
   *          mylogger.levelInfo()
   */
  /**
   * @description Set the logging level to warn.
   * @function levelWarn
   * @param {string}
   *          [package]
   * @memberof logger.Logger#
   * @example <caption>Change the default level</caption>
   *          window.logger.levelWarn()
   * @example <caption>Change the level for a specific package</caption>
   *          window.logger.levelWarn("com.example")
   * @example <caption>Change the level from a logger</caption>
   *          var mylogger = window.logger.get("com.example");
   *          mylogger.levelWarn()
   */
  /**
   * @description Set the logging level to error.
   * @function levelError
   * @param {string}
   *          [package]
   * @memberof logger.Logger#
   * @example <caption>Change the default level</caption>
   *          window.logger.levelError()
   * @example <caption>Change the level for a specific package</caption>
   *          window.logger.levelError("com.example")
   * @example <caption>Change the level from a logger</caption>
   *          var mylogger = window.logger.get("com.example");
   *          mylogger.levelError()
   */
  /**
   * @description Set the logging level to off (no logging).
   * @function levelOff
   * @param {string}
   *          [package]
   * @memberof logger.Logger#
   * @example <caption>Change the default level</caption>
   *          window.logger.levelOff()
   * @example <caption>Change the level for a specific package</caption>
   *          window.logger.levelOff("com.example")
   * @example <caption>Change the level from a logger</caption>
   *          var mylogger = window.logger.get("com.example");
   *          mylogger.levelOff()
   */
  /**
   * @description The debug level 0.
   * @constant {integer} debug
   * @memberof logger.Logger.levels
   * @example window.logger.levels.debug;
   */
  /**
   * @description The info level 1.
   * @constant {integer} info
   * @memberof logger.levels
   * @example window.logger.levels.info;
   */
  /**
   * @description The warn level 2.
   * @constant {integer} warn
   * @memberof logger.levels
   * @example window.logger.levels.warn;
   */
  /**
   * @description The error level 3.
   * @constant {integer} error
   * @memberof logger.levels
   * @example window.logger.levels.error;
   */
  /**
   * @description The off level 4.
   * @constant {integer} off
   * @memberof logger.levels
   * @example window.logger.levels.off;
   */
  /**
  * @description Log debug message.
  * @function debug
  * @param {string|Error}
  *          message
  * @memberof logger.Logger#
  * @example logger.debug("message")
  */
  /**
   * @description Log info message.
   * @function info
   * @param {string|Error}
   *          message
   * @memberof logger.Logger#
   * @example logger.info("message")
   */
  /**
   * @description Log warn message.
   * @function warn
   * @param {string|Error}
   *          message
   * @memberof logger.Logger#
   * @example logger.warn("message")
   */
  /**
   * @description Log error message.
   * @function error
   * @param {string|Error}
   *          message
   * @memberof logger.Logger#
   * @example logger.error("message")
   */

  /**
   * @description is Log debug.
   * @var {boolean} isDebug
   * @memberof logger.Logger#
   * @example logger.isDebug
   */
  /**
   * @description is Log info.
   * @var {boolean} isInfo
   * @memberof logger.Logger#
   * @example logger.isInfo
   */
  /**
   * @description is Log warn.
   * @var {boolean} isWarn
   * @memberof logger.Logger#
   * @example logger.isWarn
   */
  /**
   * @description is Log error.
   * @var {boolean} isError
   * @memberof logger.Logger#
   * @example logger.isError
   */

  _logger = new Logger();
  _logger.reset();

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = logger;
    }
    exports.logchief = _logger;
  } else {
    root.logger = _logger;
  }

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('logchief', [], function() {
      return _logger;
    });
  }
}.call(this));
