function selectMode() {
  var selected = [];
  var selectedCopies = [];

  replaceInfoText([
    (function(box) {
      box.className = 'box top';
      box.textContent = 'select shape(s) by point(s)';
      return box;
    })(document.createElement('div'))
  ]);

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
    'd:delete',
    'r:rotate',
    't:translate',
  ].map(function(buttonText) {
    return({
      className: 'button',
      textContent: buttonText,
      color: 'green'
    });
  }).concat({
    className: 'button', textContent: 'esc:cancel', color: 'red'
  }));

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
      className: 'box',
      textContent: 'choose reference point for translation',
    },
    {
      className: 'button',
      textContent: 'esc:cancel',
      color: 'red'
    }
  ]);

  var allPoints = group.shapes.flatMap(function(shape) { return shape.points.values; });

  allPoints.forEach(function(point) { point.fill(middle.context); });

  front.eventListeners.add('click', 'chooseRefPoint', function(e) { translate(group, Point.from(e)); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    var currPoint = Point.from(e);

    var nearPoint = allPoints.filter(function(point) {
      return point.distance(currPoint) < 5;
    }).sort(function(point) {
      return point.distance(currPoint);
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { translate(group, nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { translate(group, Point.from(e)); });
    }
  });
}

/////////////////
// rotateGroup //
/////////////////

function rotateGroup(group) {
  replaceInfoText([
    {
      className: 'box',
      textContent: 'click to choose center of rotation'
    },
    {
      className: 'button',
      textContent: 'esc:cancel',
      color: 'red'
    }
  ]);

  var allPoints = group.shapes.flatMap(function(shape) { return shape.points.values; });

  allPoints.forEach(function(point) { point.fill(middle.context); });

  front.eventListeners.add('click', 'chooseRefPoint', function(e) { rotate(group, Point.from(e)); });

  front.eventListeners.add('mousemove', 'drawGroup', function(e) {
    var currPoint = Point.from(e);

    var nearPoint = allPoints.filter(function(point) {
      return point.distance(currPoint) < 5;
    }).sort(function(point) {
      return point.distance(currPoint);
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'chooseRefPoint', function() { rotate(group, nearPoint); });
    } else {
      front.eventListeners.add('click', 'chooseRefPoint', function(e) { rotate(group, Point.from(e)); });
    }
  });
}
