function Rectangle(diagStart, diagEnd) {
  Shape.call(this);

  this.diagonal = new Line(diagStart, diagEnd);
  this.origin = diagStart;

  this.lines = [this.diagonal];

  this.shiftCommands = [
    {
      key: 'a',
      forWhat: 'area',
      callback: function(area) {
        if(area == 'x') {
          delete this.fixedArea;
        } else {
          if(this.fixedPerimeter) delete this.fixedPerimeter;
          if(this.fixedRatio) delete this.fixedRatio;
          this.fixedArea = parseInt(area);
        }
      },
      acceptChars: [{ charCode: charCodes['x'], character: 'x' }]
    },
    {
      key: 'h',
      forWhat: 'height',
      callback: function(height) {
        if(height == 'x') {
          delete this.fixedHeight;
        } else {
          this.fixedHeight = parseInt(height);
        }
      },
      acceptChars: [{ charCode: charCodes['x'], character: 'x' }]
    },
    {
      key: 'l',
      forWhat: 'length',
      callback: function(length) {
        if(length == 'x') {
          delete this.fixedLength;
        } else {
          this.fixedLength = parseInt(length);
        }
      },
      acceptChars: [{ charCode: charCodes['x'], character: 'x' }]
    },
    {
      key: 'p',
      forWhat: 'perimeter',
      callback: function(measure) {
        if(measure == 'x') {
          delete this.fixedPerimeter;
        } else {
          if(this.fixedArea) delete this.fixedArea;
          if(this.fixedRatio) delete this.fixedRatio;
          this.fixedPerimeter = parseInt(measure);
        }
      },
      acceptChars: [{ charCode: charCodes['x'], character: 'x' }]
    },
    {
      key: 'r',
      forWhat: 'ratio of sides',
      subtext: '(length:height)',
      callback: function(lh) {
        if(lh == 'x') {
          delete this.fixedRatio;
        } else {
          if(this.fixedArea) delete this.fixedArea;
          if(this.fixedPerimeter) delete this.fixedPerimeter;
          this.fixedRatio = parseInt(lh.split(':')[0])/parseInt(lh.split(':')[1]);
        }
      },
      acceptChars: [
        { charCode: charCodes['x'], character: 'x' },
        { charCode: charCodes['colon'], character: ':' }
      ]
    }
  ];
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;

Object.defineProperty(Rectangle.prototype, 'length', {
  get: function() {
    if(this.fixedLength) {
      switch(new Angle(this.diagonal.angle.rad - this.rotation.rad).quadrant) {
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
      switch(new Angle(this.diagonal.angle.rad - this.rotation.rad).quadrant) {
        case 1:
        case 2: return this.fixedHeight; break;
        case 3:
        case 4: return -this.fixedHeight; break;
      }
    } else {
      var diagAngle = this.diagonal.angle.rad - this.rotation.rad;
      return Math.sin(diagAngle) * this.diagonal.length;
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
    var length = this.fixedLength || Math.cos(diagAngle.rad) * new Line(this.diagonal.start, point).length;
    var height = this.fixedHeight || Math.sin(diagAngle.rad) * new Line(this.diagonal.start, point).length;
    if(this.fixedArea) {
      if(this.fixedLength && !this.fixedHeight) {
        height = this.fixedArea / length;
      } else if(this.fixedHeight && !this.fixedLength) {
        length = this.fixedArea / height;
      } else if(!this.fixedHeight && !this.fixedLength) {
        height = Math.sqrt(this.fixedArea * Math.abs(Math.tan(currAngle.rad)));
        length = this.fixedArea / height;
      }
    }
    if(this.fixedPerimeter) {
      if(this.fixedLength && !this.fixedHeight) {
        height = (this.fixedPerimeter - length) / 2;
      } else if(this.fixedHeight && !this.fixedLength) {
        length = (this.fixedPerimeter - height) / 2;
      } else if(!this.fixedHeight && !this.fixedLength) {
        var tan = Math.abs(Math.tan(currAngle.rad));
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
      case 2: if(this.fixedLength) length = -length; break;
      case 3: if(this.fixedLength) length = -length; if(this.fixedHeight) height = -height; break;
      case 4: if(this.fixedHeight) height = -height; break;
    }
    var x = this.diagonal.start.x + length;
    var y = this.diagonal.start.y + height;
    this.diagonal.setEnd(new Point(x, y));
    this.diagonal.rotate(this.rotation);
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
  this.rotation = new Angle(this.rotation.rad + rotation.rad);
}

Rectangle.prototype.preview = function() {
  this.diagonal.sketchPreview();
  this.draw(middle.context);
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
  if(this.fixedLength || this.fixedHeight || this.fixedArea || this.fixedPerimeter || this.fixedRatio) {
    this.diagonal.end.round().preview(0, 2);
  }
}

Rectangle.prototype.copy = function() {
  var newRect = new Rectangle(this.diagonal.start.copy(), this.diagonal.end.copy());
  newRect.origin = this.origin.copy();
  newRect.diagonal = this.diagonal.copy();
  newRect.rotation = this.rotation.copy();
  newRect.fixedHeight = this.fixedHeight;
  newRect.fixedLength = this.fixedLength;
  newRect.fixedArea = this.fixedArea;
  newRect.fixedPerimeter = this.fixedPerimeter;
  newRect.fixedEnd = this.fixedEnd;
  newRect.fixedRatio = this.fixedRatio;
  return newRect;
}
