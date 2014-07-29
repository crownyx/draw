function Line(start, end) {
  Shape.call(this);

  this.start = start;
  this.end   = end;
}

Line.prototype = new Shape;
Line.prototype.constructor = Line;

Line.prototype.infoText = function() {
  return "length: " + this.length.toFixed(2);
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
  get: function() { return getAngle(this.start, this.end); },
});

Line.prototype._ownDraw = function(context) {
  context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
  context.stroke();
}

////////////////////
// Special Lines: //
////////////////////

function VerticalLine(x) {
  return new Line({ x: x, y: 0 }, { x: x, y: front.canvas.height });
}

function HorizontalLine(y) {
  return new Line({ x: 0, y: y }, { x: front.canvas.width, y: y });
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
