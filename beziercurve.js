function BezierCurve(start, end, control1, control2) {
  Shape.call(this);

  this.quadratic = false;

  this.start    = start;
  this.end      = end;
  this.control1 = control1;
  this.control2 = control2;

  this.lines = [];

  this.shiftCommands = [
    {
      key: 'q',
      forWhat: 'quadratic',
      type: 'toggle',
      callback: function() {
        this.quadratic = !this.quadratic;
        front.infodiv.getElementsByClassName('box')[0].textContent = this.name;
      }
    }
  ];
}

BezierCurve.prototype = new Shape;
BezierCurve.prototype.constructor = BezierCurve;

BezierCurve.prototype.preview = function() {
  new Line(this.start, this.end).preview(true);
  this.draw(middle.context);
}

BezierCurve.prototype.drawPath = function(context) {
  context.moveTo(this.start.x, this.start.y);
  if(this.quadratic) {
    context.quadraticCurveTo(
      (this.control1 || this.start).x,
      (this.control1 || this.start).y,
      this.end.x,
      this.end.y
    );
  } else {
    context.bezierCurveTo(
      (this.control1 || this.start).x,
      (this.control1 || this.start).y,
      (this.control2 || this.control1 || this.end).x,
      (this.control2 || this.control1 || this.end).y,
      this.end.x,
      this.end.y
    );
  }
}

BezierCurve.prototype.setEnd = function(point) { this.end = point; }

BezierCurve.prototype.nextStep = function() {
  this.setEnd = function(point) { this.control1 = point; }
  this.preview = function() {
    new Line(this.start, this.control1).preview(true);
    new Line(this.end, this.control1).sketch(middle.context);
    new AxisPair(this.end).sketch(middle.context);
    this.draw(middle.context);
  }
  this.nextStep = function() {
    if(this.quadratic) {
      Shape.prototype.nextStep.call(this);
    } else {
      this.setEnd = function(point) { this.control2 = point; }
      this.preview = function() {
        new Line(this.start, this.control1).preview(true);
        new Line(this.end, this.control2).sketch(middle.context);
        new AxisPair(this.end).sketch(middle.context);
        new AxisPair(this.control1).sketch(middle.context);
        this.draw(middle.context);
      }
      this.nextStep = Shape.prototype.nextStep;
    }
  }
}

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

Object.defineProperty(BezierCurve.prototype, 'center', {
  get: function() {
    return new Line(this.start, this.end).mid;
  }
});

Object.defineProperty(BezierCurve.prototype, 'origin', {
  get: function() { return this.center; }
});

BezierCurve.prototype.translate = function(transPoint) {
  var center = this.center;
  ['start', 'control1', 'control2', 'end'].forEach(function(point) {
    if(this[point]) {
      var refLine = new Line(center, this[point]);
      refLine.translate(transPoint);
      this[point] = refLine.end;
    }
  }, this);
}

BezierCurve.prototype.rotate = function(rotation) {
  var center = this.center;
  ['start', 'control1', 'control2', 'end'].forEach(function(point) {
    if(this[point]) {
      var refLine = new Line(center, this[point]);
      refLine.rotate(rotation);
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
