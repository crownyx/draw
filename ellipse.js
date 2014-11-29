function Ellipse(radStart, radEnd) {
  Shape.call(this);

  this.xAxis = new Line(radStart, new Point(radEnd.x,   radStart.y));
  this.yAxis = new Line(radStart, new Point(radStart.x, radEnd.y  ));
  this.center = radStart;
  this.center.shape = this;
  this.clockwise = true;

  var ellipse = this;

  this.setPoints();

  this.shiftCommands = [
    {
      key: 'r',
      forWhat: 'rotation',
      prettify: function() { return Math.round(ellipse.fixedRotation.deg) + unescape("\xB0"); },
      callback: function(deg) {
        if(deg == 'x') {
          ellipse.deleteFixedProperty('fixedRotation');
          ellipse.rotation = new Angle(0);
        } else {
          ellipse.fixedRotation = Angle.fromDeg(parseInt(deg));
          ellipse.rotation = ellipse.fixedRotation;
        }
      },
      acceptChars: ['x']
    },
    {
      key: 'x',
      forWhat: 'x-axis length',
      propertyName: 'xAxis',
      prettify: function() { return commaSep(ellipse.fixedXAxis); },
      callback: function(length) {
        if(length == 'x') {
          ellipse.deleteFixedProperty('fixedXAxis');
          delete ellipse.xAxis.fixedLength;
          delete ellipse.xAxis.fixed;
        } else {
          ellipse.fixedXAxis = parseInt(length.replace(',', ''));
          ellipse.xAxis.fixedLength = ellipse.fixedXAxis;
          ellipse.xAxis.fixed = false;
          ellipse.setEnd(front.setPoint || front.lastPoint);
          ellipse.xAxis.fixed = true; // why do we need this?
        }
      },
      acceptChars: ['x', ',']
    },
    {
      key: 'y',
      forWhat: 'y-axis length',
      propertyName: 'yAxis',
      prettify: function() { return commaSep(ellipse.fixedYAxis); },
      callback: function(length) {
        if(length == 'x') {
          ellipse.deleteFixedProperty('fixedYAxis');
          delete ellipse.yAxis.fixedLength;
          delete ellipse.yAxis.fixed;
        } else {
          ellipse.fixedYAxis = parseInt(length.replace(',', ''));
          ellipse.yAxis.fixedLength = ellipse.fixedYAxis;
          ellipse.yAxis.fixed = false;
          ellipse.setEnd(front.setPoint || front.lastPoint);
          ellipse.yAxis.fixed = true; // why do we need this?
        }
      },
      acceptChars: ['x', ',']
    }
  ];
}

Ellipse.prototype = new Shape;
Ellipse.prototype.constructor = Ellipse;

Object.defineProperty(Ellipse.prototype, 'semiMajor', {
  get: function() { return [this.yAxis, this.xAxis].maxBy('length'); }
});

Object.defineProperty(Ellipse.prototype, 'semiMinor', {
  get: function() { return [this.yAxis, this.xAxis].minBy('length'); }
});

Ellipse.prototype.setPoints = function() {
  this.center.shape = this;
  this._points = [
    this.yAxis.end,
    this.xAxis.end,
    this.yAxis.end.translate(this.center, Math.PI),
    this.xAxis.end.translate(this.center, Math.PI)
  ].map(function(point) {
    point.shape = this;
    return point;
  }, this);
}

Ellipse.prototype.drawPath = function(context) {
  var startAngle = this.startAngle || new Angle(0);
  var endAngle   = this.endAngle   || new Angle(2 * Math.PI);
  var distanceToGo = this.clockwise ? endAngle.minus(startAngle).rad : startAngle.minus(endAngle).rad;
  for(var t = 0; t < distanceToGo + 0.02; t += 0.02) {
    var currAngle = this.clockwise ? startAngle.plus(t) : startAngle.minus(t);
    var radiusEnd = this.radiusAt(currAngle).end;
    if(t === 0) {
      context.moveTo(radiusEnd.x, radiusEnd.y);
    } else {
      context.lineTo(radiusEnd.x, radiusEnd.y);
    }
  }
}

Ellipse.prototype.preview = function() {
  this.draw(middle.context);
  this.center.preview(0, 2);
  if(this.rotation.deg % 90) {
    this.yAxis.sketch(middle.context);
    this.xAxis.sketch(middle.context);
  }
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
}

Object.defineProperty(Ellipse.prototype, 'circumference', {
  get: function() {
    var a = this.semiMajor.length, b = this.semiMinor.length;
    return(
      Math.PI * (a + b) * (1 + [4,64,256,16384].reduce(function(prev, curr, i) {
        var n = i + 1;
        var h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
        var curr = (1 / curr) * Math.pow(h, n);
        return prev + curr;
      }))
    );
  }
});

Object.defineProperty(Ellipse.prototype, 'area', {
  get: function() {
    return Math.PI * this.xAxis.length * this.yAxis.length;
  }
});

Ellipse.prototype.infoText = function() {
  return(
    'x-axis length: '    + commaSep(Math.round(this.xAxis.length )) +
    ' | y-axis length: ' + commaSep(Math.round(this.yAxis.length )) +
    ' | circumference: ' + commaSep(Math.round(this.circumference)) +
    ' | area: '          + commaSep(Math.round(this.area         ))
  );
}

Ellipse.prototype.setEnd = function(point) {
  var point = point.untranslate(this.center, this.rotation);
  if(!this.yAxis.fixed) this.yAxis.setEnd(new Point(this.center.x, point.y).translate(this.center, this.rotation));
  if(!this.xAxis.fixed) this.xAxis.setEnd(new Point(point.x, this.center.y).translate(this.center, this.rotation));
  this.setPoints();
}

Ellipse.prototype.rotate = function(rotation) {
  this.rotation = this.rotation.plus(rotation);
  this.yAxis.rotate(rotation);
  this.xAxis.rotate(rotation);
}

Ellipse.prototype._reflect = function(line) {
  var reflected = this.copy();
  reflected.translate(this.center.reflect(line));

  reflected.rotation = (
    this.rotation.quadrant == 2 || this.rotation.quadrant == 4 ?
    new Angle(0) : new Angle(Math.PI)
  ).minus(this.rotation.refAngle.times(
    this.rotation.quadrant == 2 || this.rotation.quadrant == 4 ? -1 : 1
  )).plus(line.angle.times(2));

  var endPoint = new Point(
    reflected.center.x + reflected.xAxis.length,
    reflected.center.y + reflected.yAxis.length
  ).translate(reflected.center, reflected.rotation);

  reflected.setEnd(endPoint);

  return reflected;
}

Ellipse.prototype._translate = function(point) {
  this.center = point;
  this.center.shape = this;
  this.xAxis.translate(point, { by: 'start' });
  this.yAxis.translate(point, { by: 'start' });
  this.setPoints();
}

Ellipse.prototype._copy = function() {
  var ellipse = new Ellipse(this.center, this.center);
  ellipse.xAxis = this.xAxis.copy();
  ellipse.yAxis = this.yAxis.copy();
  ellipse.center = this.center.copy();
  ellipse.center.shape = ellipse;
  ellipse.rotation = this.rotation;
  ellipse.setPoints();
  return ellipse;
}

Ellipse.prototype.radiusAt = function(theta) {
  var xAxis = this.xAxis.length;
  var yAxis = this.yAxis.length;
  var theta = theta instanceof Angle ? theta.rad : theta;
  var rot = this.rotation.rad;
  var pTheta = (yAxis*yAxis - xAxis*xAxis)*Math.cos(theta - 2*rot) + (xAxis*xAxis + yAxis*yAxis)*Math.cos(theta);
  var rTheta = (yAxis*yAxis - xAxis*xAxis)*Math.cos(2*theta - 2*rot) + xAxis*xAxis + yAxis*yAxis;
  var qTheta = Math.sqrt(2)*xAxis*yAxis*Math.sqrt(rTheta - Math.pow(Math.sin(theta), 2));
  var r = (pTheta + qTheta) / rTheta;
  return(this.center.to(this.center.plus(r).translate(this.center, theta)));
}

Ellipse.prototype.intersections = function(otherShape) {
  switch(otherShape.constructor) {
    case Line:
    case Rectangle:
      return otherShape.intersections(this);
    break;
  }
}

Ellipse.prototype.intersection = function(otherShape, params = { inclusive: true }) {
  var intersection = otherShape.intersection(this);
  if(params.inclusive) {
    return intersection;
  } else {
    return(intersection.filter(function(lineOrArc) {
      return(lineOrArc instanceof Ellipse);
    }));
  }
}
