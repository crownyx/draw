function selectMode() {
  var selected = [];
  var selectedCopies = [];

  replaceInfoText([{ text: 'select shape(s) by point(s)', className: 'center' }]);
  var allPoints = back.shapes.flatMap(function(shape) { return shape.points.values; });
  allPoints.forEach(function(point) { point.fill(middle.context); });

  front.eventListeners.add('mousemove', 'showPoints', function() {
    middle.clear();
    allPoints.forEach(function(point) { point.fill(middle.context); });
  });

  front.eventListeners.add('click', 'beginSelection', function(e) {
    front.eventListeners.remove('beginSelection');
    var selectRect = new Rectangle(getPoint(e), front.lastPoint);

    function selectedPoints(callback) {
      var leftMost  = Math.min(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var rightMost = Math.max(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var upperMost = Math.min(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
      var lowerMost = Math.max(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
      allPoints.forEach(function(point) {
        if(point.x > leftMost && point.x < rightMost && point.y > upperMost && point.y < lowerMost) {
          callback(point.shape);
        }
      });
    }

    front.eventListeners.add('mousemove', 'resizeSelection', function(e) {
      selectRect.setEnd(getPoint(e));
      back.clear();
      selectedPoints(function(shape) { shape.strokeStyle = 'blue'; });
      back.shapes.forEach(function(shape) {
        shape.draw(back.context);
        shape.strokeStyle = back.context.strokeStyle;
      });
      selectRect.draw(middle.context, { strokeStyle: "blue" });
      selectRect.fill(middle.context, { fillStyle: "rgba(173,216,230,0.25)" });
    });

    front.eventListeners.add('click', 'completeSelection', function(e) {
      front.eventListeners.clear();
      selectRect.setEnd(getPoint(e));
      selectedPoints(function(shape) {
        if(!(selected.indexOf(shape) + 1)) {
          selected.push(shape);
          selectedCopies.push(shape.copy());
          back.shapes.remove(shape);
        }
      });
      back.refresh();
      middle.clear();

      if(selected.length) {
        var group = new Group(selected);
        group.strokeStyle = "blue";
        group.draw(middle.context);
        deleteOrTransform(group);
      }
    });
  });

  window.eventListeners.add('keydown', 'escape', function(e) {
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
      case charCodes['d']:
        back.refresh();
        changeMode(commandMode);
      break;
      case charCodes['r']:
        back.refresh();
        rotateGroup(group);
      break;
      case charCodes['t']:
        back.refresh();
        translateGroup(group);
      break;
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
  front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginTranslating(getPoint(e)); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    var currPoint = getPoint(e);

    var nearPoint = allPoints.filter(function(point) {
      return point.distance(currPoint) < 5;
    }).sort(function(point) {
      return point.distance(currPoint);
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { beginTranslating(nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginTranslating(getPoint(e)); });
    }
  });

  function beginTranslating(refPoint) {
    middle.clear();
    group.draw(middle.context);

    replaceInfoText([
      { text: 'move shape(s), then click to save',
        className: 'center'
      },
      '',
      '[esc]: cancel'
    ]);

    front.eventListeners.remove('drawGroup');
    front.eventListeners.remove('chooseRefPoint');

    group.shapes.forEach(function(shape) {
      shape.xDiff = shape.origin.x - refPoint.x;
      shape.yDiff = shape.origin.y - refPoint.y;
    });

    front.eventListeners.add('mousemove', 'moveGroup', function(e) {
      middle.clear();
      var newPoint = getPoint(e);
      group.shapes.forEach(function(shape) {
        shape.translate(new Point(newPoint.x + shape.xDiff, newPoint.y + shape.yDiff));
      });
      group.draw(middle.context);
    });

    front.eventListeners.add('click', 'saveGroup', function(e) {
      var newPoint = getPoint(e);
      group.shapes.forEach(function(shape) {
        shape.translate(new Point(newPoint.x + shape.xDiff, newPoint.y + shape.yDiff));
        shape.complete();
      });
      changeMode(commandMode);
    });
  }
}

function rotateGroup(group) {
  replaceInfoText([{
      text: 'click to choose center of rotation',
      className: 'center'
    },
    '',
    '[esc]: cancel'
  ]);

  var allPoints = group.shapes.flatMap(function(shape) { return shape.points.values; });

  allPoints.forEach(function(point) { point.fill(middle.context); });
  front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginRotating(getPoint(e)); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    var currPoint = getPoint(e);

    var nearPoint = allPoints.filter(function(point) {
      return point.distance(currPoint) < 5;
    }).sort(function(point) {
      return point.distance(currPoint);
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { beginRotating(nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginRotating(getPoint(e)); });
    }
  });

  function beginRotating(refPoint) {
    middle.clear();
    group.draw(middle.context);

    front.eventListeners.remove('drawGroup');
    front.eventListeners.remove('chooseRefPoint');

    replaceInfoText([{
        text: 'choose angle of rotation, then click.',
        className: 'center'
      },
      '',
      '[esc]: cancel'
    ]);

    group.shapes.forEach(function(shape) {
      shape.refLine = new Line(refPoint, shape.origin.copy());
      shape.origAngle = shape.refLine.angle;
      shape.origRot = shape.rotation.rad;
    });
    front.startPoint = refPoint;

    var angle = new Angle(0);

    front.eventListeners.add('mousemove', 'setRotation', function(e) {
      middle.clear();

      var currPoint = getPoint(e);
      var oldAngle = angle;
      angle = getAngle(refPoint, currPoint);
      new Line(refPoint, currPoint).preview(true);

      group.shapes.forEach(function(shape) {
        shape.translate(new Point(
          refPoint.x + Math.cos(shape.origAngle.rad + angle.rad) * shape.refLine.length,
          refPoint.y + Math.sin(shape.origAngle.rad + angle.rad) * shape.refLine.length
        ));
        shape.rotate(new Angle(angle.rad - oldAngle.rad));
      });
      group.draw(middle.context);
    });

    front.eventListeners.add('click', 'saveGroup', function(e) {
      var currPoint = getPoint(e);
      var oldAngle = angle;
      angle = getAngle(refPoint, currPoint);

      group.shapes.forEach(function(shape) {
        shape.translate(new Point(
          refPoint.x + Math.cos(shape.origAngle.rad + angle.rad) * shape.refLine.length,
          refPoint.y + Math.sin(shape.origAngle.rad + angle.rad) * shape.refLine.length
        ));
        shape.rotate(new Angle(angle.rad - oldAngle.rad));
        shape.complete();
      });
      changeMode(commandMode);
    });
  }
}
