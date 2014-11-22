function Line(start, end) {
  Shape.call(this);

  this.start = start;
  this.setEnd(end);

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
  if(!this.end) { console.log(new Error('').stack); return; }
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
    y = this.horizontal ? this.start.y : this.slope * x + this.yIntercept;
  } else if(!isNum(x) && isNum(y)) {
    x = this.vertical ? this.start.x : (y - this.yIntercept) / this.slope;
  }

  var rounded = function(num) { return Math.round(num * 1000) / 1000; }

  var onLine  = (this.vertical && rounded(x) === rounded(this.start.x)) ||
                (this.horizontal && rounded(y) === rounded(this.start.y)) ||
                rounded(this.slope * x + this.yIntercept) === rounded(y);
  var xBetween = rounded(x) >= rounded(Math.min(this.start.x, this.end.x)) && rounded(x) <= rounded(Math.max(this.start.x, this.end.x));
  var yBetween = rounded(y) >= rounded(Math.min(this.start.y, this.end.y)) && rounded(y) <= rounded(Math.max(this.start.y, this.end.y));

  if(onLine && xBetween && yBetween) return new Point(x, y);
}

Object.defineProperty(Line.prototype, 'slope', {
  get: function() { return((this.end.y - this.start.y) / (this.end.x - this.start.x)); }
});

Object.defineProperty(Line.prototype, 'horizontal', {
  get: function() { return Math.round(this.end.y * 1000) === Math.round(this.start.y * 1000); }
});

Object.defineProperty(Line.prototype, 'vertical', {
  get: function() { return Math.round(this.end.x * 1000) === Math.round(this.start.x * 1000); }
});

Object.defineProperty(Line.prototype, 'yIntercept', {
  get: function() { return -this.slope * this.start.x + this.start.y; }
});

Line.prototype.intersection = function(otherLine) {
  if(this.vertical && otherLine.vertical) return;
  var x = this.vertical ? this.start.x : otherLine.vertical ? otherLine.start.x :
          (otherLine.yIntercept - this.yIntercept) / (this.slope - otherLine.slope);
  var y = this.horizontal ? this.start.y : otherLine.horizontal ? otherLine.start.y :
          this.vertical ? (otherLine.slope * x + otherLine.yIntercept) :
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
      this.fixedAngle = this.fixedAngle.plus(rotation);
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
