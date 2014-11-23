function Ellipse(radStart, radEnd) {
  Shape.call(this);

  this.xAxis = new Line(radStart, new Point(radEnd.x,   radStart.y));
  this.yAxis = new Line(radStart, new Point(radStart.x, radEnd.y  ));
  this.center = radStart;
  this.center.shape = this;

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
  this.points = [
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
  context.save();
    context.translate(this.center.x, this.center.y);
    context.rotate(this.rotation.rad);
    context.scale(this.xAxis.length / this.semiMinor.length, this.yAxis.length / this.semiMinor.length);
    context.arc(0, 0, this.semiMinor.length, 0, 2 * Math.PI);
  context.restore();
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

Ellipse.prototype.radiusAt = function(phi) {
  var center = this.center, semiMajor = this.semiMajor.length, semiMinor = this.semiMinor.length, rotation = this.rotation.rad;
  var x = center.x + semiMajor * Math.cos(phi.rad) * Math.cos(rotation) - semiMinor * Math.sin(phi.rad) * Math.sin(rotation);
  var y = center.y + semiMajor * Math.cos(phi.rad) * Math.sin(rotation) + semiMinor * Math.sin(phi.rad) * Math.cos(rotation);
  return this.center.to(new Point(x, y));
}
