function Circle(radStart, radEnd) {
  Shape.call(this);
  this.center = radStart;
  this.radius = new Line(radStart, radEnd);
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

Circle.prototype.draw = function(context) {
  context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.stroke();
}

Circle.prototype.fill = function(context) {
  context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.fill();
}

Circle.prototype.infoText = function() {
  return "radius: " + this.radius.length.toFixed(2);
}
