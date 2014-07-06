function EventListenerCollection(receiver) {
  return {
    added: [],
    add: function(eventType, callbackName, callback) {
      receiver.addEventListener(eventType, callback, false);
      this.added.push({ eventType: eventType, callbackName: callbackName, callback: callback });
    },
    remove: function(callbackName) {
      var index = this.added.findIndex(function(cb) { return cb.callbackName == callbackName; });
      var cb = this.added[index];
      receiver.removeEventListener(cb.eventType, cb.callback, false);
      this.added.splice(index, 1);
      return cb;
    },
    clear: function() {
      var had = this.added;
      this.added.forEach(function(eventListener) {
        receiver.removeEventListener(eventListener.eventType, eventListener.callback, false);
      });
      this.added = [];
      return had;
    }
  };
}

function Canvas(id) {
  var _canvas = document.getElementById(id);
  
  this.canvas = _canvas;
  this.context = _canvas.getContext('2d');

  this.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.eventListeners = new EventListenerCollection(_canvas)
}
