function translate(group, refPoint) {
  middle.clear();
  front.eventListeners.clear();
  front.startPoint = refPoint;

  group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

  middle.clear();
  var translationPath = new Line(refPoint, front.lastPoint);
  translationPath.preview(true);
  front.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
  group.shapes.forEach(function(shape) {
    shape.refLine.translate(front.lastPoint);
    shape.translate(shape.refLine.end);
  });
  group.draw(middle.context);

  replaceInfoText([
    {
      className: 'box',
      textContent: 'move shape(s), then click to save'
    },
    {
      className: 'button',
      textContent: 'esc:cancel',
      color: 'red'
    }
  ]);

  front.eventListeners.add('mousemove', 'moveGroup', function(e) {
    middle.clear();
    translationPath = new Line(refPoint, Point.from(e));
    translationPath.preview(true);
    front.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
    group.shapes.forEach(function(shape) {
      shape.refLine.translate(Point.from(e));
      shape.translate(shape.refLine.end);
    });
    group.draw(middle.context);
  });

  front.eventListeners.add('click', 'saveGroup', function(e) {
    group.shapes.forEach(function(shape) {
      shape.refLine.translate(Point.from(e));
      shape.translate(shape.refLine.end);
      delete shape.refLine;
      shape.complete();
    });
    changeMode(commandMode);
  });
}

function rotate(group, refPoint) {
  middle.clear();
  front.eventListeners.clear();
  front.startPoint = refPoint;

  replaceInfoText([
    {
      className: 'box',
      textContent: 'choose angle of rotation, then click.'
    },
    {
      className: 'button',
      textContent: 'esc:cancel',
      color: 'red'
    }
  ]);

  group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

  var angle = new Angle(0);

  middle.clear();
  var oldAngle = angle;
  angle = Angle.from(refPoint, front.lastPoint);
  new Line(refPoint, front.lastPoint).preview(true);
  group.shapes.forEach(function(shape) {
    shape.refLine.rotate(angle.minus(oldAngle));
    shape.translate(shape.refLine.end);
    shape.rotate(angle.minus(oldAngle));
  });
  group.draw(middle.context);

  front.eventListeners.add('mousemove', 'setRotation', function(e) {
    middle.clear();

    var currPoint = Point.from(e);
    var oldAngle = angle;

    angle = Angle.from(refPoint, currPoint);
    new Line(refPoint, currPoint).preview(true);

    group.shapes.forEach(function(shape) {
      shape.refLine.rotate(new Angle(angle.rad - oldAngle.rad));
      shape.translate(shape.refLine.end);
      shape.rotate(new Angle(angle.rad - oldAngle.rad));
    });
    group.draw(middle.context);
  });

  front.eventListeners.add('click', 'saveGroup', function(e) {
    var currPoint = Point.from(e);
    var oldAngle = angle;

    angle = Angle.from(refPoint, currPoint);

    group.shapes.forEach(function(shape) {
      shape.refLine.rotate(new Angle(angle.rad - oldAngle.rad));
      shape.translate(shape.refLine.end);
      shape.rotate(new Angle(angle.rad - oldAngle.rad));
      delete shape.refLine;
      shape.complete();
    });
    changeMode(commandMode);
  });
}
