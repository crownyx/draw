function Angle(rad) {
  if(rad && !(rad % (2 * Math.PI))) {
    rad = 2 * Math.PI;
  } else if(rad < 0) {
    do {
      rad += 2 * Math.PI;
    } while(rad < 0);
  } else {
    rad = (rad || 0) % (2 * Math.PI);
  }
  this.rad = rad;
}

Object.defineProperty(Angle.prototype, 'quadrant', {
  get: function() {
    return Math.ceil(this.rad / (0.5 * Math.PI)) || 4;
  }
});

Object.defineProperty(Angle.prototype, 'deg', {
  get: function() {
    return this.rad / Math.PI * 180;
  }
});

Object.defineProperty(Angle.prototype, 'perp', {
  get: function() {
    return new Angle(this.rad + Math.PI);
  }
});

Object.defineProperty(Angle.prototype, 'refAngle', {
  get: function() {
    switch(this.quadrant) {
      case 1: return new Angle(this.rad              ); break;
      case 2: return new Angle(Math.PI - this.rad    ); break;
      case 3: return new Angle(this.rad - Math.PI    ); break;
      case 4: return new Angle(2 * Math.PI - this.rad); break;
    }
  }
});

Angle.prototype.sin  = function() { return Math.sin(this.rad); }
Angle.prototype.cos  = function() { return Math.cos(this.rad); }
Angle.prototype.tan  = function() { return Math.tan(this.rad); }
Angle.prototype.asin = function() { return Math.atan(this.rad); }
Angle.prototype.acos = function() { return Math.acos(this.rad); }
Angle.prototype.atan = function() { return Math.atan(this.rad); }

Angle.prototype.plus  = function(otherAngle) {
  return new Angle(this.rad + (otherAngle instanceof Angle ? otherAngle.rad : otherAngle));
}

Angle.prototype.minus = function(otherAngle) {
  return new Angle(this.rad - (otherAngle instanceof Angle ? otherAngle.rad : otherAngle));
}

Angle.prototype.times = function(multiple) {
  return new Angle(this.rad * multiple);
}

Angle.prototype.halfway = function(otherAngle) {
  var diff;
  if(this.rad < otherAngle.rad || this.equals(otherAngle)) {
    diff = otherAngle.rad - this.rad;
  } else {
    diff = otherAngle.rad + 2 * Math.PI - this.rad;
  }
  return this.plus(diff / 2);
}

Angle.prototype.equals = function(otherAngle) {
  var thisRad  = Math.round(this.rad * 1000)       === Math.round(2 * Math.PI * 1000) ? 0 : this.rad;
  var otherRad = Math.round(otherAngle.rad * 1000) === Math.round(2 * Math.PI * 1000) ? 0 : otherAngle.rad;
  return Math.round(thisRad * 1000) === Math.round(otherRad * 1000);
}

Angle.prototype.draw = function(context, params = {}) {
  new Arc(
    this.center,
    this.center.plus(params.radius || 10),
    new Angle(0),
    this
  ).draw(context, params.style);
}

Angle.prototype.preview = function() {
  this.draw(middle.context, { style: { strokeStyle: 'blue', lineWidth: 0.5 } });

  var angle = Angle.from(front.startPoint, front.lastPoint);
  var textAlignment = front.textAlignments[angle.quadrant % 4];

  middle.save();
    middle.context.textAlign = textAlignment.textAlign;
    middle.context.fillText(
      Math.round(this.deg) + unescape("\xB0"),
      this.center.x + textAlignment.xPlus,
      this.center.y + textAlignment.yPlus
    );
  middle.restore();
}

Angle.prototype.copy = function() { return new Angle(this.rad); }

Angle.from = function(start, end) {
  var atan = Math.atan((end.y - start.y) / (end.x - start.x));
  return new Angle(
    end.x > start.x ? 2 * Math.PI + atan :
    end.x < start.x ? Math.PI + atan     :
    end.y > start.y ? 0.5 * Math.PI      :
    end.y < start.y ? 1.5 * Math.PI      :
    0
  );
}

Angle.fromDeg = function(deg) {
  return new Angle(deg / 180 * Math.PI);
}
