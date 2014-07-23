function Canvas(id) {
  this.id     = id;
  this.shapes = [];
}

Object.defineProperty(Canvas.prototype, 'canvas', {
  get: function() { return document.getElementById(this.id); }
});

Object.defineProperty(Canvas.prototype, 'context', {
  get: function() { return this.canvas.getContext('2d'); }
});

Canvas.prototype.clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Canvas.prototype.refresh = function(restart) {
  this.clear();
  this.eventListeners.clear();
  this.shapes = [];
  this.showPos();
  this.showAxes();

  window.eventListeners.clear();

  if(restart) {
    (function(cvs) {
      cvs.eventListeners.add('click', 'startDrawing', function(e) { cvs.startDrawing(e); });
    })(this);

    this.infopanel.replaceChild(this.infopanel.infodiv, document.getElementById('infodiv'));
  }
}

Canvas.prototype.showAxes = function() {
  this.context.lineWidth = 0.5;
    new AxisPair(this.lastPoint).draw(this.context);
  this.context.lineWidth = 1;
}

Canvas.prototype.showPos = function() {
  this.context.fillText(
    "x: "   + this.lastPoint.x +
    ", y: " + this.lastPoint.y,
    this.lastPoint.x + 10,
    this.lastPoint.y - 10
  );
};

Canvas.prototype.startDrawing = function(e) {
  this.startPoint = getPoint(e);
  design(Line);
  (function(cvs) {
    cvs.eventListeners.add('mousemove', 'showXAxis', function() {
      new HorizontalLine(cvs.startPoint.y).sketch(cvs.context);
    });
  })(this);
}

function design(shapeConstructor) {
  front.refresh();

  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  var shape = new shapeConstructor(front.startPoint, front.lastPoint);

  front.eventListeners.add('mousemove', 'setEnd',    function(e) { shape.setEnd(getPoint(e)); });
  front.eventListeners.add('mousemove', 'showShape', function(e) { shape.draw(front.context); });
  front.eventListeners.add('click', 'nextStep',      function(e) { shape.complete();          });

  front.eventListeners.add('mousemove', 'showText', function() {
    front.context.fillText(shape.infoText(), 10, 15);
  });

  shape.draw(front.context);
  front.context.fillText(shape.infoText(), 10, 15);

  front.infopanel.replaceChild(
    (function() {
      var newdiv = document.createElement('div');
      ['[a]: arc',
       '[b]: bezier curve',
       '[c]: circle',
       '[e]: ellipse',
       '[l]: line',
       '[r]: rectangle',
       '[s]: square',
       '[t]: triangle',
       '',
       '[esc]: stop drawing'
      ].map(function(line) {
        var span = document.createElement('span');
        span.textContent = line;
        return span;
      }).forEach(function(span) {
        newdiv.appendChild(span);
        newdiv.appendChild(document.createElement('br'));
      });
      newdiv.id = 'infodiv';
      return newdiv;
    })(),
    front.infopanel.infodiv
  );
}

var front = new Canvas('frontlayer');
var back  = new Canvas('backlayer');
