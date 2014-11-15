function editMode() {
  var showPoints = middle.showPoints;
  middle.showPoints = true;
  middle.redraw();

  infopanel.top = 'select point to begin editing';
  infopanel.buttons = [Button('esc', 'cancel', 'red')];
  infopanel.bottom.add('select center point of a shape to delete/translate/rotate');

  var exit = function() {
    middle.showPoints = showPoints;
    back.redraw();
    changeMode(commandMode);
  }

  window.eventListeners.add('keydown', 'exitMode', function(e) {
    if(e.which == charCodes['esc']) exit();
  });

  findNearPoint(front.lastPoint);

  var lastHighlighted;

  front.eventListeners.add('mousemove', 'findPoint', function() {
    if(front.pickedPoint) {
      lastHighlighted = front.pickedPoint.shape;
      back.shapes.remove(lastHighlighted);
      back.redraw();
      lastHighlighted.draw(middle.context, { strokeStyle: 'blue' });
      back.shapes.push(lastHighlighted);
    } else if(lastHighlighted) {
      lastHighlighted = null;
      back.redraw();
    }
  }, true);

  front.eventListeners.add('click', 'choosePoint', function() {
    if(front.pickedPoint) {
      infopanel.top.clear();
      window.refresh();
      front.refresh();

      var shape = front.pickedPoint.shape;
      var origShape = shape.copy();
      var pickedPoint = front.pickedPoint;

      back.shapes.remove(shape);
      back.redraw();
      middle.clear();

      front.eventListeners.add('mousemove', 'showShape', function() {
        shape.draw(middle.context, { strokeStyle: 'blue' });
        shape.center.round().preview(0, 2);
      }, true);

      if(pickedPoint.same(shape.center)) {
        infopanel.buttons = [
          Button('c',   'clip',      'green'),
          Button('d',   'delete',    'green'),
          Button('m',   'mirror',    'green'),
          Button('r',   'rotate',    'green'),
          Button('s',   'style',     'green'),
          Button('t',   'translate', 'green'),
          Button('esc', 'cancel',    'red')
        ];

        window.eventListeners.add('keydown', 'rotateOrTranslate', function(e) {
          if(!e.shiftKey) {
            if(['c', 's', 'm', 'r', 't'].find(function(letter) {
                return charCodes[letter] === e.which;
              }))
            {
              middle.showPoints = showPoints;
              switch(e.which) {
                case charCodes['c']: clip(new Group([shape.copy()])); break;
                case charCodes['s']: style(new Group([shape.copy()])); break;
                case charCodes['m']: mirror(new Group([shape.copy()])); break;
                case charCodes['r']: rotate(new Group([shape.copy()]), pickedPoint); break;
                case charCodes['t']: translate(new Group([shape.copy()]), pickedPoint); break;
              }
            } else if(e.which === charCodes['d']) {
              changeMode(commandMode);
            }
          }
        });
      } else {
        middle.showPoints = showPoints;
        shape.edit(pickedPoint);
      }
      window.eventListeners.add('keydown', 'exitMode', function(e) {
        if(e.which === charCodes['esc']) {
          back.shapes.push(origShape);
          exit();
        }
      });
    }
  });
}

Arc.prototype.edit = function(pickedPoint) {
  var workingRadius = pickedPoint.same(this.endRadius.end) ? this.startRadius : this.endRadius;
  var otherRadius = pickedPoint.same(this.startRadius.end) ? this.endRadius : this.startRadius;
  this._workingRadius = function() { return workingRadius; }
  this._otherRadius = function() { return otherRadius; }
  this.nextStep = Shape.prototype.nextStep;
  this.setEnd(pickedPoint);
  front.startPoint = this.center;
  changeMode();
  design(this);
}

BezierCurve.prototype.edit = function(pickedPoint) {
  if(pickedPoint.same(this.start)) {
    this.setEnd = function(point) { this.start = point; }
  } else if(pickedPoint.same(this.end)) {
    this.setEnd = function(point) { this.end = point; }
  } else if(pickedPoint.same(this.control1)) {
    this.setEnd = function(point) { this.control1 = point; }
  } else if(!this.quadratic && pickedPoint.same(this.control2)) {
    this.setEnd = function(point) { this.control2 = point; }
  }
  this.setEnd(pickedPoint);
  front.startPoint = this.start;
  changeMode();
  design(this);
}

Circle.prototype.edit = function(pickedPoint) {
  this.setEnd(pickedPoint);
  front.startPoint = this.center;
  changeMode();
  design(this);
}

Ellipse.prototype.edit = function(pickedPoint) {
  front.startPoint = this.center;
  if(pickedPoint.same(this.yAxis.end) || pickedPoint.same(this.yAxis.end.translate(this.center, Math.PI))) {
    this.yAxis.fixed = false;
    this.xAxis.fixed = true;
    this.setEnd(pickedPoint);
  } else if(pickedPoint.same(this.xAxis.end) || pickedPoint.same(this.xAxis.end.translate(this.center, Math.PI))) {
    this.xAxis.fixed = false;
    this.yAxis.fixed = true;
    this.setEnd(pickedPoint);
  }
  changeMode();
  design(this);
}

Line.prototype.edit = function(pickedPoint) {
  (function(backwards) {
    var start = backwards ? this.end : this.start;
    var end   = backwards ? this.start : this.end;
    this.start = start;
    this.end = end;
    front.startPoint = start;
    changeMode();
    design(this);
  }).call(this, pickedPoint.same(this.start));
}

Rectangle.prototype.edit = function(pickedPoint) {
  var opposite = (function() {
    for(var i = 0; i < this.points.length; i++) {
      if(this.points[i].same(pickedPoint))
        return this.points[(i + 2) % 4];
    }
  }).call(this);
  if(!this.fixedEnd) {
    this.diagonal.start = opposite;
    front.startPoint = opposite;
    this.setEnd(pickedPoint);
  }
  changeMode();
  design(this);
}
