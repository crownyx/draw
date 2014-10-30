function Rectangle(diagStart, diagEnd) {
  Shape.call(this);

  this.diagonal = new Line(diagStart, diagEnd);
  this.origin = diagStart;

  this.lines = [this.diagonal];

  var rectangle = this;

  this.shiftCommands = [
    {
      key: 'a',
      forWhat: 'area',
      prettify: function() { return commaSep(rectangle.fixedArea); },
      callback: function(area) {
        if(area == 'x') {
          rectangle.deleteFixedProperty('fixedArea');
        } else {
          rectangle.deleteFixedProperty('fixedPerimeter', 'fixedRatio');
          if(rectangle.fixedLength && rectangle.fixedHeight)
            rectangle.deleteFixedProperty('fixedLength', 'fixedHeight');
          rectangle.fixedArea = parseInt(area.replace(',', ''));
        }
      },
      acceptChars: ['x', ',']
    },
    {
      key: 'h',
      forWhat: 'height',
      prettify: function() { return commaSep(rectangle.fixedHeight); },
      callback: function(height) {
        if(height == 'x') {
          rectangle.deleteFixedProperty('fixedHeight');
        } else {
          if(rectangle.fixedLength)
            rectangle.deleteFixedProperty('fixedArea', 'fixedPerimeter', 'fixedRatio');
          rectangle.fixedHeight = parseInt(height.replace(',', ''));
        }
      },
      acceptChars: ['x', ',']
    },
    {
      key: 'l',
      forWhat: 'length',
      prettify: function() { return commaSep(rectangle.fixedLength); },
      callback: function(length) {
        if(length == 'x') {
          rectangle.deleteFixedProperty('fixedLength');
        } else {
          if(rectangle.fixedHeight)
            rectangle.deleteFixedProperty('fixedArea', 'fixedPerimeter', 'fixedRatio');
          rectangle.fixedLength = parseInt(length.replace(',', ''));
        }
      },
      acceptChars: ['x', ',']
    },
    {
      key: 'p',
      forWhat: 'perimeter',
      prettify: function() { return commaSep(rectangle.fixedPerimeter); },
      callback: function(measure) {
        if(measure == 'x') {
          rectangle.deleteFixedProperty('fixedPerimeter');
        } else {
          rectangle.deleteFixedProperty('fixedArea', 'fixedRatio');
          if(rectangle.fixedLength && rectangle.fixedHeight) {
            rectangle.deleteFixedProperty('fixedLength', 'fixedHeight');
          }
          rectangle.fixedPerimeter = parseInt(measure.replace(',', ''));
        }
      },
      acceptChars: ['x', ',']
    },
    {
      key: 'r',
      forWhat: 'rotation',
      subtext: '(degrees)',
      prettify: function() { return Math.round(rectangle.fixedRotation.deg) + unescape("\xB0"); },
      callback: function(deg) {
        if(deg == 'x') {
          rectangle.deleteFixedProperty('fixedRotation');
          rectangle.rotation = new Angle(0);
        } else {
          rectangle.fixedRotation = Angle.fromDeg(parseInt(deg));
          rectangle.rotation = rectangle.fixedRotation;
        }
      },
      acceptChars: ['x']
    },
    {
      key: 's',
      forWhat: 'ratio of sides',
      propertyName: 'ratio',
      subtext: '(length:height)',
      prettify: function() {
        return String(rectangle.fixedRatioNumerator) + ':' + String(rectangle.fixedRatioDenominator);
      },
      callback: function(lh) {
        if(lh == 'x') {
          rectangle.deleteFixedProperty('fixedRatio', 'fixedRatioNumerator', 'fixedRatioDenominator');
        } else {
          rectangle.deleteFixedProperty('fixedArea', 'fixedPerimeter');
          if(rectangle.fixedLength && rectangle.fixedHeight) {
            rectangle.deleteFixedProperty('fixedLength', 'fixedHeight');
          }
          rectangle.fixedRatioNumerator = parseInt(lh.split(':')[0]);
          rectangle.fixedRatioDenominator = parseInt(lh.split(':')[1]);
          rectangle.fixedRatio = rectangle.fixedRatioNumerator/rectangle.fixedRatioDenominator;
        }
      },
      acceptChars: ['x', ':']
    }
  ];
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;

Object.defineProperty(Rectangle.prototype, 'length', {
  get: function() {
    if(this.fixedLength) {
      switch(this.diagonal.angle.minus(this.rotation).quadrant) {
        case 1:
        case 4: return this.fixedLength; break;
        case 2:
        case 3: return -this.fixedLength; break;
      }
    } else {
      var diagAngle = this.diagonal.angle.minus(this.rotation);
      return Math.cos(diagAngle.rad) * this.diagonal.length;
    }
  }
});

Object.defineProperty(Rectangle.prototype, 'height', {
  get: function() {
    if(this.fixedHeight) {
      switch(this.diagonal.angle.minus(this.rotation).quadrant) {
        case 1:
        case 2: return this.fixedHeight; break;
        case 3:
        case 4: return -this.fixedHeight; break;
      }
    } else {
      var diagAngle = this.diagonal.angle.minus(this.rotation);
      return Math.sin(diagAngle.rad) * this.diagonal.length;
    }
  }
});

Object.defineProperty(Rectangle.prototype, 'area', {
  get: function() {
    return this.height * this.length;
  }
});

Object.defineProperty(Rectangle.prototype, 'perimeter', {
  get: function() {
    return 2 * (Math.abs(this.height) + Math.abs(this.length));
  }
});

Rectangle.prototype.infoText = function() {
  return(
    'length: '       + commaSep(Math.abs(Math.round(this.length   ))) +
    ' | height: '    + commaSep(Math.abs(Math.round(this.height   ))) +
    ' | area: '      + commaSep(Math.abs(Math.round(this.area     ))) +
    ' | perimeter: ' + commaSep(Math.abs(Math.round(this.perimeter)))
  );
}

Object.defineProperty(Rectangle.prototype, 'center', {
  get: function() { return this.points.center; }
});

Object.defineProperty(Rectangle.prototype, 'points', {
  get: function() {
    var corner1 = this.diagonal.start;
    var corner2 = new Point(
      corner1.x + Math.cos(this.rotation.rad) * this.length,
      corner1.y + Math.sin(this.rotation.rad) * this.length
    );
    var corner3 = this.diagonal.end;
    var corner4 = new Point(
      corner1.x + Math.cos(this.rotation.rad + (0.5 * Math.PI)) * this.height,
      corner1.y + Math.sin(this.rotation.rad + (0.5 * Math.PI)) * this.height
    );
    var center  = new Line(corner1, corner3).mid;
    return {
      corner1: corner1,
      corner2: corner2,
      corner3: corner3,
      corner4: corner4,
      center: center
    }.map(function(name, point) {
      point.shape = this;
      return point;
    }, this);
  }
});

Rectangle.prototype.setEnd = function(point) {
  if(this.fixedHeight || this.fixedLength || this.fixedArea || this.fixedPerimeter || this.fixedRatio) {
    var diagAngle = Angle.from(this.diagonal.start, point).minus(this.rotation);
    var length = this.fixedLength || Math.abs(Math.cos(diagAngle.rad) * new Line(this.diagonal.start, point).length);
    var height = this.fixedHeight || Math.abs(Math.sin(diagAngle.rad) * new Line(this.diagonal.start, point).length);
    if(this.fixedArea) {
      if(this.fixedLength && !this.fixedHeight) {
        height = this.fixedArea / length;
      } else if(this.fixedHeight && !this.fixedLength) {
        length = this.fixedArea / height;
      } else if(!this.fixedHeight && !this.fixedLength) {
        height = Math.sqrt(this.fixedArea * Math.abs(Math.tan(diagAngle.rad)));
        length = this.fixedArea / height;
      }
    }
    if(this.fixedPerimeter) {
      if(this.fixedLength && !this.fixedHeight) {
        height = (this.fixedPerimeter - length * 2) / 2;
      } else if(this.fixedHeight && !this.fixedLength) {
        length = (this.fixedPerimeter - height * 2) / 2;
      } else if(!this.fixedHeight && !this.fixedLength) {
        var tan = Math.abs(Math.tan(diagAngle.rad));
        height = this.fixedPerimeter * tan / 2 / (1 + tan);
        length = (this.fixedPerimeter - height * 2) / 2;
      }
    }
    if(this.fixedRatio) {
      if(this.fixedLength && !this.fixedHeight) {
        height = this.fixedLength / this.fixedRatio;
      } else if(this.fixedHeight && !this.fixedLength) {
        length = this.fixedRatio * this.fixedHeight;
      } else if(!this.fixedHeight && !this.fixedLength) {
        var hypotenuse = new Line(this.diagonal.start, point);
        var angle = Math.atan(1 / this.fixedRatio);
        height = Math.sin(angle) * hypotenuse.length;
        length = Math.cos(angle) * hypotenuse.length;
      }
    }
    switch(diagAngle.quadrant) {
      case 2: length = -length; break;
      case 3: length = -length; height = -height; break;
      case 4: height = -height; break;
    }
    var x = this.diagonal.start.x + length;
    var y = this.diagonal.start.y + height;
    this.diagonal.setEnd(new Point(x, y));
    this.diagonal.rotate(this.fixedRotation || this.rotation);
  } else {
    this.diagonal.setEnd(point);
  }
}

Rectangle.prototype.drawPath = function(context) {
  context.moveTo(this.points.corner1.x, this.points.corner1.y);
  context.lineTo(this.points.corner2.x, this.points.corner2.y);
  context.lineTo(this.points.corner3.x, this.points.corner3.y);
  context.lineTo(this.points.corner4.x, this.points.corner4.y);
  context.lineTo(this.points.corner1.x, this.points.corner1.y);
}

Rectangle.prototype.translate = function(point) {
  this.diagonal.translate(point);
  this.origin = this.diagonal.start;
}

Rectangle.prototype.rotate = function(rotation) {
  this.diagonal.rotate(rotation);
  this.rotation = this.rotation.plus(rotation);
}

Rectangle.prototype.preview = function() {
  this.diagonal.sketchPreview();
  this.draw(middle.context);
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
  if(this.fixedLength || this.fixedHeight || this.fixedArea || this.fixedPerimeter || this.fixedRatio) {
    this.diagonal.end.round().preview(0, 2, { strokeStyle: 'green' });
  }
}

Rectangle.prototype.copy = function() {
  var newRect = new Rectangle(this.diagonal.start.copy(), this.diagonal.end.copy());
  newRect.origin = this.origin.copy();
  newRect.diagonal = this.diagonal.copy();
  newRect.rotation = this.rotation.copy();
  newRect.fixedRotation = this.fixedRotation;
  newRect.fixedHeight = this.fixedHeight;
  newRect.fixedLength = this.fixedLength;
  newRect.fixedArea = this.fixedArea;
  newRect.fixedPerimeter = this.fixedPerimeter;
  newRect.fixedEnd = this.fixedEnd;
  newRect.fixedRatio = this.fixedRatio;
  return newRect;
}
