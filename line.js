function Line(start, end) {
  Shape.call(this);

  this.start = start;
  this.setEnd(end);

  this.lines = [];

  var line = this;

  this.shiftCommands = [
    {
      key: 'a',
      forWhat: 'angle',
      subtext: '(degrees)',
      prettify: function() { return line.fixedAngle.deg + unescape("\xB0"); },
      callback: function(deg) {
        if(deg == 'x') {
          line.deleteFixedProperty('fixedAngle');
        } else {
          line.fixedAngle = new Angle(parseInt(deg) / 180 * Math.PI);
        }
      },
      acceptChars: ['x']
    },
    {
      key: 'l',
      forWhat: 'length',
      prettify: function() { return commaSep(line.fixedLength); },
      callback: function(length) {
        if(length == 'x') {
          line.deleteFixedProperty('fixedLength');
        } else {
          line.fixedLength = parseInt(length.replace(',', ''));
        }
      },
      acceptChars: ['x', ',']
    },
  ];
}

Line.prototype = new Shape;
Line.prototype.constructor = Line;

Line.prototype.infoText = function() {
  return "length: " + commaSep(Math.round(this.length));
}

Line.prototype.setEnd = function(point, params = {}) {
  if(this.fixedLength || this.fixedAngle || params.fixedLength || params.fixedAngle) {
    var rotation = this.fixedAngle || params.fixedAngle || new Line(this.start, point).angle;
    var length   = this.fixedLength || params.fixedLength || new Line(this.start, point).length;
    this.end = new Point(
      this.start.x + Math.cos(rotation.rad) * length,
      this.start.y + Math.sin(rotation.rad) * length
    );
  } else {
    this.end = point;
  }
  this.mid = new Point(
    (this.end.x + this.start.x) / 2,
    (this.end.y + this.start.y) / 2
  );
}

Object.defineProperty(Line.prototype, 'center', {
  get: function() { return this.mid; }
});

Object.defineProperty(Line.prototype, "points", {
  get: function() {
    return [this.start, this.mid, this.end].map(function(point) {
      point.shape = this;
      return point;
    }, this);
  }
});

Object.defineProperty(Line.prototype, 'length', {
  get: function() {
    return Math.sqrt(Math.pow(this.end.x - this.start.x, 2) + Math.pow(this.end.y - this.start.y, 2));
  }
});

Object.defineProperty(Line.prototype, 'angle', {
  get: function() {
    var angle = Angle.from(this.start, this.end);
    angle.center = this.start;
    return angle;
  }
});

Line.prototype.drawPath = function(context) {
  context.moveTo(this.start.x, this.start.y);
  context.lineTo(this.end.x, this.end.y);
}

Line.prototype.preview = function() {
  this.start.round().preview(0, 1);
  this.angle.preview();
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
  this.draw(middle.context);
  if(this.fixedLength || this.fixedAngle) this.end.round().label(middle.context);
}

Line.prototype.sketchPreview = function() {
  if(this.start.same(front.usePoint)) {
    this.start.round().showCoords(middle.context, 0, 1);
  } else {
    this.start.round().preview(0, 1);
  }
  this.angle.preview();
  this.sketch(middle.context);
  if(this.fixedLength || this.fixedAngle) this.end.round().label(middle.context);
}

Line.prototype._translate = function(point, params = {}) {
  if(params.by == 'start') {
    (function(start, end) {
      this.start = point;
      this.setEnd(point.plus(end.x - start.x, end.y - start.y));
    }).call(this, this.start, this.end);
  } else {
    (function(start, mid, end) {
      this.start = point.minus(mid.x - start.x, mid.y - start.y);
      this.setEnd(point.minus(mid.x - end.x,   mid.y - end.y));
    }).call(this, this.start, this.mid, this.end);
  }
}

Line.prototype.getPoint = function(xy) {
  var x = xy.x, y = xy.y;
  if(isNum(x) && !isNum(y)) {
    y = this.start.y + Math.tan(this.angle.rad) * (x - this.start.x);
  } else if(!isNum(x) && isNum(y)) {
    x = this.start.x + (y - this.start.y) / Math.tan(this.angle.rad);
  }
  var xBetween = isNum(x) &&
                 (this.start.x < this.end.x && x >= this.start.x && x <= this.end.x) ||
                 (this.start.x > this.end.x && x <= this.start.x && x >= this.end.x) ||
                 (this.start.x == this.end.x && x == this.start.x);
  var yBetween = isNum(y) &&
                 (this.start.y < this.end.y && y >= this.start.y && y <= this.end.y) ||
                 (this.start.y > this.end.y && y <= this.start.y && y >= this.end.y) ||
                 (this.start.y == this.end.y && y == this.start.y);
  if(xBetween && yBetween) return new Point(x, y);
}

Object.defineProperty(Line.prototype, 'slope', {
  get: function() { return((this.end.y - this.start.y) / (this.end.x - this.start.x)); }
});

Object.defineProperty(Line.prototype, 'horizontal', {
  get: function() { return this.end.y.toFixed(5) === this.start.y.toFixed(5); }
});

Object.defineProperty(Line.prototype, 'vertical', {
  get: function() { return this.end.x.toFixed(5) === this.start.x.toFixed(5); }
});

Object.defineProperty(Line.prototype, 'yIntercept', {
  get: function() { return -this.slope * this.start.x + this.start.y; }
});

Line.prototype.intersection = function(otherLine) {
  var x = this.vertical ? this.start.x : otherLine.vertical ? otherLine.start.x :
          (otherLine.yIntercept - this.yIntercept) / (this.slope - otherLine.slope);
  var y = this.horizontal ? this.start.y : otherLine.horizontal ? otherLine.start.y :
          (this.slope * x + this.yIntercept);
  if(this.getPoint({ x: x, y: y }) && otherLine.getPoint({ x: x, y: y })) {
    return new Point(x, y);
  }
}

Line.prototype.rotate = function(rotation, params) {
  if(params && params.about == 'start') {
    this.setEnd(this.end.translate(this.start, rotation));
  } else {
    this.start = this.start.translate(this.mid, rotation);
    this.setEnd(this.end.translate(this.mid, rotation));
    if(this.fixedAngle)
      this.fixedAngle = this.fixedAngle.rad.plus(rotation);
  }
}

Line.prototype.copy = function() {
  var newLine = new Line(
    new Point(this.start.x, this.start.y),
    new Point(this.end.x, this.end.y)
  );
  if(this.fixedAngle) newLine.fixedAngle = this.fixedAngle.copy();
  newLine.fixedLength = this.fixedLength;
  return newLine;
}

////////////////////
// Special Lines: //
////////////////////

function VerticalLine(x) {
  return new Line(new Point(x, 0), new Point(x, front.canvas.height));
}

function HorizontalLine(y) {
  return new Line(new Point(0, y), new Point(front.canvas.width, y));
}

function AxisPair(origin) {
  return {
    vertical: new Line({ x: origin.x, y: 0 }, { x: origin.x, y: front.canvas.height }),
    horizontal: new Line({ x: 0, y: origin.y }, { x: front.canvas.width, y: origin.y }),
    draw: function(context, params) {
      this.vertical.draw(context, params);
      this.horizontal.draw(context, params);
    },
    sketch: function(context, params) {
      this.vertical.sketch(context, params);
      this.horizontal.sketch(context, params);
    }
  }
}
