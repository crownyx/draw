function Line(start, endOrParams) {
  Shape.call(this);

  this.start = start;

  if(endOrParams instanceof Point) {
    this.setEnd(endOrParams);
  } else {
    var refLine = this.start.to(this.start.plus(front.canvas.width));
    refLine.rotate(endOrParams.angle, { about: 'start' });
    this.setEnd(refLine.intersections(front.boundingRect)[0]);
  }

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

Line.prototype.setEnd = function(point, params) {
  params = params || {};
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
}


Object.defineProperty(Line.prototype, 'mid', {
  get: function() {
    return new Point(
      (this.end.x + this.start.x) / 2,
      (this.end.y + this.start.y) / 2
    );
  }
});

Object.defineProperty(Line.prototype, 'center', {
  get: function() { return this.mid; }
});

Object.defineProperty(Line.prototype, "points", {
  get: function() {
    return [this.start, this.mid, this.end];
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

  var rounded = function(num) { return Math.round(num * 1000); }

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
  if(!(otherLine instanceof Line))
    throw new TypeError(
      'Line.prototype.intersection requires another line, was given ' + otherLine.constructor.name
    );
  return this.intersections(otherLine)[0];
}

Line.prototype.intersections = function(otherShape) {
  switch(otherShape.constructor) {
    case Line:
      if(this.vertical && otherShape.vertical) return [];
      var x = this.vertical ? this.start.x : otherShape.vertical ? otherShape.start.x :
              (otherShape.yIntercept - this.yIntercept) / (this.slope - otherShape.slope);
      var y = this.horizontal ? this.start.y : otherShape.horizontal ? otherShape.start.y :
              this.vertical ? (otherShape.slope * x + otherShape.yIntercept) :
              (this.slope * x + this.yIntercept);
      if(this.getPoint({ x: x, y: y }) && otherShape.getPoint({ x: x, y: y })) {
        return [new Point(x, y)];
      } else {
        return [];
      }
    break;
    case Rectangle:
      return(otherShape.sides.filterMap(function(side) {
        return this.intersection(side);
      }, this));
    break;
    case Circle:
      var p = otherShape.center;
      var r = otherShape.radius.length;
      if(this.getPoint(otherShape.center)) {
        return(
          [this.angle, this.angle.plus(Math.PI)].filterMap(function(angle) {
            var intersection = otherShape.radiusAt(angle).end;
            return this.getPoint(intersection);
          }, this)
        );
      }
      if(this.vertical) {
        var angle = Math.acos((this.start.x - p.x) / r);
        return([
          angle, new Angle(2 * Math.PI).minus(angle)
        ].filterMap(function(angle) {
          var intersection = p.plus(r).translate(p, angle);
          return this.getPoint(intersection);
        }, this));
      }
      var a = this.slope, b = -1, c = this.yIntercept;
      var x = (b * (b * p.x - a * p.y) - a*c) / (Math.pow(a, 2) + Math.pow(b, 2));
      var y = (a * (a * p.y - b * p.x) - b*c) / (Math.pow(a, 2) + Math.pow(b, 2));
      var perpendicular = p.to(new Point(x, y));
      var innerAngle = Math.acos(perpendicular.length / r);
      return([
        perpendicular.angle.minus(innerAngle), perpendicular.angle.plus(innerAngle)
      ].filterMap(function(angle) {
        var intersection = p.plus(r).translate(p, angle);
        return this.getPoint(intersection);
      }, this));
    break;
    case Ellipse:
// http://quickcalcbasic.com/ellipse%20line%20intersection.pdf
      var p = otherShape.center;
      var a, b, c;
      var rotSin = Math.sin(otherShape.rotation.rad);
      var rotCos = Math.cos(otherShape.rotation.rad);
      var v = otherShape.yAxis.length;
      var h = otherShape.xAxis.length;
      if(this.vertical) {
        var constX = this.start.x - otherShape.center.x;
        a = v*v*rotSin*rotSin + h*h*rotCos*rotCos;
        b = 2*constX*rotCos*rotSin*(v*v-h*h);
        c = constX*constX*(v*v*rotCos*rotCos + h*h*rotSin*rotSin) - (h*h*v*v);
        return([1, -1].filterMap(function(negative) {
          var y = otherShape.center.y + (-b + negative * Math.sqrt(b*b - 4*a*c)) / (2*a);
          return this.getPoint({ y: y });
        }, this));
      }
      var transb = this.yIntercept + this.slope * otherShape.center.x - otherShape.center.y;
      var a1 = v*v * (rotCos*rotCos + 2*this.slope*rotCos*rotSin + this.slope*this.slope*rotSin*rotSin);
      var a2 = h*h * (this.slope*this.slope*rotCos*rotCos - 2*this.slope*rotCos*rotSin + rotSin*rotSin);
      a = a1 + a2;
      var b1 = 2 * v*v*transb*(rotCos*rotSin + this.slope*rotSin*rotSin);
      var b2 = 2 * h*h*transb*(this.slope*rotCos*rotCos - rotCos*rotSin);
      b = b1 + b2;
      c = transb*transb*(v*v*rotSin*rotSin + h*h*rotCos*rotCos) - h*h*v*v;
      return([1, -1].filterMap(function(negative) {
        var x = otherShape.center.x + (-b + negative * Math.sqrt(b*b - 4*a*c)) / (2*a);
        return this.getPoint({ x: x });
      }, this));
    break;
  }
}

Line.prototype.rotate = function(rotation, params) {
  if(params && params.about == 'start') {
    this.setEnd(this.end.translate(this.start, rotation));
  } else {
    var mid = this.mid;
    this.start = this.start.translate(mid, rotation);
    this.setEnd(this.end.translate(mid, rotation));
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
    vertical: new Line(new Point(origin.x, 0), new Point(origin.x, front.canvas.height)),
    horizontal: new Line(new Point(0, origin.y), new Point(front.canvas.width, origin.y)),
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
