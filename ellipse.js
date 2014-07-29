function Ellipse(radStart, radEnd) {
  Shape.call(this);

  this.center = radStart;
  this.xAxis = new Line(radStart, { x: radEnd.x, y: radStart.y });
  this.yAxis = new Line(radStart, { x: radStart.x, y: radEnd.y });
  this.rotation = new Angle(0);
}

Ellipse.prototype = new Shape;
Ellipse.prototype.constructor = Ellipse;

Object.defineProperty(Ellipse.prototype, 'semiMajor', {
  get: function() {
    return this.yAxis.length >= this.xAxis.length ? this.yAxis : this.xAxis;
  }
});

Object.defineProperty(Ellipse.prototype, 'semiMinor', {
  get: function() {
    return this.yAxis.length >= this.xAxis.length ? this.xAxis : this.yAxis;
  }
});

Object.defineProperty(Ellipse.prototype, 'points', {
  get: function() {
    return [
      this.center,
      new Point(this.center.x, this.center.y - this.yAxis.length),
      new Point(this.center.x + this.xAxis.length, this.center.y),
      new Point(this.center.x, this.center.y + this.yAxis.length),
      new Point(this.center.x - this.xAxis.length, this.center.y)
    ];
  }
});

Ellipse.prototype._ownDraw = function(context) {
  context.beginPath();
    context.save();
      context.translate(this.center.x, this.center.y);
      context.rotate(this.rotation.rad);
      context.scale(this.xAxis.length / this.semiMinor.length, this.yAxis.length / this.semiMinor.length);
      context.arc(0, 0, this.semiMinor.length, 0, 2 * Math.PI);
    context.restore();
  context.stroke();
}

Ellipse.prototype.infoText = function() { return 'length'; }

Ellipse.prototype.setEnd = function(point) {
  this.yAxis.setEnd(new Point(this.center.x, point.y));
  this.xAxis.setEnd(new Point(point.x, this.center.y));
}
