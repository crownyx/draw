function Circle(radStart, radEnd) {
  Shape.call(this);

  this.origin = radStart;
  this.radius = new Line(radStart, radEnd);

  var circle = this;

  this.shiftCommands = [
    {
      key: 'a',
      forWhat: 'area',
      prettify: function() { return commaSep(circle.fixedArea); },
      callback: function(area) {
        if(area == 'x') {
          delete circle.radius.fixedLength;
          circle.deleteFixedProperty('fixedArea');
        } else {
          circle.deleteFixedProperty('fixedCircumference', 'fixedRadius');
          circle.fixedArea = parseInt(area.replace(',', ''));
          circle.radius.fixedLength = Math.sqrt(circle.fixedArea / Math.PI);
        }
      },
      acceptChars: ['x', ',']
    },
    {
      key: 'c',
      forWhat: 'circumference',
      prettify: function() { return commaSep(circle.fixedCircumference); },
      callback: function(circum) {
        if(circum == 'x') {
          delete circle.radius.fixedLength;
          circle.deleteFixedProperty('fixedCircumference');
        } else {
          circle.deleteFixedProperty('fixedArea', 'fixedRadius');
          circle.fixedCircumference = parseInt(circum.replace(',', ''));
          circle.radius.fixedLength = circle.fixedCircumference / (2 * Math.PI);
        }
      },
      acceptChars: ['x', ',']
    },
    {
      key: 'r',
      forWhat: 'radius length',
      propertyName: 'radius',
      prettify: function() { return commaSep(circle.fixedRadius); },
      callback: function(length) {
        if(length == 'x') {
          delete circle.radius.fixedLength;
          circle.deleteFixedProperty('fixedRadius');
        } else {
          circle.deleteFixedProperty('fixedArea', 'fixedCircumference');
          circle.fixedRadius = parseInt(length.replace(',', ''));
          circle.radius.fixedLength = circle.fixedRadius;
        }
      },
      acceptChars: ['x', ',']
    }
  ];
}

Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;

Circle.prototype.setEnd = function(point) { this.radius.setEnd(point); }

Object.defineProperty(Circle.prototype, 'center', {
  get: function() { return this.origin; }
});

Object.defineProperty(Circle.prototype, 'lines', {
  get: function() { return [this.radius]; }
});

Object.defineProperty(Circle.prototype, 'points', {
  get: function() {
    return [
      this.center,
      new Point(this.center.x, this.center.y - this.radius.length),
      new Point(this.center.x + this.radius.length, this.center.y),
      new Point(this.center.x, this.center.y + this.radius.length),
      new Point(this.center.x - this.radius.length, this.center.y)
    ].map(function(point) {
      point.shape = this;
      return point;
    }, this);
  }
});

Object.defineProperty(Circle.prototype, 'circumference', {
  get: function() {
    return this.radius.length * 2 * Math.PI;
  }
});

Object.defineProperty(Circle.prototype, 'area', {
  get: function() {
    return Math.pow(this.radius.length, 2) * Math.PI;
  }
});

Circle.prototype.drawPath = function(context) {
  context.save();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.restore();
}

Circle.prototype.preview = function() {
  this.radius.sketchPreview();
  this.draw(middle.context);
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
}

Circle.prototype.fill = function(context) {
  context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.fill();
}

Circle.prototype.reflect = function(line) {
  var reflected = this.copy();
  var lineToCenter = this.center.reflect(line);
  return reflected.translate(lineToCenter);
}

Circle.prototype.infoText = function() {
  return(
    'radius length: '    + commaSep(Math.round(this.radius.length)) +
    ' | circumference: ' + commaSep(Math.round(this.circumference)) +
    ' | area: '          + commaSep(Math.round(this.area         ))
  );
}

Circle.prototype._copy = function() {
  var circle = new Circle(this.radius.start.copy(), this.radius.end.copy());
  circle.radius.fixedLength = this.radius.fixedLength;
  return circle;
}
