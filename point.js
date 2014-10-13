function Point(x, y) {
  this.x = x;
  this.y = y;

  this.toString = function() { return "(x: " + this.x + ", y: " + this.y + ")"; }

  this.fill = function(context, params = {}) {
    context.save();
      context.fillStyle = params.fillStyle || this.fillStyle || context.fillStyle;
      context.beginPath();
        context.arc(this.x, this.y, params.radius || 2, 0, 2 * Math.PI);
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
        Math.floor(point.x) == Math.floor(this.x) ||
        Math.ceil(point.x)  == Math.ceil(this.x)  ||
        Math.floor(point.x) == Math.ceil(this.x)  ||
        Math.ceil(point.x)  == Math.floor(this.x)
      ) &&
      (
        Math.floor(point.y) == Math.floor(this.y) ||
        Math.ceil(point.y)  == Math.ceil(this.y)  ||
        Math.floor(point.y) == Math.ceil(this.y)  ||
        Math.ceil(point.y)  == Math.floor(this.y)
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

  this.preview = function() {
    new AxisPair(this).sketch(middle.context);
    var angle = Angle.from(front.startPoint, front.lastPoint);
    var textAlignment = front.textAlignments[(angle.quadrant + 1) % 4];
    middle.save();
      middle.context.textAlign = textAlignment.textAlign;
      middle.context.fillText(
        'x: '   + Math.round(front.startPoint.x) +
        ', y: ' + Math.round(front.startPoint.y),
        this.x + textAlignment.xPlus,
        this.y + textAlignment.yPlus
      );
    middle.restore();
  }
}

Point.from = function(point) {
  return(new Point(
    point.pageX - front.canvas.offsetLeft,
    point.pageY - front.canvas.offsetTop
  ));
}
