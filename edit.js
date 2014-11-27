function editMode() {
  var showPoints = middle.showPoints;
  middle.showPoints = true;
  findNearPoint(front.lastPoint);

  infopanel.top = 'select point to begin editing';
  infopanel.buttons = [Button('esc', 'cancel', 'red')];
  infopanel.bottom.add('select outer point of a shape to resize');
  infopanel.bottom.add('select center point for other actions');

  var exit = function() {
    middle.showPoints = showPoints;
    back.redraw();
    changeMode(commandMode);
  }

  window.eventListeners.add('keydown', 'exitMode', function(e) {
    if(e.which === charCodes['esc']) exit();
  });

  front.eventListeners.add('mousemove', 'highlightShape', function() {
    if(front.pickedPoint)
      front.pickedPoint.shape.strokeStyle = 'blue';
    back.redraw();
    back.shapes.eachSet('strokeStyle', back.context.strokeStyle);
  }, true);

  front.eventListeners.add('click', 'choosePoint', function() {
    if(front.pickedPoint) {
      front.eventListeners.remove('highlightShape');
      front.eventListeners.remove('choosePoint');

      var shape = front.pickedPoint.shape;
      var origShape = shape.copy();
      var pickedPoint = front.pickedPoint;
      delete front.pickedPoint;

      back.shapes.remove(shape);
      back.redraw();
      middle.clear();

      if(pickedPoint.same(shape.center)) {
        infopanel.top.clear();
        infopanel.buttons = [
          Button('c',   'intersect', 'green'),
          Button('d',   'delete',    'green'),
          Button('m',   'reflect',   'green'),
          Button('r',   'rotate',    'green'),
          Button('s',   'style',     'green'),
          Button('t',   'translate', 'green'),
          Button('u',   'unite',     'green'),
          Button('esc', 'cancel',    'red')
        ];
        infopanel.bottom.clear();

        middle.showPoints = false;

        front.eventListeners.add('mousemove', 'showShape', showShape = function() {
          shape.draw(middle.context, { strokeStyle: 'blue' });
          shape.center.round().preview(0, 2);
        }, true);

        ////////////////////
        // chooseEditMode //
        ////////////////////

        window.eventListeners.add('keydown', 'chooseEditMode', chooseEditMode = function(e) {
          if(!e.shiftKey) {
            if(['c', 's', 'm', 'r', 't', 'u'].find(function(letter) {
                return charCodes[letter] === e.which;
              }))
            {

              middle.showPoints = showPoints;

              window.eventListeners.clear();
              window.eventListeners.add('keydown', 'chooseEditMode', chooseEditMode);
              window.eventListeners.add('keydown', 'exitMode', exitMode);
              front.eventListeners.clear();
              front.eventListeners.add('mousemove', 'showShape', showShape, true);
              infopanel.buttons = [
                Button('c', 'clip',        'green'),
                Button('d', 'delete',      'green'),
                Button('m', 'reflect',     'green'),
                Button('r', 'rotate',      'green'),
                Button('s', 'style',       'green'),
                Button('t', 'translate',   'green'),
                Button('>', 'go to point', 'yellow'),
              ];
              middle.group = new Group([shape.copy()]);

              var setUpEditMode = function(editMode, startPoint) {
                front.eventListeners.clear();
                middle.clear();
                editMode(startPoint);
                front.redraw();
              }

              switch(e.which) {
                case charCodes['c']:
                  intersect();
                break;
                case charCodes['m']:
                  infopanel.top = 'click to start drawing line of reflection';
                  front.eventListeners.add('click', 'chooseStartPoint', function() {
                    setUpEditMode(reflect, front.lastPoint);
                  });
                break;
                case charCodes['r']:
                  setUpEditMode(rotate, pickedPoint);
                break;
                case charCodes['s']:
                  style();
                break;
                case charCodes['t']:
                  setUpEditMode(translate, pickedPoint);
                break;
                case charCodes['u']:
                  unite();
                break;
              }
            } else if(e.which === charCodes['d']) {
              changeMode(commandMode);
            }
          }
        });

      ////////////////////////
      // end chooseEditMode //
      ////////////////////////

      } else {
        middle.showPoints = showPoints;
        shape.prepareForEdit(pickedPoint);
        changeMode();
        design(shape);
      }
      window.eventListeners.add('keydown', 'exitMode', exitMode = function(e) {
        if(e.which === charCodes['esc']) {
          back.shapes.push(origShape);
          exit();
        }
      });
    }
  });
}

//////////////////////////////////////
// shape prototype edit procedures: //
//////////////////////////////////////

//////////
// Line //
//////////

Line.prototype.prepareForEdit = function(pickedPoint) {
  (function(backwards) {
    var start        = backwards ? this.end : this.start;
    var end          = backwards ? this.start : this.end;
    this.start       = start;
    front.startPoint = start;
    this.setEnd(end);
  }).call(this, pickedPoint.same(this.start));
}

///////////////
// Rectangle //
///////////////

Rectangle.prototype.prepareForEdit = function(pickedPoint) {
  var opposite = (function() {
    for(var i = 0; i < this.points.length; i++) {
      if(this.points[i].same(pickedPoint))
        return this.points[(i + 2) % 4];
    }
  }).call(this);
  this.diagonal.start = opposite;
  front.startPoint = opposite;
  this.setEnd(pickedPoint);
}

/////////
// Arc //
/////////

Arc.prototype.prepareForEdit = function(pickedPoint) {
  if(pickedPoint.same(this.endRadius.end) || pickedPoint.same(this.startRadius.end)) {
    var workingRadius = pickedPoint.same(this.endRadius.end) ? this.endRadius : this.startRadius;
    var otherRadius = pickedPoint.same(this.startRadius.end) ? this.endRadius : this.startRadius;
    this._workingRadius = function() { return workingRadius; }
    this._otherRadius = function() { return otherRadius; }
  } else {
    this.setEnd = function(point) {
      this.startRadius.setEnd(point, { fixedAngle: this.startRadius.angle });
      this.endRadius.setEnd(point, { fixedAngle: this.endRadius.angle });
      this.center.shape = this;
    }
  }
  this.nextStep = Shape.prototype.nextStep;
  this.setEnd(pickedPoint);
  front.startPoint = this.center;
}

/////////////////
// BezierCurve //
/////////////////

BezierCurve.prototype.prepareForEdit = function(pickedPoint) {
  if(pickedPoint.same(this.start)) {
    this.setEnd = function(point) { this.start = point; }
  } else if(pickedPoint.same(this.end)) {
    this.setEnd = function(point) { this.end = point; }
  } else if(pickedPoint.same(this.control1)) {
    this.setEnd = function(point) { this.control1 = point; }
  } else if(!this.quadratic && pickedPoint.same(this.control2)) {
    this.setEnd = function(point) { this.control2 = point; }
  }
  this.nextStep = Shape.prototype.nextStep;
  this.setEnd(pickedPoint);
  front.startPoint = this.start;
}

////////////
// Circle //
////////////

Circle.prototype.prepareForEdit = function(pickedPoint) {
  this.setEnd(pickedPoint);
  front.startPoint = this.center;
}

/////////////
// Ellipse //
/////////////

Ellipse.prototype.prepareForEdit = function(pickedPoint) {
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
}
