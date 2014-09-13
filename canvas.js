function Canvas(id) {
  this.id     = id;
  this.shapes = [];
}

Object.defineProperty(Canvas.prototype, 'canvas', {
  get: function() { return document.getElementById(this.id); }
});

Object.defineProperty(Canvas.prototype, 'context', {
  get: function() {
    var ctx = this.canvas.getContext('2d');
    ctx.layer = this;
    return ctx;
  }
});

Canvas.prototype.clear = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Canvas.prototype.translate = function(point) {
  this.origin = point;
  this.context.translate(point.x, point.y);
}

var front = new Canvas('frontlayer');
var back  = new Canvas('backlayer');

front.showPos = function() {
  var angle = getAngle(front.startPoint, front.lastPoint);
  var textAlignment = front.textAlignments[angle.quadrant - 1];
  this.context.save();
    this.context.textAlign = textAlignment.textAlign;
    this.context.fillText(
      "x: "   + this.lastPoint.x +
      ", y: " + this.lastPoint.y,
      this.lastPoint.x + textAlignment.xPlus,
      this.lastPoint.y + textAlignment.yPlus
    );
  this.context.restore();
};

front.showAxes = function() {
  this.context.lineWidth = 0.5;
    new AxisPair(this.lastPoint).draw(this.context);
  this.context.lineWidth = 1;
}

front.refresh = function() {
  this.clear();

  this.showPos();
  this.showAxes();
  this.eventListeners.clear();
}

front.textAlignments = [
  { xPlus: 15,  yPlus: 20,  textAlign: 'left' },
  { xPlus: -15, yPlus: 20,  textAlign: 'right'},
  { xPlus: -15, yPlus: -15, textAlign: 'right'},
  { xPlus: 15,  yPlus: -15, textAlign: 'left' }
]

back.refresh = function() {
  this.clear();
  this.shapes.forEach(function(shape) { shape.draw(this.context); }, this);
}
