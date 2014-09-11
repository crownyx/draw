function Arc(radiusStart, radiusLength, startAngle, endAngle) {
  Shape.call(this);

  this.center = radiusStart;
  this.startAngle = startAngle || new Angle(0);
  this.endAngle = endAngle || new Angle(2 * Math.PI);
  this.radiusLength = radiusLength || 0;
}

Arc.prototype = new Shape;
Arc.prototype.constructor = Arc;

Arc.prototype.infoText = function() {
  return '';
}

Arc.prototype.drawPath = function(context) {
  context.arc(this.center.x, this.center.y, this.radiusLength, this.startAngle.rad, this.endAngle.rad);
}

Arc.prototype.setEnd = function(point) {
  var line = new Line(this.center, point);
  this.radiusLength = line.length;
  this.startAngle = line.angle;
}

Arc.prototype.nextStep = function() {
  this.setEnd = function(point) { this.endAngle = new Line(this.center, point).angle; }
  this.nextStep = Shape.prototype.nextStep;
}
