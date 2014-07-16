function front() {
  var canvas = document.getElementById('frontlayer');
  canvas.context = canvas.getContext('2d');
  return { canvas: canvas, context: canvas.context };
}

function back() {
  var canvas = document.getElementById('backlayer');
  canvas.context = canvas.getContext('2d');
  return { canvas: canvas, context: canvas.context };
}

window.onload = function() {
  this.eventListeners = new EventListenerCollection(this);

  front().canvas.width  = window.innerWidth  - 202;   
  front().canvas.height = window.innerHeight - 40;
  back().canvas.width   = window.innerWidth  - 202;   
  back().canvas.height  = window.innerHeight - 40;

  (function(infopanel) {
    infopanel.style.width  = window.innerWidth - front().canvas.width - 42 + 'px';
    infopanel.style.height = window.innerHeight - 40 + 'px';
  })(document.getElementById('infopanel'));

  front().canvas.lastPoint = new Point(0, 0);
  front().canvas.infopanel = document.getElementById('infopanel');
  front().canvas.infodiv   = document.getElementById('infodiv');

  front().canvas.addEventListener('mousemove', clearCanvas, false);
  front().canvas.addEventListener('mousemove', showAxes, false);
  front().canvas.addEventListener('mousemove', setLastPoint, false);

  front().canvas.eventListeners = new EventListenerCollection(front().canvas);
  front().canvas.eventListeners.add('mousemove', 'showPos', showPos);
  front().canvas.eventListeners.add('click', 'design', function(e) { design(getPoint(e), Line); });
}

function setLastPoint(e) {
  front().canvas.lastPoint = getPoint(e);
}

function drawCommands(e) {
  if(!e.shiftKey) {
    switch(e.which){
      case charCodes['esc']:
        this.eventListeners.clear();
        refreshCanvas(true);
      break;
      case charCodes['c']:
        refreshCanvas();
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
        designCir(front().canvas.startPoint, front().canvas.lastPoint);
      break;
      case charCodes['e']:
        refreshCanvas();
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
        designEllipse(front().canvas.startPoint, front().canvas.lastPoint);
      break;
      case charCodes['l']:
        refreshCanvas();
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
        designLine(front().canvas.startPoint, front().canvas.lastPoint);
      break;
      case charCodes['r']:
        refreshCanvas();
        window.eventListeners.add('keydown', 'drawCommands', drawCommands);
        designRect(front().canvas,startPoint, front().canvas.lastPoint);
      break;
    }
  }
}

function clearCanvas() {
  front().context.clearRect(0, 0, front().canvas.width, front().canvas.height);
};

function refreshCanvas(restart) {
  clearCanvas();
  front().canvas.eventListeners.clear();
  window.eventListeners.clear();
  front().canvas.shapes = [];

  showAxes();

  if(restart) {
    front().canvas.eventListeners.add('click', 'startDrawing', function(e) { design(getPoint(e), Line); });
    front().canvas.eventListeners.add('mousemove', 'showPos', showPos);
    showPos();
    front().canvas.infopanel.replaceChild(
      front().canvas.infodiv,
      document.getElementById('infodiv')
    );
  }
}

function showAxes() {
  front().context.lineWidth = 0.5;
    new AxisPair(front().canvas.lastPoint).draw(front().context);
  front().context.lineWidth = 1;
}

function showPos() {
  front().context.fillText(
    "x: "   + front().canvas.lastPoint.x +
    ", y: " + front().canvas.lastPoint.y,
    front().canvas.lastPoint.x + 10,
    front().canvas.lastPoint.y - 10
  );
};

function design(startPoint, shapeConstructor) {
  refreshCanvas();

  front().canvas.startPoint = startPoint;

  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  var shape = new shapeConstructor(startPoint, startPoint);

  replaceInfoText(shape.infoText);

  front().canvas.eventListeners.add('mousemove', 'setEnd', function(e) {
    shape.setEnd(getPoint(e));
    if(shape.arcAngle) shape.arcAngle.setEnd(getPoint(e));
  });

  front().canvas.eventListeners.add('mousemove', 'drawShape', function(e) {
    shape.draw(front().context);
    if(shape.arcAngle) {
      shape.arcAngle.sketch(front().context);
      var angle = shape.arcAngle.endAngle;
      var text = angle.deg.toFixed(2) + unescape("%B0");
      showText(text, startPoint, new Angle(angle.rad + Math.PI), front().context);
    }
    showText(shape.showText, getPoint(e), getAngle(startPoint, getPoint(e)), front().context);
  });

  front().canvas.eventListeners.add('mousemove', 'showStartAxes', function(e) {
    new AxisPair(startPoint).sketch(front().context);
  });

  front().canvas.eventListeners.add('click', 'nextStep', function(e) {
    shape.nextStep(e);
  });
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
