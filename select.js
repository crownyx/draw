function selectMode() {
  var selected = []; var selectedCopies = [];

  replaceInfoText([{ text: 'select shape(s) by point(s)', className: 'center' }]);

  var allPoints = back.shapes.map(function(shape) {
    var points = shape.points;
    points.forEach(function(point) { point.shape = shape; });
    return points;
  }).flatten();

  allPoints.forEach(function(point) { point.fill(back.context); });

  front.eventListeners.add('click', 'select', function(e) {
    front.eventListeners.clear();

    var selectRect = new Rectangle(getPoint(e), getPoint(e));

    front.eventListeners.add('mousemove', 'showSelectRect', function(e) {
      selectRect.setEnd(getPoint(e));
      front.context.strokeStyle = "blue";
      front.context.fillStyle = "rgba(173,216,230,0.25)";
        selectRect.draw(front.context);
        selectRect.fill(front.context);
      front.context.strokeStyle = "black";
      front.context.fillStyle = "black";
    });

    front.eventListeners.add('click', 'completeSelection', function(e) {
      selectRect.setEnd(getPoint(e));

      var leftMost  = Math.min(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var rightMost = Math.max(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var upperMost = Math.min(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
      var lowerMost = Math.max(selectRect.diagonal.end.y, selectRect.diagonal.start.y);

      back.clear(); front.refresh();

      allPoints.forEach(function(point) {
        if(point.x > leftMost && point.x < rightMost && point.y > upperMost && point.y < lowerMost) {
          if(!(selected.indexOf(point.shape) + 1)) {
            selected.push(point.shape);
            selectedCopies.push(point.shape.copy());
            back.shapes.remove(point.shape);
          }
        }
      });

      back.shapes.forEach(function(shape) { shape.draw(back.context); });

      if(selected.length) {
        var group = new Group(selected);
        group.strokeStyle = "blue";
        group.draw(front.context);
        front.eventListeners.add('mousemove', 'drawGroup', function() {
          group.draw(front.context);
        });
        deleteOrTransform(group);
      }
    });
  });

  window.eventListeners.add('keydown', 'selectCommands', function(e) {
    switch(e.which) {
      case charCodes['esc']:
        selectedCopies.forEach(function(shape) { back.shapes.push(shape); });
        back.refresh();
        changeMode(commandMode);
      break;
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
      this.shapes.forEach(function(shape) {
        context.beginPath();
          shape.drawPath(context);
        context.stroke();
      });
    context.restore();
  }

  this.translate = function(point) {
    this.shapes.forEach(function(shape) {
      shape.translate(new Point(shape.center.x + point.x, shape.center.y + point.y));
    });
  }
}

function translateGroup(group) {
  replaceInfoText([
    { text: 'choose reference point for translation',
      className: 'center'
    },
    '',
    '[esc]: cancel'
  ]);

  var allPoints = group.shapes.map(function(shape) {
    shape.points.forEach(function(point) { point.shape = shape; });
    return shape.points;
  }).flatten();

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
    var movePoint = refPoint;

    front.eventListeners.add('mousemove', 'moveGroup', function(e) {
      movePoint = getPoint(e);
      group.translate(new Point(movePoint.x - refPoint.x, movePoint.y - refPoint.y));
      group.draw(front.context);
      refPoint = movePoint;
    });

    front.eventListeners.add('click', 'saveGroup', function(e) {
      movePoint = getPoint(e);
      group.translate(new Point(movePoint.x - refPoint.x, movePoint.y - refPoint.y));
      group.shapes.forEach(function(shape) {
        shape.complete();
        changeMode(commandMode);
      });
    });
  }
}

function rotateGroup(group) {
  front.eventListeners.add('mousemove', 'drawGroup', function() {
    group.draw(front.context);
  });

  replaceInfoText([{
    text: 'click center of rotation',
    className: 'center'
  }]);

  front.eventListeners.add('click', 'chooseCenter', function(e) {
    front.eventListeners.remove('chooseCenter');
    group.setTranslate(getPoint(e));

  });
}
