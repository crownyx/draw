function translate(refPoint) {
  front.startPoint = refPoint;
  middle.group.origin = refPoint;

  infopanel.top = 'choose translation point, then click';
  infopanel.buttons.add(
    Button('A',   'set angle',    'blue'),
    Button('D',   'set distance', 'blue'),
    Button('esc', 'cancel',       'red')
  );

  /* double check: */ window.eventListeners.add('keydown', 'setDistance', function(e) {
  /* double check: */   if(e.shiftKey && e.which == charCodes['d']) {
  /* double check: */     getInput(
  /* double check: */       'enter distance: ',
  /* double check: */       function(distance) {
  /* double check: */         if(distance == 'x') {
  /* double check: */           delete middle.group.fixedDistance;
  /* double check: */         } else {
  /* double check: */           middle.group.fixedDistance = parseInt(distance.replace(',', ''));
  /* double check: */           middle.group.setEnd(front.lastPoint);
  /* double check: */           middle.clear();
  /* double check: */           middle.group.preview();
  /* double check: */         }
  /* double check: */       },
  /* double check: */       ['x', ',']
  /* double check: */     )
  /* double check: */   }
  /* double check: */ });

  /* double check: */ window.eventListeners.add('keydown', 'setAngle', function(e) {
  /* double check: */   if(e.shiftKey && e.which == charCodes['a']) {
  /* double check: */     getInput(
  /* double check: */       { main: 'enter angle: ', subtext: '(in degrees)' },
  /* double check: */       function(deg) {
  /* double check: */         if(deg == 'x') {
  /* double check: */           delete middle.group.fixedAngle;
  /* double check: */         } else {
  /* double check: */           middle.group.fixedAngle = Angle.fromDeg(parseInt(deg));
  /* double check: */           middle.group.setEnd(front.lastPoint);
  /* double check: */           middle.clear();
  /* double check: */           middle.group.preview();
  /* double check: */         }
  /* double check: */       },
  /* double check: */       ['x']
  /* double check: */     );
  /* double check: */   }
  /* double check: */ });

  var refLines = middle.group.shapes.map(function(shape) {
    var refLine = new Line(refPoint, shape.center);
    refLine.shape = shape;
    return refLine;
  });

  middle.group.setEnd = function(point) {
    if(middle.group.fixedDistance || middle.group.fixedAngle) {
      var distance = middle.group.fixedDistance || new Line(refPoint, point).length;
      var angle = middle.group.fixedAngle || Angle.from(refPoint, front.lastPoint);
      point = refPoint.plus(distance).translate(refPoint, angle);
    }
    this.origin = point;
    refLines.forEach(function(refLine) {
      refLine.translate(point);
      refLine.shape.translate(refLine.end);
    });
  }

  middle.group.preview = function() {
    var translationPath = new Line(refPoint, middle.group.origin);
    translationPath.sketchPreview();
    if(middle.group.fixedDistance || middle.group.fixedAngle)
      middle.group.origin.round().preview(0, 2, { strokeStyle: 'green' });
    middle.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
    this.draw(middle.context);
  }

  front.eventListeners.add('mousemove', 'moveGroup', function() {
    middle.group.setEnd(front.usePoint);
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

  infopanel.top = 'choose angle of rotation, then click.';
  infopanel.buttons.add(
    Button('A',   'set angle', 'blue'),
    Button('esc', 'cancel',    'red')
  );

  var refLines = middle.group.shapes.map(function(shape) {
    var refLine = new Line(refPoint, shape.center);
    refLine.shape = shape;
    return refLine
  });

  middle.group.setEnd = function(point) {
    if(point.distance(front.startPoint) > 5) {
      var angle = Angle.from(front.startPoint, point);
      refLines.forEach(function(refLine) {
        refLine.rotate(angle.minus(this.rotation), { about: 'start' });
        refLine.shape.translate(refLine.end);
        refLine.shape.rotate(angle.minus(this.rotation));
      }, this);
      this.rotation = angle;
    }
  }

  middle.group.preview = function() {
    this.draw(middle.context);
    new Line(front.startPoint, front.usePoint).sketchPreview();
  }

  middle.group.rotation = new Angle(0);

  front.eventListeners.add('mousemove', 'setRotation', function() {
    if(!middle.group.fixedRotation) {
      middle.group.setEnd(front.usePoint);
      middle.group.preview();
    }
  }, true);

  /* double check: */ window.eventListeners.add('keydown', 'setAngle', function(e) {
  /* double check: */   if(e.shiftKey && e.which == charCodes['a']) {
  /* double check: */     getInput(
  /* double check: */       { main: 'enter angle:', subtext: '(degrees)' },
  /* double check: */       function(deg) {
  /* double check: */         if(deg == 'x') {
  /* double check: */           delete middle.group.fixedRotation;
  /* double check: */           targetPoint = front.lastPoint;
  /* double check: */         } else {
  /* double check: */           delete front.setPoint;
  /* double check: */           infopanel.bottom.clear();
  /* double check: */           front.redraw();
  /* double check: */           middle.group.fixedRotation = true;
  /* double check: */           targetPoint = refPoint.plus(
  /* double check: */             front.canvas.width
  /* double check: */           ).translate(
  /* double check: */             refPoint, Angle.fromDeg(parseInt(deg))
  /* double check: */           );
  /* double check: */         }
  /* double check: */         middle.group.setEnd(targetPoint);
  /* double check: */         middle.clear();
  /* double check: */         middle.group.preview(targetPoint);
  /* double check: */       },
  /* double check: */       ['x']
  /* double check: */     );
  /* double check: */   }
  /* double check: */ });

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

  middle.group.setEnd = function(point) {
    var lineOfReflection = new Line(front.startPoint, point);
    middle.group.reflected = this.shapes.mapProperty('reflect', lineOfReflection);
  }

  middle.group.preview = function() {
    var currLine = new Line(front.startPoint, front.usePoint);
    currLine.sketchPreview();
    this.reflected.eachDo('draw', middle.context);
    this.shapes.eachDo('draw', middle.context);
  }

  front.eventListeners.add('mousemove', 'setEnd', function() {
    middle.group.setEnd(front.usePoint);
    middle.group.preview();
  }, true);

  front.eventListeners.add('click', 'completeLine', function() {
    back.shapes = back.shapes.concat(middle.group.shapes);
    middle.group.reflected.eachDo('complete');
    changeMode(commandMode);
  });

  // create keydown eventListener for set Angle
}

///////////////
// intersect //
///////////////

function intersect() {
  middle.group.shapes.forEach(function(shape) { back.shapes.push(shape); });
  back.refresh();

  window.eventListeners.add('click', 'drawClip', function(e) {
    var clipRect = design(new Rectangle(front.usePoint, front.usePoint));
    clipRect.guideline = true;
  }, false);
}
