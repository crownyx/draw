function translate(group, refPoint) {
  middle.clear();
  front.eventListeners.clear();
  front.startPoint = refPoint;

  middle.group = group;
  middle.group.translating = true;

  group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

  /* middle.redraw */ middle.redraw = function() {
  /*               */   this.clear();
  /*               */   var translationPath = new Line(front.startPoint, front.lastPoint);
  /*               */   translationPath.preview(true);
  /*               */   front.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
  /*               */   this.group.shapes.forEach(function(shape) {
  /*               */     shape.refLine.translate(front.lastPoint);
  /*               */     shape.translate(shape.refLine.end);
  /*               */   });
  /*               */   this.group.draw(middle.context);
  /*               */ }

  middle.redraw();

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
    middle.redraw();
  });

  front.eventListeners.add('click', 'saveGroup', function() {
    middle.redraw();
    group.shapes.forEach(function(shape) {
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
  middle.group.rotating = true;

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

  group.rotation = Angle.from(refPoint, front.lastPoint);

  /* middle.redraw */ middle.redraw = function() {
  /*               */   this.clear();
  /*               */   new Line(front.startPoint, front.lastPoint).preview(true);
  /*               */   var angle = Angle.from(front.startPoint, front.lastPoint).minus(this.group.rotation);
  /*               */   this.group.shapes.forEach(function(shape) {
  /*               */     shape.refLine.rotate(angle);
  /*               */     shape.translate(shape.refLine.end);
  /*               */     shape.rotate(angle);
  /*               */   });
  /*               */   this.group.draw(this.context);
  /*               */   this.group.rotation = Angle.from(front.startPoint, front.lastPoint);
  /*               */ }

  middle.redraw();

  front.eventListeners.add('mousemove', 'setRotation', function() {
    middle.redraw();
  });

  front.eventListeners.add('click', 'saveGroup', function() {
    middle.redraw();
    group.shapes.forEach(function(shape) {
      delete shape.refLine;
      shape.complete();
    });
    changeMode(commandMode);
  });
}
