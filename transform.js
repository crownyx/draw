function translate(group, refPoint) {
  middle.clear();
  front.eventListeners.clear();
  front.startPoint = refPoint;

  middle.group = group;


  group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

  middle.group.setEnd = function(point) {
    this.shapes.forEach(function(shape) {
      shape.refLine.translate(point);
      shape.translate(shape.refLine.end);
    });
  }

  middle.group.preview = function() {
    var translationPath = new Line(front.startPoint, front.setPoint || front.lastPoint);
    translationPath.preview(true);
    front.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
    this.draw(middle.context);
  }

  middle.group.setEnd(front.setPoint || front.lastPoint);
  middle.clear();
  middle.group.preview();

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

  front.eventListeners.add('mousemove', 'moveGroup', function() {
    middle.group.setEnd(front.setPoint || front.lastPoint);
    middle.clear();
    middle.group.preview();
  });

  front.eventListeners.add('click', 'saveGroup', function() {
    middle.group.setEnd(front.setPoint || front.lastPoint);
    middle.group.shapes.forEach(function(shape) {
      delete shape.refLine;
      shape.complete();
    });
    changeMode(commandMode);
  });
}

////////////
// rotate //
////////////

function rotate(group, refPoint) {
  middle.clear();
  front.eventListeners.clear();
  front.startPoint = refPoint;

  middle.group = group;

  middle.group.setEnd = function(point) {
    if(point.distance(front.startPoint) > 5) {
      var angle = Angle.from(front.startPoint, point);
      this.shapes.forEach(function(shape) {
        shape.refLine.rotate(angle.minus(this.rotation));
        shape.translate(shape.refLine.end);
        shape.rotate(angle.minus(this.rotation));
      }, this);
      this.rotation = angle;
    }
  }

  middle.group.preview = function() {
    new Line(front.startPoint, front.setPoint || front.lastPoint).preview(true);
    this.draw(middle.context);
  }

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

  group.rotation = new Angle(0);

  middle.group.setEnd(front.setPoint || front.lastPoint);
  middle.clear();
  middle.group.preview();

  front.eventListeners.add('mousemove', 'setRotation', function() {
    middle.group.setEnd(front.setPoint || front.lastPoint);
    middle.clear();
    middle.group.preview();
  });

  front.eventListeners.add('click', 'saveGroup', function() {
    middle.group.setEnd(front.setPoint || front.lastPoint);
    middle.clear();
    group.shapes.forEach(function(shape) {
      delete shape.refLine;
      shape.complete();
    });
    changeMode(commandMode);
  });
}
