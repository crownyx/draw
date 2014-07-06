function designCir(radStart, radEnd) {
  var circle = new Circle(radStart, radEnd);
  var startAxis = new AxisPair(radStart);

  showCircle();
  showInfo();

  displayHelpText('circle', 'c', [
    '[R]: set radius length'
  ]);

  function showCircle() {
    circle.draw(front.context);

    startAxis.sketch(front.context);
  }

  function showInfo() {
    new AxisPair(circle.center).sketch(front.context);
    circle.radius.sketch(front.context);

    var text = 'center x: ' + circle.center.x + ', y: ' + circle.center.y + ', radius length: ' + circle.radius.length.toFixed(2);
    showText(text, front.lastPoint, getAngle(radStart, front.lastPoint), front.context);
  }

  front.eventListeners.add('mousemove', 'setEnd', function() {
    circle.radius.setEnd(front.lastPoint);
  });
  front.eventListeners.add('mousemove', 'showCircle', showCircle);
  front.eventListeners.add('mousemove', 'showInfo', showInfo);
  front.eventListeners.add('click', 'saveCir', function() { circle.complete(); });

  window.eventListeners.add('keydown', 'circleCommands', function(e) {
    if(e.shiftKey) {
      switch(e.which) {
        case charCodes['r']:
          getInput('enter radius length: ', function(input) {
            circle.radius.fixedLength = parseInt(input);
            circle.radius.setEnd(front.lastPoint);
            front.clear();
            front.showAxes();
            showCircle();
            showInfo();
          });
        break;
      }
    }
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
