function selectMode() {
  var selected = [];
  var selectedCopies = [];

  replaceInfoText([{ text: 'select shape(s) by point(s)', className: 'center' }]);
  var allPoints = back.shapes.flatMap(function(shape) { return shape.points.values; });
  allPoints.forEach(function(point) { point.fill(middle.context); });

  front.eventListeners.add('click', 'beginSelection', function(e) {
    front.eventListeners.clear();

    var selectRect = new Rectangle(Point.from(e), front.lastPoint);


/*selectedPoints:*/ function selectedPoints() {
/*               */   var leftMost  = Math.min(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
/*               */   var rightMost = Math.max(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
/*               */   var upperMost = Math.min(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
/*               */   var lowerMost = Math.max(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
/*               */
/*               */   return allPoints.filter(function(point) {
/*               */     return(point.x > leftMost && point.x < rightMost && point.y > upperMost && point.y < lowerMost);
/*               */   });
/*               */ }

    front.eventListeners.add('mousemove', 'resizeSelection', function(e) {
      selectRect.setEnd(Point.from(e));
      back.clear(); middle.clear();
      selectedPoints().forEach(function(point) { point.shape.selected = true; });
      allPoints.forEach(function(point) {
        point.fill(middle.context, { fillStyle: point.shape.selected ? 'blue' : 'black' });
      });
      back.shapes.forEach(function(shape) {
        shape.draw(back.context, { strokeStyle: shape.selected ? 'blue' : back.context.strokeStyle });
        delete shape.selected;
      });
      selectRect.draw(middle.context, { strokeStyle: "blue" });
      selectRect.fill(middle.context, { fillStyle: "rgba(173,216,230,0.25)" });
    });

    front.eventListeners.add('click', 'completeSelection', function(e) {
      front.eventListeners.clear();

      selectRect.setEnd(Point.from(e));

      selectedPoints().forEach(function(point) {
        if(!(selected.indexOf(point.shape) + 1)) {
          selected.push(point.shape);
          selectedCopies.push(point.shape.copy());
          back.shapes.remove(point.shape);
        }
      });

      back.refresh(); middle.clear();

      if(selected.length) {
        var group = new Group(selected);
        group.strokeStyle = 'blue';
        group.draw(middle.context);
        deleteOrTransform(group);
      }
    });
  });

  window.eventListeners.add('keydown', 'exitSelectMode', function(e) {
    if(e.which == charCodes['esc']) {
      selectedCopies.forEach(function(shape) { back.shapes.push(shape); });
      back.refresh();
      changeMode(commandMode);
    }
  });
}

function deleteOrTransform(group) {
  replaceInfoText([
    '[d]: delete',
    '[r]: rotate',
    '[t]: translate',
    '',
    '[esc]: cancel'
  ]);

  window.eventListeners.add('keydown', 'selectCommands', function(e) {
    switch(e.which) {
      case charCodes['d']: changeMode(commandMode); break;
      case charCodes['r']: rotateGroup(group);      break;
      case charCodes['t']: translateGroup(group);   break;
    }
  });
}

function Group(shapes) {
  this.shapes = shapes;

  this.draw = function(context) {
    this.shapes.forEach(function(shape) {
      var origStyle = shape.strokeStyle;
      shape.strokeStyle = 'blue';
      shape.draw(context);
      shape.strokeStyle = origStyle;
    });
  }
}

////////////////////
// translateGroup //
////////////////////

function translateGroup(group) {
  replaceInfoText([{
      text: 'choose reference point for translation',
      className: 'center'
    },
    '',
    '[esc]: cancel'
  ]);

  var allPoints = group.shapes.flatMap(function(shape) { return shape.points.values; });

  allPoints.forEach(function(point) { point.fill(middle.context); });

  front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginTranslating(Point.from(e)); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    var currPoint = Point.from(e);

    var nearPoint = allPoints.filter(function(point) {
      return point.distance(currPoint) < 5;
    }).sort(function(point) {
      return point.distance(currPoint);
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { beginTranslating(nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginTranslating(Point.from(e)); });
    }
  });

  function beginTranslating(refPoint) {
    middle.clear();
    front.eventListeners.clear();
    front.startPoint = refPoint;

    group.draw(middle.context);

    replaceInfoText([
      {
        text: 'move shape(s), then click to save',
        className: 'center'
      },
      '',
      '[esc]: cancel'
    ]);

    group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

    front.eventListeners.add('mousemove', 'moveGroup', function(e) {
      middle.clear();
      var translationPath = new Line(refPoint, Point.from(e));
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
}

/////////////////
// rotateGroup //
/////////////////

function rotateGroup(group) {
  replaceInfoText([
    {
      text: 'click to choose center of rotation',
      className: 'center'
    },
    document.createElement('br'),
    '[esc]: cancel'
  ]);

  var allPoints = group.shapes.flatMap(function(shape) { return shape.points.values; });

  allPoints.forEach(function(point) { point.fill(middle.context); });

  front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginRotating(Point.from(e)); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    var currPoint = Point.from(e);

    var nearPoint = allPoints.filter(function(point) {
      return point.distance(currPoint) < 5;
    }).sort(function(point) {
      return point.distance(currPoint);
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { beginRotating(nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginRotating(Point.from(e)); });
    }
  });

  function beginRotating(refPoint) {
    middle.clear();
    front.eventListeners.clear();
    front.startPoint = refPoint;

    group.draw(middle.context);

    replaceInfoText([
      {
        text: 'choose angle of rotation, then click.',
        className: 'center'
      },
      '',
      '[esc]: cancel'
    ]);

    group.shapes.forEach(function(shape) { shape.refLine = new Line(refPoint, shape.origin); });

    var angle = new Angle(0);

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
}
