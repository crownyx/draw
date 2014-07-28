window.onload = function() {
  this.eventListeners  = new EventListenerCollection(this);
  front.eventListeners = new EventListenerCollection(front.canvas);

  front.canvas.width  = window.innerWidth  - 202;   
  front.canvas.height = window.innerHeight - 40;
  back.canvas.width   = window.innerWidth  - 202;   
  back.canvas.height  = window.innerHeight - 40;

  document.getElementById('infopanel').style.width  = window.innerWidth - front.canvas.width - 42 + 'px';
  document.getElementById('infopanel').style.height = window.innerHeight - 40 + 'px';

  front.lastPoint = new Point(0, 0);
  front.infopanel = document.getElementById('infopanel');
  front.infopanel.infodiv = document.getElementById('infodiv');

  front.canvas.addEventListener('mousemove', function()  { front.clear();                 }, false);
  front.canvas.addEventListener('mousemove', function(e) { front.lastPoint = getPoint(e); }, false);
  front.canvas.addEventListener('mousemove', function()  { front.showAxes();              }, false);
  front.canvas.addEventListener('mousemove', function()  { front.showPos();               }, false);

  commandMode();
}

function commandMode() {
  front.eventListeners.add('click', 'design', function(e) {
    front.startPoint = getPoint(e);
    designLine();
  });

  window.eventListeners.add('keydown', 'selectMode', function(e) {
    if(e.which == charCodes['s']) selectMode();
  });
}

function drawCommands(e) {
  if(!e.shiftKey) {
    switch(e.which){
      case charCodes['esc']:
        this.eventListeners.clear();
        front.refresh(true);
      break;
      case charCodes['c']:
        design(Circle);
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
      case charCodes['e']:
        design(Ellipse);
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
      case charCodes['l']:
        designLine();
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
      case charCodes['r']:
        design(Rectangle);
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
    }
  }
}

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
