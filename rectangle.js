function Rectangle(diagStart, diagEnd) {
  Shape.call(this);

  this.diagonal = new Line(diagStart, diagEnd);
  this.rotation = new Angle(0);

  this.controlLine = this.diagonal;
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

Object.defineProperty(Rectangle.prototype, 'points', {
  get: function() {
    var start = this.diagonal.start, end = this.diagonal.end;
    return [
      start,
      new Point(end.x, start.y),
      end,
      new Point(start.x, end.y)
    ];
  }
});

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
  context.moveTo(this.diagonal.start.x, this.diagonal.start.y);
  context.lineTo(this.diagonal.start.x, this.diagonal.end.y);
  context.lineTo(this.diagonal.end.x, this.diagonal.end.y);
  context.lineTo(this.diagonal.end.x, this.diagonal.start.y);
  context.lineTo(this.diagonal.start.x, this.diagonal.start.y);
}

Rectangle.prototype.fill = function(context) {
  context.fillRect(
    this.diagonal.start.x,
    this.diagonal.start.y,
    this.diagonal.end.x - this.diagonal.start.x,
    this.diagonal.end.y - this.diagonal.start.y
  );
}
