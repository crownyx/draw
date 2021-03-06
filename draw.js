window.onload = function() {
  this.eventListeners  = new EventListenerCollection(this);
  front.eventListeners = new EventListenerCollection(front.canvas);

  front.resize(); middle.resize(); back.resize(); infopanel.resize();

  front.startPoint = new Point(0, front.canvas.height);
  front.lastPoint  = new Point(front.canvas.width, 0);

  front.canvas.addEventListener('mousemove', function(e)  {
    front.lastPoint = Point.from(e);
    front.redraw();
    middle.clear();
    if(middle.showPoints) findNearPoint(front.lastPoint);
  }, false);

  front.canvas.addEventListener('click', function(e) {
    front.lastPoint = Point.from(e);
    middle.clear();
    if(middle.showPoints) { findNearPoint(front.lastPoint); }
  }, false);

  window.addEventListener('keydown', setOrPickPoint = function(e) {
    if(e.which == charCodes['.']) {
      if(e.shiftKey) {
        getInput(
          { main: 'enter point:', subtext: '(x,y)' },
          setPoint,
          ['x', ',']
        );
      } else {
        middle.showPoints = !middle.showPoints;
        infopanel.buttons.find('.').text = ['show', 'hide'][middle.showPoints * 1] + ' points';
        if(middle.showPoints) {
          findNearPoint(front.lastPoint);
        } else {
          middle.redraw();
        }
      }
    }
  }, false);

  this.refresh = function() { this.eventListeners.clear(); }

  changeMode(commandMode);
}

//////////////
// setPoint //
//////////////

function setPoint(xy) {
  if(xy && typeof xy == "string") {
    if(xy == 'x') {
      infopanel.bottom.find('unSetPoint').remove();
      delete front.setPoint;
      front.usePoint = front.lastPoint;
    } else {
      var x = parseInt(xy.split(',')[0]);
      var y = parseInt(xy.split(',')[1]);
      if(isNum(x) && isNum(y)) {
        front.setPoint = new Point(x, y);
        front.usePoint = front.setPoint;
        infopanel.bottom.add('To cancel "go to point," type ">", then enter "x"', 'unSetPoint');
      }
    }
    front.redraw();
    if(middle.shape || middle.group) {
      if(middle.group) delete middle.group.fixedRotation;
      (middle.shape || middle.group).setEnd(front.usePoint);
      (middle.shape || middle.group).preview(); // why do we need to pass a point to preview()?
    }
  }
}

///////////////////
// findNearPoint //
///////////////////

function findNearPoint(e) {
  var allShapes = back.shapes.concat(
    []//middle.shape || (middle.group ? middle.group.shapes : [])
  ).concat(
    front.showGuideShapes ? front.guideShapes : []
  );

  var allPoints = allShapes.flatMap(function(shape) {
    var points = shape.points;
    points.eachSet('shape', shape);
    return points;
  });

  var allCenters = allShapes.map(function(shape) {
    var center = shape.center;
    center.shape = shape;
    return center;
  });

  var currPoint = Point.from(e);

  var nearPoints = allPoints.concat(allCenters).filter(function(point) {
    return point.distance(currPoint) < 5;
  }).sort(function(point) {
    return point.distance(currPoint);
  })

  var nearPoint = nearPoints[0];
  allPoints.concat(allCenters).eachDo('fill', middle.context);

  if(nearPoint) {
    allPoints.forEach(function(point) {
      if(point.same(nearPoint))
        point.circle(middle.context, { strokeStyle: 'blue' });
    });

    allCenters.forEach(function(point) {
      point.circle(middle.context, {
        strokeStyle: point.same(nearPoint) ? 'blue' : 'red'
      });
    });

    front.pickedPoint = nearPoint;
  } else {
    allCenters.eachDo('circle', middle.context, { strokeStyle: 'red' });
    delete front.pickedPoint;
  }

  back.shapes.forEach(function(shape) {
    if(shape.intersectShapes.length) {
      var difference = shape.difference(shape.intersectShapes, { inclusive: false });
      difference.forEach(function(path) {
        path.sketch(middle.context);
      });
    }
  });
}

////////////////
// changeMode //
////////////////

function changeMode(mode) {
  window.refresh();
  front.refresh();
  middle.refresh();
  if(middle.showPoints) findNearPoint(front.lastPoint);

  if(mode) mode();
}

/////////////////
// commandMode //
/////////////////

function commandMode() {
  if(front.setPoint) {
    delete front.setPoint;
    infopanel.bottom.clear();
  }

  front.startPoint = new Point(0, front.canvas.height);
  front.refresh();

  infopanel.top = 'click on canvas to begin drawing';
  infopanel.buttons = [Button('>', 'go to point', 'yellow')];

  if(front.guideShapes.length) {
    infopanel.buttons.add(Button('-', (front.showGuideShapes ? 'hide' : 'show') + ' guide shapes', 'yellow'));
    window.eventListeners.add('keydown', 'hideGuideShapes', function(e) {
      if(e.which === charCodes['-']) {
        front.showGuideShapes = !front.showGuideShapes;
        infopanel.buttons.find('-').text = ['show', 'hide'][front.showGuideShapes * 1] + ' guide shapes';
        front.redraw();
      }
    });
  }

  if(front.guideShapes.length || back.shapes.length) {
    infopanel.buttons.add(
      Button('.', ['show', 'hide'][middle.showPoints * 1] + ' points', 'yellow')
    );
  }

  if(back.shapes.length) {
    infopanel.buttons.add(
      Button('e', 'edit shape(s)', 'green'),
      Button('s', 'select shape(s)', 'green'),
      Button('x', 'export image', 'green')
    );
  }

  front.eventListeners.add('click', 'design', function() {
    front.startPoint = front.usePoint;
    delete front.setPoint;
    changeMode();
    design(new Line(front.startPoint, front.usePoint));
    window.eventListeners.add('keydown', 'drawCommands', drawCommands);
  });

  if(back.shapes.length) {
    window.eventListeners.add('keydown', 'switchMode', function(e) {
      switch(e.which) {
        case charCodes['e']: changeMode(editMode); break;
        case charCodes['s']: changeMode(selectMode); break;
        case charCodes['x']: exportImage(); break;
      }
    });
  }
}

function drawCommands(e) {
  if(!e.shiftKey) {
    var shape = (function() {
      switch(e.which) {
        case charCodes['a']:
          return new Arc(front.startPoint, front.usePoint);
        case charCodes['b']:
          return new BezierCurve(front.startPoint, front.usePoint);
        case charCodes['c']:
          return new Circle(front.startPoint, front.usePoint);
        case charCodes['e']:
          return new Ellipse(front.startPoint, front.usePoint);
        case charCodes['l']:
          return new Line(front.startPoint, front.usePoint);
        case charCodes['r']:
          return new Rectangle(front.startPoint, front.usePoint);
      }
    })();
    if(shape) { window.designShape(shape); }
  }
}

window.designShape = function(shape) {
  changeMode();
  design(shape);
  this.eventListeners.add('keydown', 'drawCommands', drawCommands);
}

function exportImage() {
  
}
