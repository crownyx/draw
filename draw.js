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
    if(middle.showPoints) { findNearPoint(front.lastPoint); }
  }, false);

  front.canvas.addEventListener('click', function(e) {
    front.lastPoint = Point.from(e);
    middle.redraw();
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
        if(middle.showPoints) {
          middle.showPoints = false;
          infopanel.buttons.find('.').text = 'show points';
          middle.redraw();
        } else {
          middle.showPoints = true;
          infopanel.buttons.find('.').text = 'hide points';
          findNearPoint(front.lastPoint);
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
      if(typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
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
  allPoints  = back.shapes.mapProperty('points').flatten();
  allCenters = back.shapes.mapProperty('center');

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

  if(back.shapes.length) {
    infopanel.buttons.add(
      Button('.', middle.showPoints ? 'hide points' : 'show points', 'yellow'),
      Button('e', 'edit shape(s)', 'green'),
      Button('s', 'select shape(s)', 'green'),
      Button('x', 'export image', 'green')
    );
  }

  front.eventListeners.add('click', 'design', function() {
    front.startPoint = front.usePoint;
    delete front.setPoint;
    changeMode();
    design(new Line(front.startPoint, front.lastPoint));
    window.eventListeners.add('keydown', 'drawCommands', drawCommands);
  });

  window.eventListeners.add('keydown', 'switchMode', function(e) {
    switch(e.which) {
      case charCodes['s']: changeMode(selectMode); break;
      case charCodes['e']: changeMode(editMode); break;
      case charCodes['x']: exportImage(); break;
    }
  });
}

function drawCommands(e) {
  if(!e.shiftKey) {
    var shape = (function() {
      switch(e.which) {
        case charCodes['a']:
          return new Arc(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['b']:
          return new BezierCurve(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['c']:
          return new Circle(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['e']:
          return new Ellipse(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['l']:
          return new Line(front.startPoint, front.setPoint || front.lastPoint);
        case charCodes['r']:
          return new Rectangle(front.startPoint, front.setPoint || front.lastPoint);
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
