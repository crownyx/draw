function translate(group, refPoint) {
  middle.clear();
  front.eventListeners.clear();
  front.startPoint = refPoint;

  middle.group = group;
  middle.group.origin = refPoint;

  infopanel.top = 'choose translation point, then click';
  infopanel.buttons = [
    Button('c',   'clip',         'green'),
    Button('d',   'delete',       'green'),
    Button('m',   'mirror',       'green'),
    Button('r',   'rotate',       'green'),
    Button('s',   'style',        'green'),
    Button('t',   'translate',    'green'),
    Button('g',   'choose point', 'yellow'),
    Button('A',   'set angle',    'blue'),
    Button('D',   'set distance', 'blue'),
    Button('esc', 'cancel',       'red')
  ];

  window.eventListeners.add('keydown', 'setDistance', function(e) {
    if(e.shiftKey && e.which == charCodes['d']) {
      getInput(
        'enter distance: ',
        function(distance) {
          if(distance == 'x') {
            delete middle.group.fixedDistance;
          } else {
            middle.group.fixedDistance = parseInt(distance.replace(',', ''));
            middle.group.setEnd(front.lastPoint);
            middle.clear();
            middle.group.preview();
          }
        },
        ['x', ',']
      )
    }
  });

  window.eventListeners.add('keydown', 'setAngle', function(e) {
    if(e.shiftKey && e.which == charCodes['a']) {
      getInput(
        { main: 'enter angle: ', subtext: '(in degrees)' },
        function(deg) {
          if(deg == 'x') {
            delete middle.group.fixedAngle;
          } else {
            middle.group.fixedAngle = Angle.fromDeg(parseInt(deg));
            middle.group.setEnd(front.lastPoint);
            middle.clear();
            middle.group.preview();
          }
        },
        ['x']
      );
    }
  });

  group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

  middle.group.setEnd = function(point) {
    if(middle.group.fixedDistance || middle.group.fixedAngle) {
      var distance = middle.group.fixedDistance || new Line(front.startPoint, point).length;
      var angle = middle.group.fixedAngle || Angle.from(front.startPoint, front.lastPoint);
      point = front.startPoint.plus(distance).translate(front.startPoint, angle);
    }
    this.origin = point;
    this.shapes.forEach(function(shape) {
      shape.refLine.translate(point);
      shape.translate(shape.refLine.end);
    });
  }

  middle.group.preview = function() {
    var translationPath = new Line(front.startPoint, middle.group.origin);
    translationPath.sketchPreview();
    if(middle.group.fixedDistance || middle.group.fixedAngle)
      middle.group.origin.round().preview(0, 2, { strokeStyle: 'green' });
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
    this.draw(middle.context);
    new Line(front.startPoint, point).sketchPreview();
  }

  infopanel.top = 'choose angle of rotation, then click.';
  infopanel.buttons = [
    Button('c',   'clip',         'green'),
    Button('d',   'delete',       'green'),
    Button('m',   'mirror',       'green'),
    Button('r',   'rotate',       'green'),
    Button('s',   'style',        'green'),
    Button('t',   'translate',    'green'),
    Button('g',   'choose point', 'yellow'),
    Button('A',   'set angle',    'blue'),
    Button('esc', 'cancel',       'red')
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
            infopanel.bottom.clear();
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
        ['x']
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

//////////
// clip //
//////////

function clip(group) {
  group.shapes.forEach(function(shape) { back.shapes.push(shape); });
  back.refresh();
  window.eventListeners.add('click', 'drawClip', function(e) {
    var clipShape = design(new Rectangle(Point.from(e), Point.from(e)));
    clipShape.complete = function() {
      middle.clear();
      back.refresh();
    }
    group.shapes.forEach(function(shape) { shape.clipShape = clipShape; });
  }, false);
}

////////////
// mirror //
////////////

function mirror(group) {
  middle.clear();
  front.eventListeners.clear();

  middle.group = group;
  middle.group.reflected = [];

  middle.group.setEnd = function(point) {
    if(front.startPoint && point.distance(front.startPoint) > 5) {
      middle.group.reflected = this.shapes.map(function(shape) {
        var lineOfReflection = new Line(front.startPoint, point);
        var reflected = shape.copy();
        var centerToOrigin = new Line(shape.center, shape.origin);
        var startToCenter = new Line(front.startPoint, shape.center);
        var triAngle = lineOfReflection.angle.minus(startToCenter.angle);
        var newTriAngle = lineOfReflection.angle.plus(triAngle);
        var newCenter = startToCenter.start.plus(startToCenter.length).translate(startToCenter.start, newTriAngle);

        var startToNewCenter = new Line(startToCenter.start, newCenter);

        newOrigin = newCenter.plus(centerToOrigin.length).translate(newCenter, centerToOrigin.angle);
        var angleOfRotation = startToCenter.angle.minus(Math.PI - startToNewCenter.angle.rad);
        newOrigin = newOrigin.translate(newCenter, angleOfRotation);

        reflected.translate(newOrigin);
        reflected.rotate(angleOfRotation);
        return reflected;
      });
    }
  }

  middle.group.preview = function() {
    if(front.startPoint) new Line(front.startPoint, front.lastPoint).sketchPreview();
    this.reflected.forEach(function(shape) { shape.draw(middle.context); });
    this.shapes.forEach(function(shape) { shape.draw(middle.context); });
  }

  middle.group.shapes.forEach(function(shape) { shape.draw(middle.context); });

  window.eventListeners.add('click', 'drawLineOfReflection', function() {
    window.eventListeners.remove('drawLineOfReflection');
    front.startPoint = front.lastPoint;
    front.eventListeners.add('mousemove', 'setEnd', function() {
      middle.clear();
      middle.group.setEnd(front.lastPoint);
      middle.group.preview();
    });
    window.eventListeners.add('click', 'completeLine', function() {
      
    });
  });
}
