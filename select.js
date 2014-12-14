function selectMode() {
  var selected = [];
  var selectedCopies = [];
  var selectByAll = false;

  infopanel.top = 'select shape(s) by drawing rectangle around point(s)';
  infopanel.buttons = [
    Button('a', 'select by all points (currently false)', 'yellow'),
    Button('esc', 'cancel', 'red')
  ];

  var allPoints = back.shapes.flatMap(function(shape) {
    var points = shape.points;
    points.eachSet('shape', shape);
    return points;
  });

  var allCenters = back.shapes.map(function(shape) {
    var center = shape.center;
    center.shape = shape;
    return center;
  });

  front.eventListeners.add('mousemove', 'showPoints', function() {
    allPoints.eachDo('fill', middle.context);
    allCenters.eachDo('fill', middle.context);
    allCenters.eachDo('circle', middle.context, { strokeStyle: 'red' });
    back.shapes.forEach(function(shape) {
      if(shape.intersectShapes.length) {
        var difference = shape.difference(shape.intersectShapes, { inclusive: false });
        difference.forEach(function(path) {
          path.sketch(middle.context);
        });
      }
    });
  }, true);

  window.eventListeners.add('keydown', 'selectByAllPoints', function(e) {
    if(!e.shiftKey && e.which === charCodes['a']) {
      selectByAll = !selectByAll;
      infopanel.buttons.find('a').text = 'select by all points (currently ' + selectByAll + ')';
      if(front.eventListeners.find('resizeSelection')) front.eventListeners.find('resizeSelection').callback(); // change to method -- front.eventListeners.resizeSelection()
    }
  });

  front.eventListeners.add('click', 'beginSelection', function(e) {
    front.eventListeners.clear();

    var selectRect = new Rectangle(Point.from(e), front.lastPoint);

    /*selectedPoints:*/ function selectedPoints() {
    /*               */   var leftMost  = Math.min(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
    /*               */   var rightMost = Math.max(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
    /*               */   var upperMost = Math.min(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
    /*               */   var lowerMost = Math.max(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
    /*               */
    /*               */   var inRect = function(point) {
    /*               */     return point.x > leftMost && point.x < rightMost && point.y > upperMost && point.y < lowerMost;
    /*               */   }
    /*               */
    /*               */   var selected;
    /*               */
    /*               */   if(selectByAll) {
    /*               */     selected = back.shapes.filter(function(shape) {
    /*               */       return(
    /*               */         shape.points.every(function(point) {
    /*               */           return inRect(point);
    /*               */         }) && inRect(shape.center)
    /*               */       );
    /*               */     }).flatMap(function(shape) {
    /*               */       var points = shape.points.concat(shape.center);
    /*               */       points.eachSet('shape', shape);
    /*               */       return points;
    /*               */     });
    /*               */   } else {
    /*               */     selected = allPoints.concat(allCenters).filter(function(point) {
    /*               */       return inRect(point);
    /*               */     });
    /*               */   }
    /*               */
    /*               */   return selected;
    /*               */ }

    front.eventListeners.add('mousemove', 'resizeSelection', function() {
      selectRect.setEnd(front.lastPoint);
      back.clear(); middle.clear();
      selectedPoints().mapProperty('shape').eachSet('selected', true);
      allPoints.concat(allCenters).forEach(function(point) {
        point.fill(middle.context, { fillStyle: point.shape.selected ? 'blue' : 'black' });
      });
      allCenters.forEach(function(center) {
        if(!center.shape.selected) center.circle(middle.context, { strokeStyle: 'red' });
      });
      back.shapes.forEach(function(shape) {
        shape.draw(back.context, { strokeStyle: shape.selected ? 'blue' : back.context.strokeStyle });
        delete shape.selected;
      });
      selectRect.draw(middle.context, { strokeStyle: "blue" });
      selectRect.fill(middle.context, { fillStyle: "rgba(173,216,230,0.25)" });
    }, true);

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
        middle.group = new Group(selected);
        middle.group.strokeStyle = 'blue';
        deleteOrTransform(middle.group);

        front.eventListeners.add('mousemove', 'showSelected', function() {
          middle.group.draw(middle.context);
        }, true);
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
  infopanel.top.clear();
  infopanel.buttons = [
    Button('c',   'clip',      'green'),
    Button('d',   'delete',    'green'),
    Button('r',   'rotate',    'green'),
    Button('t',   'translate', 'green'),
    Button('esc', 'cancel',    'red')
  ];

  window.eventListeners.add('keydown', 'selectCommands', function(e) {
    if(!e.shiftKey) {
      switch(e.which) {
        case charCodes['d']: changeMode(commandMode); break;
        case charCodes['i']: front.eventListeners.add('click', 'intersect', function(e) { intersect(Point.from(e)); }); break;
        case charCodes['m']: mirror(group); break;
        case charCodes['r']: rotateGroup(group);    break;
        case charCodes['t']: translateGroup(group); break;
      }
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
  infopanel.top = 'click to choose reference point for translation';
  infopanel.buttons = [
    Button('.', ['show', 'hide'][middle.showPoints * 1] + ' points', 'yellow'),
    Button('esc', 'cancel', 'red')
  ];

  front.eventListeners.add('click', 'chooseRefPoint', function() {
    translate(front.usePoint);
  });
}

/////////////////
// rotateGroup //
/////////////////

function rotateGroup(group) {
  infopanel.top = 'click to choose center of rotation';
  infopanel.buttons = [
    Button('.', ['show', 'hide'][middle.showPoints * 1] + ' points', 'yellow'),
    Button('esc', 'cancel', 'red')
  ];

  front.eventListeners.add('click', 'chooseRefPoint', function() {
    rotate(front.usePoint);
  });
}
