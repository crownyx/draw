function Point(x, y) {
  this.x = x;
  this.y = y;

  this.toString = function() { return "(x: " + this.x + ", y: " + this.y + ")"; }

  this.fill = function(context, params = { radius: 2 }) {
    context.save();
      context.fillStyle = params.fillStyle || this.fillStyle || context.fillStyle;
      context.beginPath();
        context.arc(this.x, this.y, params.radius, 0, 2 * Math.PI);
      context.fill();
    context.restore();
  }

  this.draw = function(context, params = { radius: 2 }) {
    context.save();
      context.strokeStyle = this.strokeStyle || params.strokeStyle || context.strokeStyle;
      context.beginPath();
        context.arc(this.x, this.y, params.radius, 0, 2 * Math.PI);
      context.stroke();
    context.restore();
  }

  this.translate = function(refPoint, radians) {
    var refLine = new Line(refPoint, this);
    var origAngle = refLine.angle.rad;
    var newPoint = new Point(refPoint.x + Math.cos(radians + origAngle) * refLine.length,
                             refPoint.y + Math.sin(radians + origAngle) * refLine.length);
    return newPoint;
  }

  this.untranslate = function(refPoint) {
    var newPoint = new Point(this.x - refPoint.x, this.y - refPoint.y);
    return newPoint;
  }

  this.same = function(point, prec) {
    var pointX = prec ? point.x.toFixed(prec) : point.x;
    var thisX = prec ? this.x.toFixed(prec) : this.x;
    var pointY = prec ? point.y.toFixed(prec) : point.y;
    var thisY = prec ? this.y.toFixed(prec) : this.y;
    return pointX == thisX && pointY == thisY;
  }

  this.copy = function() {
    return new Point(this.x, this.y);
  }

  this.absolute = function() {
    if(this.shape) {
      return this.translate(this.shape.origin, this.shape.rotation.rad);
    } else {
      return this;
    }
  }
}

