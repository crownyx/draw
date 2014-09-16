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

  this.untranslate = function(refPoint, rotation) {
    var refLine = new Line(refPoint, this);
    var origAngle = new Angle(refLine.angle.rad - rotation.rad).rad;
    var newPoint = new Point(refPoint.x + Math.cos(origAngle) * refLine.length,
                             refPoint.y + Math.sin(origAngle) * refLine.length);
    return newPoint;
  }

  this.same = function(point) {
    return(
      (
        Math.floor(point.x) == Math.round(this.x) ||
        Math.ceil(point.x)  == Math.round(this.x)
      ) &&
      (
        Math.floor(point.y) == Math.round(this.y) ||
        Math.ceil(point.y)  == Math.round(this.y)
      )
    );
  }

  this.distance = function(otherPoint) {
    return Math.sqrt(Math.pow(this.x - otherPoint.x, 2) + Math.pow(this.y - otherPoint.y, 2));
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

