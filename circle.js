function designCir(radStart, radEnd) {
  displayHelpText('circle', 'c', [
    '[R]: set radius length'
  ]);

  var circle = new Circle(radStart, radEnd);
  circle.draw(front.context);
  showInfo();

  front.eventListeners.add('mousemove', 'showCir', function(e) {
    circle.radius.end = getPoint(e);
    circle.draw(front.context);
  });

  function showInfo(e) {
    var currPoint = (e ? getPoint(e) : front.lastPoint);

    new AxisPair(circle.center).sketch(front.context);
    circle.radius.sketch(front.context);

    var text = 'center x: ' + circle.center.x + ', y: ' + circle.center.y + ', radius length: ' + circle.radius.length.toFixed(2);
    showText(text, currPoint, getAngle(radStart, currPoint), front.context);
  }

  front.eventListeners.add('mousemove', 'showInfo', showInfo);

  front.eventListeners.add('click', 'saveCir', function(e) {
    front.stopDrawing(true);
    circle.draw(back.context);
  });
}

/////////////
// Circle: //
/////////////

function Circle(radStart, radEnd) {
  Shape.call(this);
  this.center = radStart;
  this.radius = new Line(radStart, radEnd);
}

Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;

Circle.prototype.draw = function(context) {
  context.beginPath();
    context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
  context.stroke();
}
