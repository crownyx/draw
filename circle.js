function Circle(radStart, radEnd) {
  Shape.call(this);

  this.origin = radStart;
  this.radius = new Line(radStart, radEnd);

  this.lines = [this.radius];

  var circle = this;

  this.shiftCommands = [
    {
      key: 'a',
      forWhat: 'area',
      callback: function(area) {
        circle.radius.fixedLength = Math.sqrt(parseInt(area) / Math.PI);
      }
    },
    {
      key: 'c',
      forWhat: 'circumference',
      callback: function(circ) {
        circle.radius.fixedLength = parseInt(circ) / (2 * Math.PI);
      }
    },
    {
      key: 'r',
      forWhat: 'radius length',
      callback: function(length) { circle.radius.fixedLength = parseInt(length); }
    }
  ];
}

Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;

Circle.prototype.setEnd = function(point) { this.radius.setEnd(point); }

Object.defineProperty(Circle.prototype, 'center', {
  get: function() { return this.origin; }
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
      var point = point.translate(this.origin, this.rotation.rad);
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
  this.radius.preview(true);
  this.draw(middle.context);
}

Circle.prototype.fill = function(context) {
  context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.fill();
}

Circle.prototype.infoText = function() {
  return(
    'radius length: '    + commaSep(Math.round(this.radius.length)) +
    ' | circumference: ' + commaSep(Math.round(this.circumference)) +
    ' | area: '          + commaSep(Math.round(this.area)         )
  );
}

Circle.prototype.copy = function() { return new Circle(this.radius.start.copy(), this.radius.end.copy()); }
