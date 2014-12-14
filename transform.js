function translate(refPoint) {
  front.startPoint = refPoint;
  middle.group.origin = refPoint;

  front.refresh();

  infopanel.top = 'choose translation point, then click';
  infopanel.buttons = [
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
            if(infopanel.bottom.find('fixedDistance'))
              infopanel.bottom.find('fixedDistance').remove();
          } else {
            middle.group.fixedDistance = parseFloat(distance.replace(',', ''));
            infopanel.bottom.add({
              main: 'fixed distance: ' + commaSep(middle.group.fixedDistance),
              subtext: 'To undo, type "D", then "x"'
            }, 'fixedDistance');
          }
          middle.group.setEnd();
          middle.clear();
          middle.group.preview();
        },
        ['x', ',', '.']
      )
    }
  });

  window.eventListeners.add('keydown', 'setAngle', function(e) {
    if(e.shiftKey && e.which == charCodes['a']) {
      getInput(
        { main: 'enter angle: ', subtext: '(in degrees)' },
        function(deg) {
          if(deg === 'x') {
            delete middle.group.fixedAngle;
            if(infopanel.bottom.find('fixedAngle'))
              infopanel.bottom.find('fixedAngle').remove();
          } else {
            middle.group.fixedAngle = Angle.fromDeg(parseFloat(deg));
            infopanel.bottom.add({
              main: 'fixed angle: ' + middle.group.fixedAngle.deg + unescape("\xB0"),
              subtext: 'To undo, type "A", then "x"'
            }, 'fixedAngle');
          }
          middle.group.setEnd();
          middle.clear();
          middle.group.preview();
        },
        ['x', '.']
      );
    }
  });

  var refLines = middle.group.shapes.map(function(shape) {
    var refLine = new Line(refPoint, shape.center);
    refLine.shape = shape;
    return refLine;
  });

  middle.group.setEnd = function() {
    var point = front.usePoint;
    if(this.fixedDistance || this.fixedAngle) {
      var distance = this.fixedDistance || new Line(refPoint, front.usePoint).length;
      var angle = this.fixedAngle || Angle.from(refPoint, front.usePoint);
      point = refPoint.plus(distance).translate(refPoint, angle);
    }
    this.origin = point;
    refLines.forEach(function(refLine) {
      refLine.translate(point, { by: 'start' });
      refLine.shape.translate(refLine.end);
    });
  }

  middle.group.preview = function() {
    var translationPath = new Line(refPoint, this.origin);
    translationPath.sketchPreview();
    if(this.fixedDistance || this.fixedAngle)
      this.origin.round().preview(0, 2, { strokeStyle: 'green' });
    middle.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
    this.draw(middle.context);
  }

  front.eventListeners.add('mousemove', 'moveGroup', function() {
    middle.group.setEnd();
    middle.group.preview();
  }, true);

  front.eventListeners.add('click', 'saveGroup', function() {
    middle.group.shapes.eachDo('complete');
    changeMode(commandMode);
  });
}

////////////
// rotate //
////////////

function rotate(refPoint) {
  front.startPoint = refPoint;

  front.refresh();

  infopanel.top = 'choose angle of rotation, then click.';
  infopanel.buttons = [
    Button('A',   'set angle', 'blue'),
    Button('esc', 'cancel',    'red')
  ];

  var refLines = middle.group.shapes.map(function(shape) {
    var refLine = new Line(refPoint, shape.center);
    refLine.shape = shape;
    return refLine
  });

  middle.group.setEnd = function() {
    var angle = this.fixedRotation || Angle.from(front.startPoint, front.usePoint);
    refLines.forEach(function(refLine) {
      refLine.rotate(angle.minus(this.rotation), { about: 'start' });
      refLine.shape.translate(refLine.end);
      refLine.shape.rotate(angle.minus(this.rotation));
    }, this);
    this.rotation = angle;
  }

  middle.group.preview = function() {
    this.draw(middle.context);
    if(this.fixedRotation) {
      new Line(front.startPoint, { angle: this.fixedRotation }).sketchPreview();
    } else {
      new Line(front.startPoint, front.usePoint).sketchPreview();
    }
  }

  middle.group.rotation = new Angle(0);

  front.eventListeners.add('mousemove', 'setRotation', function() {
    middle.clear(); // clear to remove findNearPoint from draw.js so no lapse in findNearPoint below. need better solution
    middle.group.setEnd();
    middle.group.preview();
    if(middle.showPoints) findNearPoint(front.lastPoint);
  }, true);

  window.eventListeners.add('keydown', 'setAngle', function(e) {
    if(e.shiftKey && e.which == charCodes['a']) {
      getInput(
        { main: 'enter angle:', subtext: '(degrees)' },
        function(deg) {
          if(deg === 'x') {
            delete middle.group.fixedRotation;
            if(infopanel.bottom.find('fixedAngle'))
              infopanel.bottom.find('fixedAngle').remove();
          } else {
            middle.group.fixedRotation = Angle.fromDeg(parseFloat(deg));
            infopanel.bottom.add({
              main: 'fixed angle: ' + middle.group.fixedRotation.deg.round(2) + unescape("\xB0"),
              subtext: 'To undo, type "A", then "x"'
            }, 'fixedAngle');
          }
          middle.group.setEnd();
          middle.clear();
          middle.group.preview();
        },
        ['x', '.']
      );
    }
  });

  front.eventListeners.add('click', 'saveGroup', function() {
    middle.group.shapes.eachDo('complete');
    changeMode(commandMode);
  });
}

/////////////
// reflect //
/////////////

function reflect(pickedPoint) {
  front.startPoint = pickedPoint;
  middle.group.reflected = [];

  infopanel.top = 'move to choose angle of line of reflection';
  infopanel.buttons.add(
    Button('A',   'set angle', 'blue'),
    Button('esc', 'cancel',    'red')
  );

  middle.group.setEnd = function() {
    if(this.fixedRotation) {
      this.lineOfReflection = new Line(front.startPoint, { angle: this.fixedRotation });
    } else {
      this.lineOfReflection = new Line(front.startPoint, front.usePoint);
    }
    this.reflected = this.shapes.mapProperty('reflect', this.lineOfReflection);
  }

  middle.group.preview = function() {
    this.lineOfReflection.sketchPreview();
    this.reflected.eachDo('draw', middle.context);
    this.shapes.eachDo('draw', middle.context);
  }

  front.eventListeners.add('mousemove', 'setEnd', function() {
    middle.group.setEnd();
    middle.group.preview();
  }, true);

  front.eventListeners.add('click', 'completeLine', function() {
    back.shapes = back.shapes.concat(middle.group.shapes);
    middle.group.reflected.eachDo('complete');
    changeMode(commandMode);
  });

  window.eventListeners.add('keydown', 'setAngle', function(e) {
    if(e.shiftKey && e.which == charCodes['a']) {
      getInput(
        { main: 'enter angle:', subtext: '(degrees)' },
        function(deg) {
          if(deg === 'x') {
            delete middle.group.fixedRotation;
            if(infopanel.bottom.find('fixedAngle'))
              infopanel.bottom.find('fixedAngle').remove();
          } else {
            middle.group.fixedRotation = Angle.fromDeg(parseFloat(deg));
            infopanel.bottom.add({
              main: 'fixed angle: ' + middle.group.fixedRotation.deg + unescape("\xB0"),
              subtext: 'To undo, type "A", then "x"'
            }, 'fixedAngle');
          }
          middle.group.setEnd();
          middle.clear();
          middle.group.preview();
        },
        ['x', '.']
      );
    }
  });
}

///////////////
// intersect //
///////////////

function intersect(pickedPoint) {
  middle.group.intersectShapes = [];

  front.startPoint = pickedPoint;

  front.eventListeners.clear();

  middle.group.intersectShapes.push(new Rectangle(front.startPoint, front.usePoint));

  middle.group.shapes.forEach(function(shape) {
    shape.intersectShapes.push(middle.group.intersectShapes.last());
  });

  middle.group.intersectShapes.last().guideline = true;

  front.eventListeners.add('mousemove', 'setEnd', function() {
    middle.group.intersectShapes.last().setEnd(front.usePoint);
    middle.group.intersectShapes.eachDo('preview');
    middle.group.draw(middle.context);
  }, true);

  front.eventListeners.add('click', 'complete', function() {
    middle.group.shapes.eachDo('complete');
    changeMode(commandMode);
  });

  window.eventListeners.add('keydown', 'switchShape', function(e) {
    if(['c', 'e', 'r'].find(function(letter) {
      return e.which === charCodes[letter];
    })) {
      var intersectShape;
      switch(e.which) {
        case charCodes['c']:
          intersectShape = new Circle(front.startPoint, front.usePoint);
        break;
        case charCodes['e']:
          intersectShape = new Ellipse(front.startPoint, front.usePoint);
        break;
        case charCodes['e']:
          intersectShape = new Rectangle(front.startPoint, front.usePoint);
        break;
      }
      middle.group.intersectShapes.pop();
      middle.group.intersectShapes.push(intersectShape);
      middle.group.shapes.forEach(function(shape) {
        shape.intersectShapes.pop();
        shape.intersectShapes.push(middle.group.intersectShapes.last());
      });
      middle.group.intersectShapes.last().guideline = true;
    }
  });
}
