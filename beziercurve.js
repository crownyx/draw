function BezierCurve(start, end, control1, control2) {
  Shape.call(this);

  this.quadratic = false;

  this.start    = start;
  this.end      = end;
  this.control1 = control1;
  this.control2 = control2;

  this.drawSteps = [
    function() { this.setEnd = function(point) { this.control1 = point; } },
    function() { this.setEnd = function(point) { this.control2 = point; } }
  ]; // remove second step when quadratic

  this.shiftCommands = [
    {
      key: 'q',
      forWhat: 'quadratic',
      type: 'toggle',
      callback: function() {
        this.quadratic = !this.quadratic;
        infopanel.top = this.name;
      }
    }
  ];
}

BezierCurve.prototype = new Shape;
BezierCurve.prototype.constructor = BezierCurve;

BezierCurve.prototype.drawPath = function(canvas) {
  canvas.context.moveTo(this.start.x, this.start.y);
  if(this.quadratic) {
    canvas.context.quadraticCurveTo(
      (this.control1 || this.start).x,
      (this.control1 || this.start).y,
      this.end.x,
      this.end.y
    );
  } else {
    canvas.context.bezierCurveTo(
      (this.control1 || this.start).x,
      (this.control1 || this.start).y,
      (this.control2 || this.control1 || this.end).x,
      (this.control2 || this.control1 || this.end).y,
      this.end.x,
      this.end.y
    );
  }
}

BezierCurve.prototype.preview = function(canvas) {
  if(this.control1) {
    new Line(this.start, this.control1).sketchPreview(canvas);
    if(this.control2) {
      new Line(this.end, this.control2).sketchPreview(canvas);
    } else {
      new Line(this.end, this.control1).sketchPreview(canvas);
    }
    //if(!this.control1.same(front.usePoint))
    //  this.control1.label(middle.context);
    //if(this.control2 && !this.control2.same(front.usePoint))
    //  this.control2.label(middle.context);
    this.draw(canvas);
  } else {
    new Line(this.start, this.end).preview(canvas);
  }
}

BezierCurve.prototype.setEnd = function(point) { this.end = point; }

BezierCurve.prototype.nextStep = function() {
  this.setEnd = function(point) { this.control1 = point; }
  this.nextStep = function() {
    if(this.quadratic) {
      Shape.prototype.nextStep.call(this);
    } else {
      this.nextStep = Shape.prototype.nextStep;
    }
  }
}

Object.defineProperty(BezierCurve.prototype, 'center', {
  get: function() {
    var center = new Line(this.start, this.end).mid;
    center.shape = this;
    return center;
  }
});

Object.defineProperty(BezierCurve.prototype, 'points', {
  get: function() {
    var points = [
      this.start,
      this.center,
      this.control1,
      this.end
    ];
    if(!this.quadratic) points.splice(2, 0, this.control2);
    return points.map(function(point) {
      point.shape = this;
      return point;
    }, this);
  }
});

BezierCurve.prototype._translate = function(transPoint) {
  var center = this.center;
  ['start', 'control1', 'control2', 'end'].forEach(function(point) {
    if(this[point]) {
      var refLine = new Line(center, this[point]);
      refLine.translate(transPoint, { by: 'start' });
      this[point] = refLine.end;
    }
  }, this);
}

BezierCurve.prototype.rotate = function(rotation) {
  var center = this.center;
  ['start', 'control1', 'control2', 'end'].forEach(function(point) {
    if(this[point]) {
      var refLine = new Line(center, this[point]);
      refLine.rotate(rotation, { by: 'start' });
      this[point] = refLine.end;
    }
  }, this);
}

BezierCurve.prototype.copy = function() {
  var curve = new BezierCurve(
    this.start.copy(),
    this.end.copy(),
    this.control1.copy()
  );
  if(!this.quadratic) curve.control2 = this.control2.copy();
  curve.quadratic = this.quadratic;
  return curve;
}

Object.defineProperty(BezierCurve.prototype, 'name', {
  get: function() {
    return 'Bezier Curve, ' + (this.quadratic ? 'Quadratic ' : 'Cubic ');
  }
});
