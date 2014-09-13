function Circle(radStart, radEnd) {
  Shape.call(this);

  this.origin = radStart;
  this.radius = new Line(radStart, radEnd);

  this.lines = [this.radius];
}

Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;

Circle.prototype.setEnd = function(point) { this.radius.end = point; }

Object.defineProperty(Circle.prototype, 'center', {
  get: function() { return this.origin; }
});

Object.defineProperty(Circle.prototype, 'points', {
  get: function() {
    return [
      this.center,
      new Point(this.center.x, this.center.y - this.radius.length),
      new Point(this.center.x + this.radius.length, this.center.y),
      new Point(this.center.x, this.center.y + this.radius.length),
      new Point(this.center.x - this.radius.length, this.center.y)
    ].map(function(point) {
      var point = point.translate(this.origin, this.rotation.rad);
      point.shape = this;
      return point;
    }, this);
  }
});

Circle.prototype.drawPath = function(context) {
  context.arc(0, 0, this.radius.length, 0, 2 * Math.PI);
}

Circle.prototype.preview = function() {
  this.radius.preview(true);
  this.draw(front.context);
}

Circle.prototype.fill = function(context) {
  context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.fill();
}

Circle.prototype.infoText = function() {
  return "radius: " + this.radius.length.toFixed(2);
}

Circle.prototype.copy = function() {
  return new Circle(this.radius.start.copy(), this.radius.end.copy());
}
