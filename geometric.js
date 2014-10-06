function getPoint(point) {
  return (new Point(
    point.pageX - front.canvas.offsetLeft,
    point.pageY - front.canvas.offsetTop
  ));
}

function getAngle(lineStart, lineEnd) {
  var adjacent = new Line({ x: 0, y: 0 }, { x: lineEnd.x - lineStart.x, y: 0 }).length;
  var hypotenuse = new Line(lineStart, lineEnd).length;
  var rotation = (function() {
    var refAngle = Math.acos(adjacent / hypotenuse);
    switch(getQuadrant(lineStart, lineEnd)) {
      case 1: return refAngle;               break;
      case 2: return Math.PI - refAngle;     break;
      case 3: return Math.PI + refAngle;     break;
      case 4: return 2 * Math.PI - refAngle; break;
    }
  })();
  return new Angle(rotation);
}

function getQuadrant(lineStart, lineEnd) {
  if(lineEnd.x >= lineStart.x && lineEnd.y > lineStart.y) {
    return 1;
  } else if(lineEnd.x < lineStart.x && lineEnd.y >= lineStart.y) {
    return 2;
  } else if(lineEnd.x <= lineStart.x && lineEnd.y < lineStart.y) {
    return 3;
  } else {
    return 4;
  }
}

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
    }
  };
}
