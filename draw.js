window.onload = function() {
  this.eventListeners  = new EventListenerCollection(this);
  front.eventListeners = new EventListenerCollection(front.canvas);

  front.canvas.width   = window.innerWidth  - 202;
  front.canvas.height  = window.innerHeight - 10;
  middle.canvas.width  = window.innerWidth  - 202;
  middle.canvas.height = window.innerHeight - 10;
  back.canvas.width    = window.innerWidth  - 202;
  back.canvas.height   = window.innerHeight - 10;

  document.getElementById('infopanel').style.width  = window.innerWidth - front.canvas.width - 17 + 'px';
  document.getElementById('infopanel').style.height = front.canvas.height - 2 + 'px';

  front.startPoint = new Point(0, front.canvas.height);
  front.lastPoint  = new Point(front.canvas.width, 0);

  front.canvas.addEventListener('mousemove', function()  { front.clear(); }, false);
  front.canvas.addEventListener('mousemove', function(e) { front.lastPoint = Point.from(e); }, false);
  front.canvas.addEventListener('mousemove', function()  { front.showAxes(); }, false);
  front.canvas.addEventListener('mousemove', function()  { front.showPos(); }, false);
  front.canvas.addEventListener('mousemove', function()  {
    if(front.setPoint) {
      front.showPos(front.setPoint);
      new AxisPair(front.setPoint).sketch(front.context, { strokeStyle: 'rgb(160,160,100)' });
    }
  }, false);

  window.addEventListener('keydown', choosePoint = function(e) {
    if(!e.shiftKey && e.which == charCodes['g']) {
      getInput(
        { main: 'enter point:', subtext: '(x,y)' },
        function(xy) {
          if(xy == 'x') {
            infopanel.bottom.find('unchoosePoint').remove();
            delete front.setPoint;
          } else {
            var x = parseInt(xy.split(',')[0]);
            var y = parseInt(xy.split(',')[1]);
            if(typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
              front.setPoint = new Point(x, y);
              infopanel.bottom.add('To unchoose point, type "g", then enter "x"', 'unchoosePoint');
            }
          }
          front.redraw();
          if(middle.shape || middle.group) {
            if(middle.group) delete middle.group.fixedRotation;
            (middle.shape || middle.group).setEnd(front.setPoint || front.lastPoint);
            middle.clear();
            (middle.shape || middle.group).preview(front.setPoint || front.lastPoint);
          }
        },
        ['x', ',']
      );
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
  if(front.setPoint) {
    delete front.setPoint;
    infopanel.bottom.remove();
  }

  front.startPoint = new Point(0, front.canvas.height);
  front.refresh();
  front.lastPoint  = new Point(front.canvas.width, 0);

  infopanel.top = 'click on canvas to begin drawing';
  infopanel.buttons = [Button('g', 'choose point', 'yellow')];

  if(back.shapes.length) {
    infopanel.buttons.add(
      Button('s', 'select shape(s)', 'green'),
      Button('e', 'edit shape(s)', 'green')
    );
  }

  front.eventListeners.add('click', 'design', function() {
    front.startPoint = front.setPoint || front.lastPoint;
    delete front.setPoint;
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
          return new Arc(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['b']:
          return new BezierCurve(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['c']:
          return new Circle(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['e']:
          return new Ellipse(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['l']:
          return new Line(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['r']:
          return new Rectangle(front.startPoint, front.setPoint || front.lastPoint);
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
