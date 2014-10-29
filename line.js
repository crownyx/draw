function Line(start, end) {
  Shape.call(this);

  this.start = start;
  this.end   = end;

  this.origin = start;

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
  this.start.round().preview(Angle.from(front.startPoint, front.lastPoint), 1);
  this.angle.preview();
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
  this.draw(middle.context);
  if(this.fixedLength || this.fixedAngle) this.end.round().preview(0, 2, { strokeStyle: 'green' });
}

Line.prototype.sketchPreview = function() {
  this.start.round().preview(Angle.from(front.startPoint, front.lastPoint), 1);
  this.angle.preview();
  this.sketch(middle.context);
  if(this.fixedLength || this.fixedAngle) this.end.round().preview(0, 2, { strokeStyle: 'green' });
}

Line.prototype.translate = function(point) {
  var origDiff = { x: this.end.x - this.start.x, y: this.end.y - this.start.y };
  this.origin = point;
  this.start = point;
  this.end = new Point(this.start.x + origDiff.x, this.start.y + origDiff.y);
}

Line.prototype.rotate = function(rotation) {
  this.end = this.end.translate(this.start, rotation);
  if(this.fixedAngle)
    this.fixedAngle = this.fixedAngle.rad.plus(rotation);
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
    draw: function(context) {
      this.vertical.draw(context);
      this.horizontal.draw(context);
    },
    sketch: function(context, params) {
      this.vertical.sketch(context, params);
      this.horizontal.sketch(context, params);
    }
  }
}
