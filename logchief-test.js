describe("logger", function() {

  var all = ['debug', 'info', 'warn', 'error'];
  var console = {};
  var result;
  _.each(all, function(name) {
    console[name] = function(msg) {
      result = "[" + name + "] " + msg;
    };
  });
  
  beforeEach(function() {
    window.logger.reset();
  });

  it("exists", function() {
    expect(window.logger).toBeDefined();
    expect(window.logger.level).toBeDefined();
    expect(window.logger.console).toBeDefined();
    expect(window.logger.info).toBeDefined();
    expect(window.logger.debug).toBeDefined();
    expect(window.logger.warn).toBeDefined();
    expect(window.logger.error).toBeDefined();
  });
  
  it("cannot unset root parameter", function() {
    expect(function(){window.logger.unsetConsole();}).toThrow(new Error("cannot unset root console but you can override it"));
  });
  
  it("create sub logger", function() {
    var logger = window.logger.get("com");
    var sub = logger.get("example");
    
    result = undefined;
    window.logger.console(console);
    sub.error("hello!");
    expect(result).toBe("[error] com.example - hello!");
    
    expect(logger.formatter()).toBe(sub.formatter());
    expect(logger.get()).toBe(logger);
  });
  
  it("unset unexisting config", function() {
    window.logger.get("com.example").unsetConsole();
  });
  
  it("format Error", function() {
    result = undefined;
    window.logger.console(console);
    window.logger.error(new Error("an error"));
    expect(result.indexOf("[error] Error: an error")).toBe(0);
  });

  _.each(['info', 'warn', 'error'], function(name) {
    it("log " + name, function() {
      window.logger.level(1);
      var old = window.logger.console;
      window.logger.console(console);

      result = undefined;
      window.logger[name]("hello!");
      expect(result).toBe("[" + name + "] hello!");

      result = undefined;
      window.logger.get("com.example")[name]("hello!");
      expect(result).toBe("[" + name + "] com.example - hello!");

      window.logger.console(old);
    });
  });

  _.each(_.range(all.length + 1), function(i) {
    it("setLevel " + (i == all.length ? "off" : all[i]), function() {
      var old = window.logger.console;
      window.logger.console(console);

      window.logger.level(i);
      _.each(all, function(name, j) {
        result = undefined;
        window.logger[name]("hello!");
        if (j < i) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toBe("[" + name + "] hello!");
        }
        result = undefined;
        window.logger.get("com.example")[name]("hello!");
        if (j < i) {
          expect(result).toBeUndefined();
        } else {
          expect(result).toBe("[" + name + "] com.example - hello!");
        }
      });
      window.logger.console(old);
    });
  });

  it("filter level", function() {
    var old = window.logger.console;
    window.logger.console(console);
    window.logger.level(window.logger.levels.info);
    result = undefined;
    var logger = window.logger.get("com.example");
    logger.error("hello!");
    expect(result).toBe("[error] com.example - hello!");

    result = undefined;
    window.logger.levelOff("com");
    logger.error("hello!");
    expect(result).toBeUndefined();

    window.logger.levelError("com.example");
    logger.error("hello!");
    expect(result).toBe("[error] com.example - hello!");
    result = undefined;

    window.logger.levelOff("com.example1");
    logger.error("hello!");
    expect(result).toBe("[error] com.example - hello!");
    result = undefined;

    window.logger.unsetLevel("com.example");
    window.logger.unsetLevel("com.example1");
    logger.error("hello!");
    expect(result).toBeUndefined();

    window.logger.levelDebug("com");
    window.logger.levelInfo("com.example");
    logger.debug("hello!");
    expect(result).toBeUndefined();

    window.logger.levelInfo();
    
    window.logger.console(old);
  });

  it("format message", function() {
    var old = window.logger.console;
    window.logger.console(console);
    window.logger.level(window.logger.levels.info);
    
    window.logger.formatter(function(name, value) {
      return value.toUpperCase();
    });
    
    result = undefined;
    window.logger.info("hello!");
    expect(result).toBe("[info] HELLO!");
    
    var logger = window.logger.get("com.example");
    logger.formatter(function(name, value) {
      return value.toLowerCase();
    });
    
    result = undefined;
    window.logger.info("hello!");
    expect(result).toBe("[info] HELLO!");
    
    result = undefined;
    logger.info("hello!");
    expect(result).toBe("[info] hello!");
    
    logger.reset();
    
    result = undefined;
    logger.info("hello!");
    expect(result).toBe("[info] HELLO!");
    
    window.logger.console(old);
  });

});
