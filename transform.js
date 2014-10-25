function translate(group, refPoint) {
  middle.clear();
  front.eventListeners.clear();
  front.startPoint = refPoint;

  middle.group = group;
  middle.group.origin = refPoint;

  infopanel.top = 'choose translation point, then click';
  infopanel.buttons = [
    Button('g', 'choose point', 'yellow'),
    Button('D', 'set distance', 'blue'),
    Button('esc', 'cancel', 'red')
  ];

  window.eventListeners.add('keydown', 'setDistance', function(e) {
    if(e.shiftKey && e.which == charCodes['d']) {
      getInput(
        'enter distance: ',
        function(distance) {
          front.eventListeners.add('mousemove', 'moveGroup', function(e) {
            var angle = Angle.from(front.startPoint, front.lastPoint);
            var adjusted = front.startPoint.plus(parseInt(distance)).translate(front.startPoint, angle);
            middle.group.setEnd(adjusted);
            middle.clear();
            adjusted.preview();
            middle.group.preview();
          });
        }
      )
    }
  });

  group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

  middle.group.setEnd = function(point) {
    this.origin = point;
    this.shapes.forEach(function(shape) {
      shape.refLine.translate(point);
      shape.translate(shape.refLine.end);
    });
  }

  middle.group.preview = function() {
    var translationPath = new Line(front.startPoint, middle.group.origin);
    translationPath.preview(true);
    front.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
    this.draw(middle.context);
  }

  middle.group.setEnd(front.setPoint || front.lastPoint);
  middle.clear();
  middle.group.preview();

  front.eventListeners.add('mousemove', 'moveGroup', function() {
    middle.group.setEnd(front.setPoint || front.lastPoint);
    middle.clear();
    middle.group.preview();
  });

  front.eventListeners.add('click', 'saveGroup', function() {
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

  var targetPoint = front.setPoint || front.lastPoint;

  middle.group.preview = function(point) {
    new Line(front.startPoint, point).preview(true);
    this.draw(middle.context);
  }

  infopanel.top = 'choose angle of rotation, then click.';
  infopanel.buttons = [
    Button('g', 'choose point', 'yellow'),
    Button('A', 'set angle', 'blue'),
    Button('esc', 'cancel', 'red')
  ];

  group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

  group.rotation = new Angle(0);

  middle.group.setEnd(front.setPoint || front.lastPoint);
  middle.clear();
  middle.group.preview(targetPoint);

  front.eventListeners.add('mousemove', 'setRotation', function() {
    if(!group.fixedRotation) {
      targetPoint = front.setPoint || front.lastPoint;
      middle.group.setEnd(targetPoint);
      middle.clear();
      middle.group.preview(targetPoint);
    }
  });

  window.eventListeners.add('keydown', 'setAngle', function(e) {
    if(e.shiftKey && e.which == charCodes['a']) {
      getInput(
        { main: 'enter angle:', subtext: '(degrees)' },
        function(deg) {
          if(deg == 'x') {
            delete middle.group.fixedRotation;
            targetPoint = front.lastPoint;
          } else {
            delete front.setPoint;
            if(infopanel.bottom) infopanel.bottom.remove();
            front.redraw();
            middle.group.fixedRotation = true;
            targetPoint = refPoint.plus(
              front.canvas.width
            ).translate(
              refPoint, Angle.fromDeg(parseInt(deg))
            );
          }
          middle.group.setEnd(targetPoint);
          middle.clear();
          middle.group.preview(targetPoint);
        },
        [{ charCode: charCodes['x'], character: 'x' }]
      );
    }
  });

  front.eventListeners.add('click', 'saveGroup', function() {
    group.shapes.forEach(function(shape) {
      delete shape.refLine;
      shape.complete();
    });
    changeMode(commandMode);
  });
}
