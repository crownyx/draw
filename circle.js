function Circle(radStart, radEnd) {
  Shape.call(this);

  this.radius = new Line(radStart, radEnd);
  this.center = radStart;
  this.center.shape = this;

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

Circle.prototype.setEnd = function(point) {
  this.radius.setEnd(point);
  this.center.shape = this;
}

Object.defineProperty(Circle.prototype, 'points', {
  get: function() {
    return [
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
  context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
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

Circle.prototype._translate = function(point) {
  this.center = point;
  this.center.shape = this;
}

Circle.prototype._reflect = function(line) {
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

Circle.prototype.intersections = function(otherShape) {
  switch(otherShape.constructor) {
    case Line:
    case Rectangle:
      return otherShape.intersections(this);
    break;
  }
}

Circle.prototype.intersection = function(otherShape, params) {
  params = params || { inclusive: true };
  var intersections = this.intersections(otherShape);
  var lines = [];
  var first = intersections.shift();
  var last = first;
  for(var numLeft = intersections.length - 1; intersections.length; numLeft--) {
    var next = intersections.minBy('distance', last);
    var angleToLast = Angle.from(this.center, last);
    var angleToNext = Angle.from(this.center, next);
    var startAngle, endAngle;
    if(
     (angleToLast.quadrant == 4 && angleToNext.quadrant == 1) ||
     (angleToLast.rad < angleToNext.rad)
    ) {
      startAngle = angleToLast;
      endAngle   = angleToNext;
    } else {
      startAngle = angleToNext;
      endAngle   = angleToLast;
    }
    var arc = new Arc(this.center, this.radius.end, startAngle, endAngle);// this.copy();
    //arc.startAngle = startAngle;
    //arc.endAngle   = endAngle;
    arc.clockwise = (function(circle) {
      var lesserAngle = startAngle.minus(Math.PI / 18);
      var endOfLesserAngle = circle.radiusAt(lesserAngle).end;
      var lineToEnd = otherShape.center.to(endOfLesserAngle);
      return lineToEnd.intersections(otherShape).length;
    })(this);
    lines.push(arc);
    intersections.remove(next);
    last = next;
    if(!numLeft) intersections.push(first);
  }
  return lines;
}

Circle.prototype.radiusAt = function(phi) {
  var end = this.center.plus(this.radius.length).translate(this.center, phi);
  return this.center.to(end);
}
