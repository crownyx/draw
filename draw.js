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

  front.canvas.addEventListener('mousemove', function() { front.clear(); }, false);
  front.canvas.addEventListener('mousemove', setLastPoint = function(e) {
    front.lastPoint = Point.from(e);
  }, false);
  front.canvas.addEventListener('mousemove', function(e) { front.showAxes(e); }, false);
  front.canvas.addEventListener('mousemove', function(e) { front.showPos(e); }, false);

  window.addEventListener('keydown', function(e) {
    if(!e.shiftKey && e.which == charCodes['g']) {
      getInput(
        { main: 'enter point:', subtext: '(x,y)' },
        function(xy) {
          if(xy == 'x') {
            front.canvas.addEventListener('mousemove', setLastPoint, false);
            front.eventListeners.remove('showSetPoint');
          } else {
            var x = parseInt(xy.split(',')[0]);
            var y = parseInt(xy.split(',')[1]);
            setPoint = new Point(x, y);
            front.lastPoint = setPoint;
            front.canvas.removeEventListener('mousemove', setLastPoint, false);
            front.eventListeners.add('mousemove', 'showSetPoint', function() {
              new AxisPair(setPoint).sketch(front.context);
            });
            front.canvas.addEventListener('click', resumeSetLastPoint = function(e) {
              front.eventListeners.remove('showSetPoint');
              front.canvas.removeEventListener('click', resumeSetLastPoint, false);
              front.canvas.addEventListener('mousemove', setLastPoint, false);
            }, false);
          }
          middle.redraw();
        },
        [
          {
            charCode: charCodes['comma'],
            character: ','
          },
          {
            charCode: charCodes['x'],
            character: 'x'
          }
        ]
      );
    } else if(e.which == charCodes['esc']) {
      front.canvas.addEventListener('mousemove', setLastPoint, false);
    }
  }, false);

  this.refresh = function() { this.eventListeners.clear(); }

  changeMode(commandMode);
}

function changeMode(mode) {
  window.refresh();
  front.refresh();
  middle.refresh();

  if(mode) mode();
}

function commandMode() {
  front.startPoint = new Point(0, front.canvas.height);
  front.lastPoint  = new Point(front.canvas.width, 0);

  var helpText = [{
    className: 'box',
    textContent: 'click on canvas to begin drawing'
  },
  {
    className: 'button',
    textContent: 'g:go to point',
    color: 'yellow'
  }];

  if(back.shapes.length) {
    helpText.splice(1, 0,
      { className: 'button', textContent: 's:select shape(s)', color: 'green' },
      { className: 'button', textContent: 'e:edit shape(s)', color: 'green' }
    );
  }

  replaceInfoText(helpText);

  front.eventListeners.add('click', 'design', function(e) {
    front.startPoint = front.lastPoint;
    changeMode();
    design(new Line(front.startPoint, front.startPoint));
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
          return new Arc(front.startPoint, front.lastPoint);
        case charCodes['b']:
          return new BezierCurve(front.startPoint, front.lastPoint);
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
    if(shape) { window.designShape(shape); }
  }
}

window.designShape = function(shape) {
  changeMode();
  design(shape);
  this.eventListeners.add('keydown', 'drawCommands', drawCommands);
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
