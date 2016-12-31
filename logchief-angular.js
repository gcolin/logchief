/**
   * @namespace
   * @name angular
   * @memberof logger
   * @description 
   * Override the angular logger with a Logchief logger.
   * <p>$log === logchief.get("angular")</p>
   * <p>Set debugEnabled set level to debug (if true) or to info (if false).</p>
   */
(function() {
  angular.module('ng').config(["$logProvider", function($logProvider) {
    var debug;

    var angularLog = logger.get("angular");
    angularLog.log = angularLog.info;
    var isDebug = $logProvider.debugEnabled();

    $logProvider.debugEnabled = function(flag) {
      if (typeof flag !== 'undefined') {
        debug = flag;
        if(debug) {
          angularLog.levelDebug();
        } else {
          angularLog.levelInfo();
        }        
        return $logProvider;
      } else {
        return debug;
      }
    };
    
    $logProvider.debugEnabled(isDebug);

    $logProvider.$get = function() {
      return angularLog;
    };
  }]);
})();