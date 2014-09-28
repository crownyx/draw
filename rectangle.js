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
        var area = parseInt(area);
        this.setEnd = function(point) {
          var angle = new Line(front.startPoint, point).angle;
          var height = Math.sqrt(area * Math.abs(Math.tan(angle.rad)));
          var length = area / height;
          this.diagonal.setEnd(new Point(
            this.diagonal.start.x + length * (angle.quadrant == 2 || angle.quadrant == 3 ? -1 : 1),
            this.diagonal.start.y + height * (angle.quadrant == 3 || angle.quadrant == 4 ? -1 : 1)
          ));
        }
      }
    },
    {
      key: 'e',
      forWhat: 'endpoint of diagonal',
      subtext: '(x & y coordinates separated by comma)',
      callback: function(xy) {
        var x = parseInt(xy.split(',')[0]), y = parseInt(xy.split(',')[1]);
        var refLine = new Line(this.diagonal.start, new Point(x, y));
        this.diagonal.fixedRotation = refLine.angle;
        this.diagonal.fixedLength = refLine.length;
      }
    },
    {
      key: 'h',
      forWhat: 'height',
      callback: function(height) { this.fixedHeight = parseInt(height); }
    },
    {
      key: 'l',
      forWhat: 'length',
      callback: function(length) { this.fixedLength = parseInt(length); }
    },
    {
      key: 'p',
      forWhat: 'perimeter',
      callback: function(measure) {
        var perimeter = parseInt(measure);
        this.setEnd = function(point) {
          var angle = new Line(front.startPoint, point).angle;
          var tan = Math.abs(Math.tan(angle.rad));
          var height = ((perimeter * tan) / 2) / (1 + tan);
          var length = (perimeter - (height * 2)) / 2;
          this.diagonal.setEnd(new Point(
            this.diagonal.start.x + length * (angle.quadrant == 2 || angle.quadrant == 3 ? -1 : 1),
            this.diagonal.start.y + height * (angle.quadrant == 3 || angle.quadrant == 4 ? -1 : 1)
          ));
        }
      }
    },
    {
      key: 'r',
      forWhat: 'ratio of sides',
      subtext: '(length:height)',
      callback: function(lh) {
        var l = parseInt(lh.split(',')[0]), h = parseInt(lh.split(',')[1]);
        this.setEnd = function(point) {
          var angle = new Line(front.startPoint, point).angle;
          var d = new Line(front.startPoint, point).length;
 	  //lengh2 + height2 = d2
          //tot = l + h
          //(l / tot)2 + (h / tot)2 = d2
          var length = Math.sqrt(((l*l) * (d*d)) / (l*l + h*h));
          var height = Math.sqrt(((h*h) * (d*d)) / (h*h + l*l));
          //var length = Math.sqrt(Math.pow(diagonal, 2) - Math.pow(h / (l + h), 2));
          //var height = Math.sqrt(Math.pow(diagonal, 2) - Math.pow(l / (l + h), 2));
          this.diagonal.setEnd(new Point(
            this.diagonal.start.x + length * (angle.quadrant == 2 || angle.quadrant == 3 ? -1 : 1),
            this.diagonal.start.y + height * (angle.quadrant == 3 || angle.quadrant == 4 ? -1 : 1)
          ));
        }
      }
    }
  ];
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;

Object.defineProperty(Rectangle.prototype, 'length', {
  get: function() {
    if(this.fixedLength) {
      return this.fixedLength;
    } else {
      var diagAngle = this.diagonal.angle.rad - this.rotation.rad;
      return Math.cos(diagAngle) * this.diagonal.length;
    }
  }
});

Object.defineProperty(Rectangle.prototype, 'height', {
  get: function() {
    if(this.fixedHeight) {
      return this.fixedHeight;
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
    return 2 * (this.height + this.length);
  }
});

Rectangle.prototype.infoText = function() {
  return(
    'length: '       + commaSep(Math.round(this.length   )) +
    ' | height: '    + commaSep(Math.round(this.height   )) +
    ' | area: '      + commaSep(Math.round(this.area     )) +
    ' | perimeter: ' + commaSep(Math.round(this.perimeter))
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
  this.diagonal.setEnd(point);
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
  this.diagonal.rotate(new Angle(rotation.rad - this.rotation.rad));
  this.rotation = rotation;
}

Rectangle.prototype.preview = function() {
  this.diagonal.preview(true);
  this.draw(middle.context);
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
}

Rectangle.prototype.copy = function() {
  var newRect = new Rectangle(this.diagonal.start.copy(), this.diagonal.end.copy());
  newRect.origin = this.origin;
  newRect.rotation = this.rotation;
  newRect.setEnd = this.setEnd;
  return newRect;
}
