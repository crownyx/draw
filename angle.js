function Angle(rad) {
  var _rad = (rad && !(rad % (2 * Math.PI)) ? rad : ((rad || 0) + 2 * Math.PI) % (2 * Math.PI));
  var _quad = Math.ceil(_rad / (0.5 * Math.PI)) || 4;
  return {
    rad: _rad,
    deg: (_rad / Math.PI * 180),
    quadrant: _quad,
    get perp() {
      return new Angle(this.rad + Math.PI);
    },
    refAngle: (function() {
      switch(_quad) {
        case 1: return _rad; break;
        case 2: return Math.PI - _rad; break;
        case 3: return _rad - Math.PI; break;
        case 4: return 2 * Math.PI - _rad; break;
      }
    })(),
    plus: function(otherAngle) {
      return new Angle(this.rad + otherAngle.rad);
    },
    minus: function(otherAngle) {
      return new Angle(this.rad - otherAngle.rad);
    },
    copy: function() {
      return new Angle(this.rad);
    }
  };
}

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
