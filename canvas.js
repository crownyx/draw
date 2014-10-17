function Canvas(id) { this.id = id; }

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

Canvas.prototype.save = function() { this.context.save(); }
Canvas.prototype.restore = function() { this.context.restore(); }

Canvas.prototype.translate = function(point) {
  this.origin = point;
  this.context.translate(point.x, point.y);
}

var front  = new Canvas('frontlayer');
var middle = new Canvas('drawlayer');
var back   = new Canvas('backlayer');

front.showPos = function(e) {
  var currPoint = Point.from(e);
  var angle = Angle.from(this.startPoint, currPoint);
  var textAlignment = this.textAlignments[angle.quadrant - 1];
  this.context.save();
    this.context.textAlign = textAlignment.textAlign;
    this.context.fillText(
      "x: "   + currPoint.x +
      ", y: " + currPoint.y,
      currPoint.x + textAlignment.xPlus,
      currPoint.y + textAlignment.yPlus
    );
  this.context.restore();
};

front.showAxes = function(e) {
  this.context.lineWidth = 0.5;
    new AxisPair(Point.from(e)).draw(this.context);
  this.context.lineWidth = 1;
}

front.refresh = function() {
  this.clear();

  this.showPos(this.lastPoint);
  this.showAxes(this.lastPoint);
  this.eventListeners.clear();
}

front.textAlignments = [
  { xPlus: 15,  yPlus: 20,  textAlign: 'left' },
  { xPlus: -15, yPlus: 20,  textAlign: 'right'},
  { xPlus: -15, yPlus: -15, textAlign: 'right'},
  { xPlus: 15,  yPlus: -15, textAlign: 'left' }
]

Object.defineProperty(front, 'infodiv', {
  get: function() {
    return document.getElementById('infodiv');
  }
});

back.shapes = [];

back.refresh = function() {
  this.clear();
  this.shapes.forEach(function(shape) { shape.draw(this.context); }, this);
}

middle.showText = true;

middle.refresh = function() {
  this.clear();
  delete this.shape;
  delete this.group;
  this.redraw = function() { }
}

middle.redraw = function() { }
