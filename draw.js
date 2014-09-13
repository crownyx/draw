window.onload = function() {
  this.eventListeners  = new EventListenerCollection(this);
  front.eventListeners = new EventListenerCollection(front.canvas);

  front.canvas.width  = window.innerWidth  - 202;   
  front.canvas.height = window.innerHeight - 40;
  back.canvas.width   = window.innerWidth  - 202;   
  back.canvas.height  = window.innerHeight - 40;

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
    switch(e.which){
      case charCodes['a']:
        changeMode();
        design(new Arc(front.startPoint, new Line(front.startPoint, front.lastPoint).length));
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
      case charCodes['c']:
        changeMode();
        design(new Circle(front.startPoint, front.lastPoint));
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
      case charCodes['e']:
        changeMode();
        design(new Ellipse(front.startPoint, front.lastPoint));
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
      case charCodes['l']:
        changeMode();
        designLine();
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
      case charCodes['r']:
        changeMode();
        design(new Rectangle(front.startPoint, front.lastPoint));
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
      break;
    }
  }
}

function EventListenerCollection(receiver) {
  return {
    added: [],
    add: function(eventType, callbackName, callback) {
      if(this.find(callbackName)) this.remove(callbackName);
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
    find: function(callbackName) {
      return(this.added.find(function(cb) {
        return cb.callbackName == callbackName;
      }));
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
