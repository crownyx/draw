window.onload = function() {
  this.eventListeners  = new EventListenerCollection(this);
  front.eventListeners = new EventListenerCollection(front.canvas);

  front.canvas.width   = window.innerWidth  - 202;
  front.canvas.height  = window.innerHeight - 40;
  middle.canvas.width  = window.innerWidth  - 202;
  middle.canvas.height = window.innerHeight - 40;
  back.canvas.width    = window.innerWidth  - 202;
  back.canvas.height   = window.innerHeight - 40;

  document.getElementById('infopanel').style.width  = window.innerWidth - front.canvas.width - 42 + 'px';
  document.getElementById('infopanel').style.height = window.innerHeight - 40 + 'px';

  front.infopanel = document.getElementById('infopanel');
  front.infopanel.infodiv = document.getElementById('infodiv');

  front.startPoint = new Point(0, front.canvas.height);
  front.lastPoint  = new Point(front.canvas.width, 0);

  front.canvas.addEventListener('mousemove', function()  { front.clear();                 }, false);
  front.canvas.addEventListener('mousemove', function(e) { front.lastPoint = getPoint(e); }, false);
  front.canvas.addEventListener('mousemove', function()  { front.showAxes();              }, false);
  front.canvas.addEventListener('mousemove', function()  { front.showPos();               }, false);

  this.refresh = function() { this.eventListeners.clear(); }

  changeMode(commandMode);
}

function changeMode(mode) {
  window.refresh();
  front.refresh();
  middle.clear();

  if(mode) mode();
}

function commandMode() {
  front.startPoint = new Point(0, front.canvas.height);
  front.lastPoint  = new Point(front.canvas.width, 0);

  front.infopanel.replaceChild(
    (function(div) {
      div.appendChild((function(b) {
        b.className = "center";
        b.textContent = "click to begin drawing";
        return b;
      })(document.createElement('b'))),
      div.id = "infodiv";
      return div;
    })(document.createElement('div')),
    document.getElementById('infodiv')
  );

  if(back.shapes.length) {
    document.getElementById('infodiv').appendChild(document.createElement('br'));
    document.getElementById('infodiv').appendChild((function(b) {
      b.textContent = "[s]: select shape(s)";
      return b;
    })(document.createElement('b')));
    document.getElementById('infodiv').appendChild((function(b) {
      b.textContent = "[e]: edit shape(s)";
      return b;
    })(document.createElement('b')));
  }

  front.eventListeners.add('click', 'design', function(e) {
    front.startPoint = getPoint(e);
    changeMode();
    design(new Line(front.startPoint, front.lastPoint));
    window.eventListeners.add('keydown', 'drawCommands', drawCommands);
  });

  window.eventListeners.add('keydown', 'switchMode', function(e) {
    switch(e.which) {
      case charCodes['s']: changeMode(selectMode); break;
      case charCodes['e']: changeMode(editMode); break;
    }
  });
}

function drawCommands(e) {
  if(!e.shiftKey) {
    var shape = (function() {
      switch(e.which) {
        case charCodes['a']:
          return new Arc(front.startPoint, new Line(front.startPoint, front.lastPoint).length);
        case charCodes['c']:
          return new Circle(front.startPoint, front.lastPoint);
        case charCodes['e']:
          return new Ellipse(front.startPoint, front.lastPoint);
        case charCodes['l']:
          return new Line(front.startPoint, front.lastPoint);
        case charCodes['r']:
          return new Rectangle(front.startPoint, front.lastPoint);
      }
    })();
    if(shape) {
      changeMode();
      design(shape);
      window.eventListeners.add('keydown', 'drawCommands', drawCommands);
    }
  }
}

function EventListenerCollection(receiver) {
  return {
    active: {},
    suspended: {},
    add: function(eventType, callbackName, callback) {
      if(this.find(callbackName)) this.remove(callbackName);
      receiver.addEventListener(eventType, callback, false);
      this.active[callbackName] = { eventType: eventType, callback: callback };
    },
    remove: function(callbackName) {
      var cb = this.active[callbackName];
      receiver.removeEventListener(cb.eventType, cb.callback, false);
      delete this.active[callbackName];
      return cb;
    },
    suspend: function(callbackName) {
      var cb = this.find(callbackName);
      receiver.removeEventListener(cb.eventType, cb.callback, false);
      delete this.active[callbackName];
      this.suspended[callbackName] = cb;
    },
    resume: function(callbackName) {
      var cb = this.suspended[callbackName];
      receiver.addEventListener(cb.eventType, cb.callback, false);
      delete this.suspended[callbackName];
      this.active[callbackName] = cb;
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
