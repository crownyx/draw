function Arc(radiusStart, radiusEnd, startAngle, endAngle) {
  Shape.call(this);

  this.startRadius = new Line(radiusStart, radiusEnd);
  if(startAngle) this.startRadius.setEnd(radiusEnd, { fixedAngle: startAngle });

  this.endRadius = this.startRadius.copy();
  this.endRadius.setEnd(
    this.endRadius.end, { fixedAngle: endAngle || new Angle(2 * Math.PI) }
  );

  this.clockwise = true;

  this.lines = [this.startRadius, this.endRadius];
  this.origin = radiusStart;

  this._workingRadius = function() { return this.startRadius; }
  this._otherRadius = function() { return this.endRadius; }

  this.shiftCommands = [
    {
      key: 'c',
      forWhat: 'clockwise',
      type: 'toggle',
      callback: function() { this.clockwise = !this.clockwise; }
    },
    {
      key: 'e',
      forWhat: 'end angle',
      subtext: '(in degrees)',
      callback: function(deg) {
        this.endRadius.fixedAngle = new Angle(parseInt(deg) / 180 * Math.PI);
        this.nextStep = Shape.prototype.nextStep;
      }
    },
    {
      key: 'r',
      forWhat: 'radius length',
      callback: function(length) {
        this.startRadius.fixedLength = parseInt(length);
        this.endRadius.fixedLength = parseInt(length);
      }
    },
    {
      key: 's',
      forWhat: 'start angle',
      subtext: '(in degrees)',
      callback: function(deg) {
        this.startRadius.fixedAngle = new Angle(parseInt(deg) / 180 * Math.PI);
      }
    }
  ];
}

Arc.prototype = new Shape;
Arc.prototype.constructor = Arc;

Object.defineProperty(Arc.prototype, 'points', {
  get: function() {
    return {
      end1: this.startRadius.end,
      end2: this.endRadius.end,
      center: this.origin
    }.map(function(name, point) {
      point.shape = this;
      return point;
    }, this);
  }
});

Object.defineProperty(Arc.prototype, 'center', {
  get: function() { return this.origin; }
});

Arc.prototype.infoText = function() {
  return(
    'radius length: ' + Math.round(this.startRadius.length) +
    ' | start angle: ' + Math.round(this.startRadius.angle.deg) + unescape('\xB0') +
    ' | end angle: ' + Math.round(this.endRadius.angle.deg) + unescape('\xB0')
  );
}

Arc.prototype.drawPath = function(context) {
  context.arc(
    this.center.x,
    this.center.y,
    this.startRadius.length,
    this.startRadius.angle.rad,
    this.endRadius.angle.rad,
    !this.clockwise
  );
}

Arc.prototype.setEnd = function(point) {
  this._workingRadius().setEnd(point);
  this._otherRadius().setEnd(point, { fixedAngle: this._otherRadius().angle });
}

Arc.prototype.nextStep = function() {
  this._workingRadius = function() { return this.endRadius; }
  this._otherRadius = function() { return this.startRadius; }
  this.nextStep = Shape.prototype.nextStep;
}

Arc.prototype.rotate = function(rotation) {
  this.lines.forEach(function(line) {
    line.rotate(new Angle(rotation.rad - this.rotation.rad));
  }, this);
  this.rotation = rotation;
}

Arc.prototype.preview = function() {
  this._workingRadius().preview(true);
  this._otherRadius().sketch(middle.context);
  this.draw(middle.context);
  if(middle.showText) middle.context.fillText(this.infoText(), 10, 15);
}

Arc.prototype._copy = function() {
  var arc = new Arc(this.center, this.startRadius.end);
  arc.endRadius = this.endRadius.copy();
  arc.clockwise = this.clockwise;
  return arc;
}
