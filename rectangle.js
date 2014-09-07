function Rectangle(diagStart, diagEnd) {
  Shape.call(this);

  this.diagonal = new Line(diagStart, diagEnd);
  this.origin = diagStart;

  this.controlLine = this.diagonal;

  var rect = this;

  this.shiftCommands = [
    {
      key: 'l',
      forWhat: 'length',
      callback: function(length) { rect.fixedLength = length; }
    },
    {
      key: 'h',
      forWhat: 'height',
      callback: function(height) { rect.fixedHeight = height; }
    }
  ];
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;

Object.defineProperty(Rectangle.prototype, 'length', {
  get: function() {
    return this.fixedLength || Math.abs(this.diagonal.end.x - this.diagonal.start.x);
  }
});

Object.defineProperty(Rectangle.prototype, 'height', {
  get: function() {
    return this.fixedHeight || Math.abs(this.diagonal.end.y - this.diagonal.start.y);
  }
});

Rectangle.prototype.infoText = function() {
  return 'length: ' + this.length.toFixed(2) + ', height: ' + this.height.toFixed(2);
}

Object.defineProperty(Rectangle.prototype, 'center', {
  get: function() { return this.points[this.points.length - 1]; }
});

Object.defineProperty(Rectangle.prototype, 'points', {
  get: function() {
    var corner1 = this.origin;
    var corner2 = new Point(this.diagonal.start.x, this.diagonal.end.y);
    var corner3 = this.diagonal.end;
    var corner4 = new Point(this.diagonal.end.x, this.diagonal.start.y);
    var center  = new Line(corner1, corner3).mid;
    return [
      corner1,
      corner2,
      corner3,
      corner4,
      center
    ].map(function(point) {
      var point = point.translate(this.origin, this.rotation.rad);
      point.shape = this;
      return point;
    }, this);
  }
});

Rectangle.prototype.translate = function(point) {
  this.origin = point;
  this.diagonal.translate(new Point(
    point.x + Math.cos(this.diagonal.angle.rad) * (this.diagonal.length / 2),
    point.y + Math.sin(this.diagonal.angle.rad) * (this.diagonal.length / 2)
  ));
}

Rectangle.prototype.rotate = function(rotation) { this.rotation = rotation; }

Rectangle.prototype.setEnd = function(point) {
  var quad = (this.inRotation ? this.diagonal.angle : getAngle(this.diagonal.start, point)).quadrant;

  var x = this.fixedLength ?
          this.diagonal.start.x + (quad == 2 || quad == 3 ? -1 : 1) * this.length :
          point.x;
  var y = this.fixedHeight ?
          this.diagonal.start.y + (quad == 3 || quad == 4 ? -1 : 1) * this.height :
          point.y;

 this.diagonal.setEnd(new Point(x, y));
}

Rectangle.prototype.drawPath = function(context) {
  context.moveTo(0, 0);
  context.lineTo(this.diagonal.end.x - this.diagonal.start.x, 0);
  context.lineTo(this.diagonal.end.x - this.diagonal.start.x, this.diagonal.end.y - this.diagonal.start.y);
  context.lineTo(0, this.diagonal.end.y - this.diagonal.start.y);
  context.lineTo(0, 0);
}

Rectangle.prototype.fill = function(context, params) {
  context.save();
    context.fillStyle = params.fillStyle || this.fillStyle || context.fillStyle;
    context.fillRect(
      this.diagonal.start.x,
      this.diagonal.start.y,
      this.diagonal.end.x - this.diagonal.start.x,
      this.diagonal.end.y - this.diagonal.start.y
    );
  context.restore();
}

Rectangle.prototype.copy = function() {
  var newRect = new Rectangle(this.diagonal.start.copy(), this.diagonal.end.copy());
  newRect.origin = this.origin;
  newRect.rotation = this.rotation;
  return newRect;
}
