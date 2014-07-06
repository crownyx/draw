function designEllipse(radStart, radEnd) {
  var ellipse = new Ellipse(radStart, radEnd);
  var startAxis = new AxisPair(radStart);
  var arcAngle = new Arc(radStart, 15, new Angle(0), ellipse.rotation);

  showEllipse();
  showInfo();

  function showEllipse() {
    ellipse.draw(front.context);

    startAxis.sketch(front.context);

    arcAngle.endAngle = ellipse.rotation;
    arcAngle.sketch(front.context);
  }

  function showInfo() {
    var text = 'center x: ' + ellipse.center.x +
               ', y: ' + ellipse.center.y +
               ', semimajor axis length: ' + ellipse.semiMajor.length.toFixed(2) +
               ', semiminor axis length: ' + ellipse.semiMinor.length.toFixed(2);
    showText(text, front.lastPoint, getAngle(radStart, front.lastPoint), front.context);

    front.context.save();
      front.context.translate(ellipse.center.x, ellipse.center.y);
      front.context.rotate(ellipse.rotation.rad);
      new Line({ x: 0, y: 0 }, { x: ellipse.xAxis.length, y: 0 }).sketch(front.context);
      new Line({ x: 0, y: 0 }, { x: 0, y: -ellipse.yAxis.length }).sketch(front.context);
    front.context.restore();

    var text = ellipse.rotation.deg.toFixed(2) + "\xB0";
    showText(text, radStart, new Angle(getAngle(radStart, front.lastPoint).rad + Math.PI), front.context);
  }

  front.eventListeners.add('mousemove', 'showEllipse', showEllipse);
  front.eventListeners.add('mousemove', 'showInfo', showInfo);
  front.eventListeners.add('mousemove', 'setRadiiEnds', function() {
    ellipse.xAxis.end.x = front.lastPoint.x;
    ellipse.yAxis.end.y = front.lastPoint.y
  });

  front.eventListeners.add('click', 'setEllipseRotation', function() {
    front.eventListeners.remove('setEllipseRotation');
    front.eventListeners.remove('setRadiiEnds');

    var origRot = new Line(radStart, front.lastPoint).angle;

    front.eventListeners.add('mousemove', 'rotateEllipse', function() {
      var currAngle = getAngle(radStart, front.lastPoint);
      ellipse.rotation = new Angle(currAngle.rad - origRot.rad);
    });

    front.eventListeners.add('click', 'complete', function() { ellipse.complete() });
  });
}

//////////////
// Ellipse: //
//////////////

function Ellipse(radStart, radEnd) {
  Shape.call(this);
  this.center = radStart;
  this.xAxis = new Line(radStart, { x: radEnd.x, y: radStart.y });
  this.yAxis = new Line(radStart, { x: radStart.x, y: radEnd.y });
  this.rotation = new Angle(0);
}

Ellipse.prototype = new Shape;
Ellipse.prototype.constructor = Ellipse;

Object.defineProperty(Ellipse.prototype, 'semiMajor', {
  get: function() {
    return this.yAxis.length >= this.xAxis.length ? this.yAxis : this.xAxis;
  }
});

Object.defineProperty(Ellipse.prototype, 'semiMinor', {
  get: function() {
    return this.yAxis.length >= this.xAxis.length ? this.xAxis : this.yAxis;
  }
});

Ellipse.prototype.draw = function(context) {
  context.beginPath();
    context.save();
      context.translate(this.center.x, this.center.y);
      context.rotate(this.rotation.rad);
      context.scale(this.xAxis.length / this.semiMinor.length, this.yAxis.length / this.semiMinor.length);
      context.arc(0, 0, this.semiMinor.length, 0, 2 * Math.PI);
    context.restore();
  context.stroke();
}
