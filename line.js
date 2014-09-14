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
      key: 'e',
      forWhat: 'endpoint',
      subtext: '(x & y coordinates separated by comma)',
      callback: function(xy) {
        var x = parseInt(xy.split(',')[0]), y = parseInt(xy.split(',')[1]);
        var refLine = new Line(line.start, new Point(x, y));
        line.fixedRotation = refLine.angle;
        line.fixedLength = refLine.length;
      }
    },
    {
      key: 'l',
      forWhat: 'length',
      callback: function(length) { line.fixedLength = parseInt(length); }
    },
    {
      key: 's',
      forWhat: 'startpoint',
      subtext: '(x & y coordinates separated by comma)',
      callback: function(xy) {
        var x = parseInt(xy.split(',')[0]), y = parseInt(xy.split(',')[1]);
        line.start = new Point(x, y);
        line.origin = new Point(x, y);
      }
    }
  ];
}

Line.prototype = new Shape;
Line.prototype.constructor = Line;

Line.prototype.infoText = function() {
  return "length: " + Math.round(this.length);
}

Line.prototype.setEnd = function(point) {
  if(this.fixedLength || this.fixedRotation) {
    var rotation = this.fixedRotation || new Line(this.start, point).angle;
    var length   = this.fixedLength || new Line(this.start, point).length;
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
      var point = point.translate(this.origin, this.rotation.rad);
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
  get: function() { return getAngle(this.start, this.end); },
});

Line.prototype.drawPath = function(context) {
  context.moveTo(0, 0);
  context.lineTo(this.end.x - this.start.x, this.end.y - this.start.y);
}

Line.prototype.preview = function(sketch) {
  new HorizontalLine(this.start.y).sketch(middle.context);
  new VerticalLine(this.start.x).sketch(middle.context);
  new Arc(this.start, 10, new Angle(0), this.angle).draw(middle.context, { strokeStyle: 'blue', lineWidth: 0.5 });
  var angle = getAngle(front.startPoint, front.lastPoint);
  var textAlignment = front.textAlignments[(angle.quadrant + 1) % 4];
  middle.save();
    middle.context.textAlign = textAlignment.textAlign;
    middle.context.fillText(
      Math.round(this.angle.deg) + unescape("\xB0"),
      this.start.x + textAlignment.xPlus,
      this.start.y + textAlignment.yPlus
    );
  middle.restore();
  sketch ? this.sketch(middle.context) : this.draw(middle.context);
}

Line.prototype.translate = function(point) {
  var origDiff = { x: this.end.x - this.start.x, y: this.end.y - this.start.y };
  this.origin = point;
  this.start = point;
  this.end = new Point(this.start.x + origDiff.x, this.start.y + origDiff.y);
}

Line.prototype.copy = function() {
  return new Line(
    new Point(this.start.x, this.start.y),
    new Point(this.end.x, this.end.y)
  );
}

////////////////////
// Special Lines: //
////////////////////

function VerticalLine(x) {
  return new Line({ x: x, y: 0 }, { x: x, y: front.canvas.height });
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
