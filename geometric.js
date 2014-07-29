function Point(x, y) {
  this.x = x;
  this.y = y;
  this.toString = function() {
    return "(x: " + this.x + ", y: " + this.y + ")";
  }
  this.fill = function(context, params = {}) {
    context.beginPath();
      context.arc(this.x, this.y, params.radius, 0, 2 * Math.PI);
    context.fill();
  }
}

function getPoint(point) {
  return (new Point (
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
  var _rad = ((rad || 0) + 2 * Math.PI) % (2 * Math.PI);
  return {
    rad: _rad,
    deg: (_rad / Math.PI * 180),
    quadrant: Math.ceil(_rad / (0.5 * Math.PI)) || 4
  };
}
