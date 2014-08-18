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
  this.shapes.forEach(function(shape) { shape.draw(this.context); }, this);

  if(this.lastPoint)      this.showPos();
  if(this.lastPoint)      this.showAxes();
  if(this.eventListeners) this.eventListeners.clear();

  window.eventListeners.clear();

  if(restart) {
    this.shapes = [];
    commandMode();
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

function designLine() {
  var line = design(new Line(front.startPoint, front.lastPoint));
  front.eventListeners.add('mousemove', 'showXAxis', function() {
    new HorizontalLine(front.startPoint.y).sketch(front.context);
  });
  front.eventListeners.add('mousemove', 'showAngle', function() {
    new Arc(line.start, 15, new Angle(0), line.angle).sketch(front.context);
    front.context.textAlign = 'right';
    front.context.fillText(
      line.angle.deg.toFixed(2) + unescape("\xB0"),
      front.lastPoint.x - 10,
      front.lastPoint.y + 15
    );
    front.context.textAlign = 'start';
  });
  new Arc(line.start, 15, new Angle(0), line.angle).sketch(front.context);
  new HorizontalLine(front.startPoint.y).sketch(front.context);
}

var front = new Canvas('frontlayer');
var back  = new Canvas('backlayer');
