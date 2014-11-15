function EventListenerCollection(receiver) {
  return {
    active: {},
    suspended: {},
    add: function(eventType, callbackName, callback, execute) {
      if(this.find(callbackName)) this.remove(callbackName);
      receiver.addEventListener(eventType, callback, false);
      this.active[callbackName] = { eventType: eventType, callback: callback };
      if(execute) callback();
    },
    remove: function(callbackName) {
      var cb = this.active[callbackName];
      if(cb) {
        receiver.removeEventListener(cb.eventType, cb.callback, false);
        delete this.active[callbackName];
        return cb;
      }
    },
    suspend: function(callbackName) {
      var cb = this.find(callbackName);
      receiver.removeEventListener(cb.eventType, cb.callback, false);
      delete this.active[callbackName];
      this.suspended[callbackName] = cb;
    },
    suspendAll: function() {
      this.active.forEach(function(callbackName, eventListener) {
        this.suspend(callbackName);
      }, this);
    },
    resume: function(callbackName) {
      var cb = this.suspended[callbackName];
      receiver.addEventListener(cb.eventType, cb.callback, false);
      delete this.suspended[callbackName];
      this.active[callbackName] = cb;
    },
    resumeAll: function() {
      this.suspended.forEach(function(callbackName, eventListener) {
        this.resume(callbackName);
      }, this);
    },
    find: function(callbackName) {
      return(this.active[callbackName]);
    },
    clear: function() {
      var had = this.active;
      this.active.forEach(function(callbackName, eventListener) {
        receiver.removeEventListener(eventListener.eventType, eventListener.callback, false);
      });
      this.suspended = {};
      this.active = {};
      return had;
    }
  };
}
