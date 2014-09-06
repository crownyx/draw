function selectMode() {
  var selected = [];
  var selectedCopies = [];

  replaceInfoText([{ text: 'select shape(s) by point(s)', className: 'center' }]);

  var allPoints = back.shapes.map(function(shape) { return shape.points.values; }).flatten();

  allPoints.forEach(function(point) { point.fill(back.context); });

  front.eventListeners.add('click', 'select', function(e) {
    front.eventListeners.clear();

    var selectRect = new Rectangle(getPoint(e), getPoint(e));

    front.eventListeners.add('mousemove', 'showSelectRect', function(e) {
      selectRect.setEnd(getPoint(e));
      selectRect.draw(front.context, { strokeStyle: "blue" });
      selectRect.fill(front.context, { fillStyle: "rgba(173,216,230,0.25)" });
    });

    front.eventListeners.add('click', 'completeSelection', function(e) {
      selectRect.setEnd(getPoint(e));

      var leftMost  = Math.min(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var rightMost = Math.max(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var upperMost = Math.min(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
      var lowerMost = Math.max(selectRect.diagonal.end.y, selectRect.diagonal.start.y);

      allPoints.forEach(function(point) {
        if(point.x > leftMost && point.x < rightMost && point.y > upperMost && point.y < lowerMost) {
          if(!(selected.indexOf(point.shape) + 1)) {
            selected.push(point.shape);
            selectedCopies.push(point.shape.copy());
            back.shapes.remove(point.shape);
          }
        }
      });

      back.refresh();
      front.refresh();

      if(selected.length) {
        var group = new Group(selected);
        group.strokeStyle = "blue";
        group.draw(front.context);
        front.eventListeners.add('mousemove', 'drawGroup', function() { group.draw(front.context); });
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
    context.save();
      context.strokeStyle = this.strokeStyle;
      this.shapes.forEach(function(shape) { shape.draw(context); });
    context.restore();
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

  var allPoints = group.shapes.map(function(shape) { return shape.points.values; }).flatten();

  allPoints.forEach(function(point) { point.fill(front.context); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    group.draw(front.context);
    allPoints.forEach(function(point) { point.fill(front.context); });

    var currPoint = getPoint(e);

    var nearPoint = allPoints.filter(function(point) {
      return new Line(point, currPoint).length < 5;
    }).sort(function(point) {
      return new Line(point, currPoint).length;
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { beginTranslating(nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginTranslating(getPoint(e)); });
    }
  });

  function beginTranslating(refPoint) {
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
      var newPoint = getPoint(e);
      group.shapes.forEach(function(shape) {
        shape.translate(new Point(newPoint.x + shape.xDiff, newPoint.y + shape.yDiff));
      });
      group.draw(front.context);
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

  var allPoints = group.shapes.map(function(shape) { return shape.points.values; }).flatten();

  allPoints.forEach(function(point) { point.fill(front.context); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    group.draw(front.context);
    allPoints.forEach(function(point) { point.fill(front.context); });

    var currPoint = getPoint(e);

    var nearPoint = allPoints.filter(function(point) {
      return new Line(point, currPoint).length < 5;
    }).sort(function(point) {
      return new Line(point, currPoint).length;
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { beginRotating(nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { beginRotating(getPoint(e)); });
    }
  });

  function beginRotating(refPoint) {
    front.eventListeners.remove('chooseRefPoint');

    replaceInfoText([{
      text: 'choose angle of rotation, then click.',
      className: 'center'
    }]);

    group.shapes.forEach(function(shape) {
      shape.refLine = new Line(refPoint, shape.origin.copy());
      shape.origAngle = shape.refLine.angle;
      shape.origRot = shape.rotation.rad;
    });

    front.eventListeners.add('mousemove', 'setRotation', function(e) {
      var currPoint = getPoint(e);
      var angle = getAngle(refPoint, currPoint);
      new HorizontalLine(refPoint.y).sketch(front.context);
      new Line(refPoint, currPoint).sketch(front.context);
      new Arc(refPoint, 15, new Angle(0), angle).sketch(front.context);
      front.context.textAlign = 'right';
      front.context.fillText(
        angle.deg.toFixed(2) + unescape("\xB0"),
        front.lastPoint.x - 10,
        front.lastPoint.y + 15
      );
      front.context.textAlign = 'start';
      group.shapes.forEach(function(shape) {
        shape.translate(new Point(
          refPoint.x + Math.cos(shape.origAngle.rad + angle.rad) * shape.refLine.length,
          refPoint.y + Math.sin(shape.origAngle.rad + angle.rad) * shape.refLine.length
        ));
        shape.rotate(new Angle(shape.origRot + angle.rad));
      });
    });

    front.eventListeners.add('mousemove', 'drawGroup', function(e) { group.draw(front.context); });

    front.eventListeners.add('click', 'saveGroup', function(e) {
      var currPoint = getPoint(e);
      var angle = getAngle(refPoint, currPoint);
      group.shapes.forEach(function(shape) {
        shape.origin = new Point(refPoint.x + Math.cos(shape.origAngle.rad + angle.rad) * shape.refLine.length,
                                 refPoint.y + Math.sin(shape.origAngle.rad + angle.rad) * shape.refLine.length);
        shape.rotate(new Angle(shape.origRot + angle.rad));
        shape.complete();
      });
      changeMode(commandMode);
    });
  }
}
