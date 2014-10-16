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
      subtext: '(in degrees)',
      callback: function(deg) {
        line.fixedRotation = new Angle(parseInt(deg) / 180 * Math.PI);
      }
    },
    {
      key: 'l',
      forWhat: 'length',
      callback: function(length) { line.fixedLength = parseInt(length); }
    },
  ];
}

Line.prototype = new Shape;
Line.prototype.constructor = Line;

Line.prototype.infoText = function() {
  return "length: " + commaSep(Math.round(this.length));
}

Line.prototype.setEnd = function(point, params = {}) {
  if(this.fixedLength || this.fixedRotation || params.fixedLength || params.fixedRotation) {
    var rotation = this.fixedRotation || params.fixedRotation || new Line(this.start, point).angle;
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
  get: function() { return Angle.from(this.start, this.end); },
});

Line.prototype.drawPath = function(context) {
  context.moveTo(this.start.x, this.start.y);
  context.lineTo(this.end.x, this.end.y);
}

Line.prototype.preview = function(sketch) {
  new HorizontalLine(this.start.y).sketch(middle.context);
  new VerticalLine(this.start.x).sketch(middle.context);

  new Arc(
    this.start,
    new Point(this.start.x + 10, this.start.y),
    new Angle(0),
    this.angle
  ).draw(
    middle.context,
    {
      strokeStyle: 'blue',
      lineWidth: 0.5
    }
  );

  var angle = Angle.from(front.startPoint, front.lastPoint);
  var textAlignment = front.textAlignments[angle.quadrant % 4];
  middle.save();
    middle.context.textAlign = textAlignment.textAlign;
    middle.context.fillText(
      Math.round(this.angle.deg) + unescape("\xB0"),
      this.start.x + textAlignment.xPlus,
      this.start.y + textAlignment.yPlus
    );
  middle.restore();
  textAlignment = front.textAlignments[(angle.quadrant + 1) % 4];
  middle.save();
    middle.context.textAlign = textAlignment.textAlign;
    middle.context.fillText(
      'x: '   + Math.round(front.startPoint.x) +
      ', y: ' + Math.round(front.startPoint.y),
      this.start.x + textAlignment.xPlus,
      this.start.y + textAlignment.yPlus
    );
  middle.restore();
  if(sketch) {
    this.sketch(middle.context);
  } else {
    if(middle.showText)
      middle.context.fillText(this.infoText(), 10, 15);
    this.draw(middle.context);
  }
}

Line.prototype.translate = function(point) {
  var origDiff = { x: this.end.x - this.start.x, y: this.end.y - this.start.y };
  this.origin = point;
  this.start = point;
  this.end = new Point(this.start.x + origDiff.x, this.start.y + origDiff.y);
}

Line.prototype.rotate = function(rotation) {
  this.end = this.end.translate(this.start, rotation.rad);
  if(this.fixedRotation)
    this.fixedRotation = new Angle(this.fixedRotation.rad + rotation.rad);
}

Line.prototype.copy = function() {
  var newLine = new Line(
    new Point(this.start.x, this.start.y),
    new Point(this.end.x, this.end.y)
  );
  if(this.fixedRotation) newLine.fixedRotation = this.fixedRotation.copy();
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
    sketch: function(context) {
      this.vertical.sketch(context);
      this.horizontal.sketch(context);
    }
  }
}
