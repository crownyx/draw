function Rectangle(diagStart, diagEnd) {
  Shape.call(this);

  this.diagonal = new Line(diagStart, diagEnd);
  this.diag = this.diagonal;
  this.origin = diagStart;

  this.lines = [this.diagonal];

  this.shiftCommands = [
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
  ];
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;

Object.defineProperty(Rectangle.prototype, 'length', {
  get: function() {
    return this.fixedLength || Math.abs(this.diagonal.end.x - this.diagonal.start.x);
  }
});

Object.defineProperty(Rectangle.prototype, 'height', {
  get: function() {
    return this.fixedHeight || Math.abs(this.diagonal.end.y - this.diagonal.start.y);
  }
});

Rectangle.prototype.infoText = function() {
  return(
    'length: '    + commaSep(Math.round(this.length)) +
    ' | height: ' + commaSep(Math.round(this.height))
  );
}

Object.defineProperty(Rectangle.prototype, 'center', {
  get: function() { return this.points.center; }
});

Object.defineProperty(Rectangle.prototype, 'points', {
  get: function() {
    var corner1 = this.origin;
    var corner2 = new Point(this.diagonal.start.x, this.diagonal.end.y);
    var corner3 = this.diagonal.end;
    var corner4 = new Point(this.diagonal.end.x, this.diagonal.start.y);
    var center  = new Line(corner1, corner3).mid;
    return {
      corner1: corner1,
      corner2: corner2,
      corner3: corner3,
      corner4: corner4,
      center: center
    }.map(function(name, point) {
      var point = point.translate(this.origin, this.rotation.rad);
      point.shape = this;
      return point;
    }, this);
  }
});

Rectangle.prototype.setEnd = function(point) {
  var point = point.untranslate(this.origin, this.rotation);

  var quad = getAngle(this.diagonal.start, point).quadrant;

  var x = this.fixedLength ?
          this.diagonal.start.x + (quad == 2 || quad == 3 ? -1 : 1) * this.length :
          point.x;
  var y = this.fixedHeight ?
          this.diagonal.start.y + (quad == 3 || quad == 4 ? -1 : 1) * this.height :
          point.y;

  this.diagonal.setEnd(new Point(x, y));
  this.diag = this.diagonal.copy();
  this.diag.setEnd(new Point(
    this.diagonal.start.x + this.diagonal.length * Math.cos(this.diagonal.angle.rad + this.rotation.rad),
    this.diagonal.start.y + this.diagonal.length * Math.sin(this.diagonal.angle.rad + this.rotation.rad)
  ));
}

Rectangle.prototype.drawPath = function(context) {
  context.moveTo(0, 0);
  context.lineTo(this.diagonal.end.x - this.diagonal.start.x, 0);
  context.lineTo(this.diagonal.end.x - this.diagonal.start.x, this.diagonal.end.y - this.diagonal.start.y);
  context.lineTo(0, this.diagonal.end.y - this.diagonal.start.y);
  context.lineTo(0, 0);
}

Rectangle.prototype.rotate = function(rotation) {
  this.diag = this.diagonal.copy();
  this.diag.setEnd(new Point(
    this.diagonal.start.x + this.diagonal.length * Math.cos(this.diagonal.angle.rad + rotation.rad),
    this.diagonal.start.y + this.diagonal.length * Math.sin(this.diagonal.angle.rad + rotation.rad)
  ));
  this.rotation = rotation;
}

Rectangle.prototype.preview = function() {
  this.diag.preview(true);
  this.draw(middle.context);
}

Rectangle.prototype.copy = function() {
  var newRect = new Rectangle(this.diagonal.start.copy(), this.diagonal.end.copy());
  newRect.origin = this.origin;
  newRect.rotation = this.rotation;
  return newRect;
}
