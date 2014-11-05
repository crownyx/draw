function Ellipse(radStart, radEnd) {
  Shape.call(this);

  this.origin = radStart;

  this.xAxis = new Line(radStart, new Point(radEnd.x,   radStart.y));
  this.yAxis = new Line(radStart, new Point(radStart.x, radEnd.y  ));
  this.rotation = new Angle(0);

  this.lines = [this.yAxis, this.xAxis];

  var ellipse = this;

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

Object.defineProperty(Ellipse.prototype, 'center', {
  get: function() { return this.origin; }
});

Object.defineProperty(Ellipse.prototype, 'semiMajor', {
  get: function() { return [this.yAxis, this.xAxis].maxBy('length'); }
});

Object.defineProperty(Ellipse.prototype, 'semiMinor', {
  get: function() { return [this.yAxis, this.xAxis].minBy('length'); }
});

Object.defineProperty(Ellipse.prototype, 'points', {
  get: function() {
    return {
      yTop: new Point(this.center.x, this.center.y - this.yAxis.length),
      xRight: new Point(this.center.x + this.xAxis.length, this.center.y),
      yBottom: new Point(this.center.x, this.center.y + this.yAxis.length),
      xLeft: new Point(this.center.x - this.xAxis.length, this.center.y),
      center: this.center
    }.map(function(name, point) {
      var point = point.translate(this.origin, this.rotation);
      point.shape = this;
      return point;
    }, this);
  }
});

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
  this.yAxis.end.round().showCoords(middle.context, 0, 2);
  this.xAxis.end.round().showCoords(middle.context, 0, 2);
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
}

Ellipse.prototype.translate = function(point) {
  this.origin = point;
  this.xAxis.translate(point);
  this.yAxis.translate(point);
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
  var point = point.untranslate(this.origin, this.rotation);
  if(!this.yAxis.fixed) this.yAxis.setEnd(new Point(this.origin.x, point.y).translate(this.origin, this.rotation));
  if(!this.xAxis.fixed) this.xAxis.setEnd(new Point(point.x, this.origin.y).translate(this.origin, this.rotation));
}

Ellipse.prototype.rotate = function(rotation) {
  this.rotation = this.rotation.plus(rotation);
  this.yAxis.rotate(rotation);
  this.xAxis.rotate(rotation);
}

Ellipse.prototype._copy = function() {
  var ellipse = new Ellipse(this.center, this.center);
  ellipse.xAxis = this.xAxis.copy();
  ellipse.yAxis = this.yAxis.copy();
  ellipse.origin = this.origin;
  ellipse.rotation = this.rotation;
  return ellipse;
}
