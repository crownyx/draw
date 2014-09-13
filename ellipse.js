function Ellipse(radStart, radEnd) {
  Shape.call(this);

  this.origin = radStart;

  this.xAxis = new Line(radStart, { x: radEnd.x, y: radStart.y });
  this.yAxis = new Line(radStart, { x: radStart.x, y: radEnd.y });
  this.rotation = new Angle(0);

  this.shiftCommands = [];
}

Ellipse.prototype = new Shape;
Ellipse.prototype.constructor = Ellipse;

Object.defineProperty(Ellipse.prototype, 'center', {
  get: function() {
    return this.origin;
  }
});

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
    return {
      yTop: new Point(this.center.x, this.center.y - this.yAxis.length),
      xRight: new Point(this.center.x + this.xAxis.length, this.center.y),
      yBottom: new Point(this.center.x, this.center.y + this.yAxis.length),
      xLeft: new Point(this.center.x - this.xAxis.length, this.center.y),
      center: this.center
    }.map(function(name, point) {
      var point = point.translate(this.origin, this.rotation.rad);
      point.shape = this;
      return point;
    }, this);
  }
});

Object.defineProperty(Ellipse.prototype, 'controlLine', {
  get: function() {
    return new Line(
      this.center,
      new Point(this.yAxis.end.x, this.xAxis.end.y)
    );
  }
});

Ellipse.prototype.drawPath = function(context) {
  context.save();
    context.scale(this.xAxis.length / this.semiMinor.length, this.yAxis.length / this.semiMinor.length);
    context.arc(0, 0, this.semiMinor.length, 0, 2 * Math.PI);
  context.restore();
}

Ellipse.prototype.infoText = function() { return 'length'; }

Ellipse.prototype.setEnd = function(point) {
  var point = point.untranslate(this.origin, this.rotation);
  if(!this.yAxis.fixed) this.yAxis.setEnd(new Point(this.origin.x, point.y));
  if(!this.xAxis.fixed) this.xAxis.setEnd(new Point(point.x, this.origin.y));
}

Ellipse.prototype.translate = function(point) {
  this.origin = point;
  this.xAxis.translate(point);
  this.yAxis.translate(point);
}

Ellipse.prototype.rotate = function(rotation) { this.rotation = rotation; }

Ellipse.prototype.copy = function() {
  var ellipse = new Ellipse(this.center, this.center);
  ellipse.xAxis = new Line(this.center.copy(), this.xAxis.end.copy());
  ellipse.yAxis = new Line(this.center.copy(), this.yAxis.end.copy());
  ellipse.origin = this.origin;
  ellipse.rotation = this.rotation;
  return ellipse;
}
