function designRect(diagStart, diagEnd) {
  displayHelpText('rectangle', 'r', [
    '[H]: set height',
    '[L]: set length',
    '[R]: set rotation'
  ]);

  function refAngle() { return (rect.diagonal.angle.quadrant - 1) / 2 * Math.PI; }

  var rect = new Rectangle(diagStart, diagEnd);
  var startAxis = new AxisPair(rect.diagonal.start);
  var arcAngle = new Arc(rect.diagonal.start, 15, new Angle(refAngle()), new Angle(refAngle() + rect.rotation.rad));

  showRect();
  showInfo();

  function showRect() {
    rect.draw(front.context);

    startAxis.sketch(front.context);

    arcAngle.startAngle = new Angle(refAngle());
    arcAngle.endAngle = new Angle(refAngle() + rect.rotation.rad);
    arcAngle.sketch(front.context);
  }

  function showInfo() {
    var text = 'length: ' + rect.length + ', height: ' + rect.height;
    showText(text, front.lastPoint, getAngle(rect.diagonal.start, front.lastPoint), front.context);

    var text = rect.rotation.deg.toFixed(2) + unescape("%B0")
    showText(text, rect.diagonal.start, new Angle(rect.rotation.rad + Math.PI), front.context);
  }

  front.eventListeners.add('mousemove', 'setEnd', function() {
    rect.setEnd(front.lastPoint);
  });

  front.eventListeners.add('mousemove', 'showRect', showRect);
  front.eventListeners.add('mousemove', 'showInfo', showInfo);

  front.eventListeners.add('click', 'setRectRot', function(e) {
    if(rect.fixedRotation) rect.complete();

    front.eventListeners.remove('setEnd');
    front.eventListeners.remove('setRectRot');

    rect.fixedLength = rect.length;
    rect.fixedHeight = rect.height;
    rect.inRotation = true;

    front.eventListeners.add('mousemove', 'setRot', function() {
      var angle = getAngle(rect.diagonal.start, front.lastPoint);
      rect.rotation = new Angle(angle.rad - rect.diagonal.angle.rad);
    });

    front.eventListeners.add('click', 'saveRect', rect.complete.bind(rect));
  });

  window.eventListeners.add('keydown', 'rectCommands', function(e) {
    if(e.shiftKey) {
      var cleanUp = function() {
        rect.setEnd(front.lastPoint);
        front.clear();
        front.showAxes();
        showRect();
        showInfo();
      };
      switch(e.which) {
        case charCodes['l']:
          getInput('enter length: ', function(input) {
            rect.fixedLength = parseInt(input);
            cleanUp();
          });
        break;
        case charCodes['h']:
          getInput('enter height: ', function(input) {
            rect.fixedHeight = parseInt(input);
            cleanUp();
          });
        break;
        case charCodes['r']:
          getInput({ main: 'enter rotation: ', subtext: '(in degrees)' }, function(input) {
            rect.fixedRotation = new Angle(parseInt(input) / 180 * Math.PI);
            cleanUp();
          });
        break;
      }
    }
  });
}

////////////////
// Rectangle: //
////////////////

function Rectangle(diagStart, diagEnd) {
  Shape.call(this);
  this.diagonal = new Line(diagStart, diagEnd);
  this._rotation = new Angle(0);
}

Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;

Object.defineProperty(Rectangle.prototype, 'length', {
  get: function() {
    return this.fixedLength || Math.abs(this.diagonal.end.x - this.diagonal.start.x);
  }
});

Object.defineProperty(Rectangle.prototype, 'height', {
  get: function() {
    return this.fixedHeight || Math.abs(this.diagonal.end.y - this.diagonal.start.y);
  }
});

Object.defineProperty(Rectangle.prototype, 'rotation', {
  get: function() {
    return this.fixedRotation || this._rotation;
  },
  set: function(angle) {
    this._rotation = angle;
  }
});

Rectangle.prototype.setEnd = function(point) {
  var quad = (this.inRotation ? this.diagonal.angle : getAngle(this.diagonal.start, point)).quadrant;

  var x = this.fixedLength ?
          this.diagonal.start.x + (quad == 2 || quad == 3 ? -1 : 1) * this.length :
          point.x;
  var y = this.fixedHeight ?
          this.diagonal.start.y + (quad == 3 || quad == 4 ? -1 : 1) * this.height :
          point.y;

 this.diagonal.setEnd(new Point(x, y));
}

Rectangle.prototype.draw = function(context) {
  var width  = this.diagonal.end.x - this.diagonal.start.x,
      height = this.diagonal.end.y - this.diagonal.start.y;
  context.save();
    context.translate(this.diagonal.start.x, this.diagonal.start.y);
    context.rotate((this.fixedRotation || this.rotation).rad);
    context.strokeRect(0, 0, width, height);
  context.restore();
}
