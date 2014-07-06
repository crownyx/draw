function designEllipse(radStart, radEnd) {
  var ellipse = new Ellipse(radStart, radEnd);
  ellipse.draw(front.context);

  function showInfo(e) {
    var currPoint = (e ? getPoint(e) : front.lastPoint);

    new AxisPair(ellipse.center).sketch(front.context);
    new Arc(ellipse.center, 15, new Angle(0), ellipse.rotation).sketch(front.context);

    var text = 'center x: ' + ellipse.center.x +
               ', y: ' + ellipse.center.y +
               ', semimajor axis length: ' + ellipse.semiMajor.length.toFixed(2) +
               ', semiminor axis length: ' + ellipse.semiMinor.length.toFixed(2);
    showText(text, currPoint, getAngle(radStart, currPoint), front.context);

    front.context.save();
      front.context.translate(ellipse.center.x, ellipse.center.y);
      front.context.rotate(ellipse.rotation.rad);
      new Line({ x: 0, y: 0 }, { x: ellipse.xAxis.length, y: 0 }).sketch(front.context);
      new Line({ x: 0, y: 0 }, { x: 0, y: -ellipse.yAxis.length }).sketch(front.context);
    front.context.restore();

    var text = ellipse.rotation.deg.toFixed(2) + "\xB0";
    showText(text, radStart, new Angle(getAngle(radStart, currPoint).rad + Math.PI), front.context);
  }

  front.eventListeners.add('mousemove', 'showInfo', showInfo);

  front.eventListeners.add('mousemove', 'setRadiiEnds', function(e) {
    var currPoint = getPoint(e);
    ellipse.xAxis.end.x = currPoint.x;
    ellipse.yAxis.end.y = currPoint.y
    ellipse.draw(front.context);
  });

  front.eventListeners.add('click', 'setEllipseRotation', function(e) {
    front.eventListeners.remove('setEllipseRotation');
    front.eventListeners.remove('setRadiiEnds');

    var origRot  = new Line(radStart, getPoint(e)).angle;

    front.eventListeners.add('mousemove', 'rotateEllipse', function(e) {
      var currAngle = getAngle(radStart, getPoint(e));
      ellipse.rotation = new Angle(currAngle.rad - origRot.rad);
      ellipse.draw(front.context);
    });

    front.eventListeners.add('click', 'complete', ellipse.complete);
  });
}

function Ellipse(radStart, radEnd) {
  return Shape({
    center: radStart,
    xAxis: new Line(radStart, { x: radEnd.x, y: radStart.y }),
    yAxis: new Line(radStart, { x: radStart.x, y: radEnd.y }),
    get semiMajor() { return this.yAxis.length >= this.xAxis.length ? this.yAxis : this.xAxis; },
    get semiMinor() { return this.yAxis.length >= this.xAxis.length ? this.xAxis : this.yAxis; },
    rotation: new Angle(0),
    draw: function(context) {
      context.beginPath();
        context.save();
          context.translate(this.center.x, this.center.y);
          context.rotate(this.rotation.rad);
          context.scale(this.xAxis.length / this.semiMinor.length, this.yAxis.length / this.semiMinor.length);
          context.arc(0, 0, this.semiMinor.length, 0, 2 * Math.PI);
        context.restore();
      context.stroke();
    }
  });
}
