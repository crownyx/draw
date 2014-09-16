function Arc(radiusStart, radiusLength, startAngle, endAngle) {
  Shape.call(this);

  this.center = radiusStart;
  this.startAngle = startAngle || new Angle(0);
  this.endAngle = endAngle || new Angle(2 * Math.PI);
  this.radiusLength = radiusLength || 0;

  this._workingAngle = function() { return this.startAngle; }
}

Arc.prototype = new Shape;
Arc.prototype.constructor = Arc;

Arc.prototype.infoText = function() { return ''; }

Arc.prototype.drawPath = function(context, params = { counterClock: false }) {
  context.arc(this.center.x, this.center.y, this.radiusLength, this.startAngle.rad, this.endAngle.rad, params.counterClock);
}

Arc.prototype.setEnd = function(point) {
  var line = new Line(this.center, point);
  this.radiusEnd = point;
  this.radiusLength = line.length;
  this.startAngle = line.angle;
}

Arc.prototype.nextStep = function() {
  this.setEnd = function(point) {
    this.endAngle = new Line(this.center, point).angle;
    this.radiusEnd = new Point(
      this.center.x + Math.cos(this.endAngle.rad) * this.radiusLength,
      this.center.y + Math.sin(this.endAngle.rad) * this.radiusLength
    );
  }
  this._workingAngle = function() { return this.endAngle; }
  this.nextStep = Shape.prototype.nextStep;
}

Arc.prototype.preview = function() {
  new HorizontalLine(this.center.y).sketch(middle.context);
  new Line(this.center, this.radiusEnd).sketch(middle.context);
  new Arc(this.center, 15, 0, this._workingAngle()).sketch(middle.context);
  front.context.save();
    middle.context.textAlign = 'right';
    middle.context.fillText(
      this._workingAngle().deg.toFixed(2) + unescape("\xB0"),
      front.lastPoint.x - 10,
      front.lastPoint.y + 15
    );
  middle.context.restore();
  this.draw(middle.context);
}
