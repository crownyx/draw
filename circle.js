function Circle(radStart, radEnd) {
  Shape.call(this);
  this.center = radStart;
  this.radius = new Line(radStart, radEnd);

  this.controlLine = this.radius;
}

Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;

Circle.prototype.setEnd = function(point) { this.radius.end = point; }

Object.defineProperty(Circle.prototype, 'points', {
  get: function() {
    return [
      this.center,
      new Point(this.center.x, this.center.y - this.radius.length),
      new Point(this.center.x + this.radius.length, this.center.y),
      new Point(this.center.x, this.center.y + this.radius.length),
      new Point(this.center.x - this.radius.length, this.center.y)
    ];
  }
});

Circle.prototype.drawPath = function(context) {
  context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
}

Circle.prototype.fill = function(context) {
  context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.fill();
}

Circle.prototype.infoText = function() {
  return "radius: " + this.radius.length.toFixed(2);
}

Circle.prototype.translate = function(point) {
  var xDiff = point.x - this.center.x;
  var yDiff = point.y - this.center.y;
  this.center = point;
  this.radius = new Line(point, new Point(this.radius.end.x + xDiff, this.radius.end.y + yDiff));
}

Circle.prototype.copy = function() {
  return new Circle(
    new Point(this.radius.start.x, this.radius.start.y),
    new Point(this.radius.end.x, this.radius.end.y)
  );
}
