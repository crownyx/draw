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

  this.translate = function(refPoint, rotation) {
    var refLine = new Line(refPoint, this);
    var origAngle = refLine.angle.rad;
    var newPoint = new Point(refPoint.x + Math.cos(rotation.rad + origAngle) * refLine.length,
                             refPoint.y + Math.sin(rotation.rad + origAngle) * refLine.length);
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

  this.plus = function(x, y) {
    if(typeof x == 'number') return new Point(this.x + x, this.y + (y || 0));
    if(x instanceof Point) return new Point(this.x + x.x, this.y + x.y);
  }

  this.minus = function(x, y) {
    if(typeof x == 'number') return new Point(this.x - x, this.y - (y || 0));
    if(x instanceof Point) return new Point(this.x - x.x, this.y - x.y);
  }

  this.to = function(endPoint) { return new Line(this, endPoint); }

  this.reflect = function(line) {
    var lineToThis = line.start.to(this);
    return this.translate(line.start, line.angle.times(2).plus(lineToThis.angle.refAngle.times(2)));
  }

  this.copy = function() { return new Point(this.x, this.y); }

  this.round = function() { return new Point(Math.round(this.x), Math.round(this.y)); }

  this.absolute = function() {
    if(this.shape) {
      return this.translate(this.shape.origin, this.shape.rotation.rad);
    } else {
      return this;
    }
  }

  this.preview = function(angle, quadAdd = -1, params = {}) {
    new AxisPair(this).sketch(middle.context, params);
    this.showCoords(middle.context, angle, quadAdd + 2 ? quadAdd : -1);
  }

  this.showCoords = function(context, angle, quadAdd = -1) {
    var angle = angle || Angle.from(front.startPoint, front.lastPoint);
    var textAlignment = front.textAlignments[(angle.quadrant + quadAdd) % 4];
    context.save();
      context.textAlign = textAlignment.textAlign;
      context.fillText(
        "x: "   + this.x +
        ", y: " + this.y,
        this.x + textAlignment.xPlus,
        this.y + textAlignment.yPlus
      );
    context.restore();
  }
}

Point.from = function(point) {
  return(point instanceof Point ? point :
    new Point(
      point.pageX - front.canvas.offsetLeft,
      point.pageY - front.canvas.offsetTop
    )
  );
}
