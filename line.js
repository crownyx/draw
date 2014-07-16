function designLine(startPoint, endPoint) {
  window.eventListeners.add('keydown', 'lineCommands', function(e) {
    if(e.shiftKey) {
      switch(e.which) {
        case charCodes['l']:
          getInput('enter length: ', function(input) {
            line.fixedLength = parseInt(input);
            line.setEnd(front().canvas.lastPoint);
            front().canvas.clear();
            front().canvas.showAxes();
            showLine();
            showInfo();
          });
        break;
        case charCodes['r']:
          getInput({ main: 'enter rotation: ', subtext: '(in degrees)' }, function(input) {
            line.fixedRotation = new Angle(parseInt(input) / 180 * Math.PI);
            line.setEnd(front().canvas.lastPoint);
            front().canvas.clear();
            front().canvas.showAxes();
            showLine();
            showInfo();
          });
        break;
      }
    }
  });
}

///////////
// Line: //
///////////

function Line(start, end) {
  Shape.call(this);

  this.name          = 'LINE';
  this.ownCommand    = 'l';

  this.shiftCommands = {
    'L': {
      info:       'set length',
      promptText: 'enter length: ',
      setProp:    function(length) {
        this.fixedLength = length;
      }
    },
    'A': {
      info:       'set angle/rotation',
      promptText: { main: 'enter angle: ', subtext: '(in degrees)' },
      setProp:    function(deg) {
        this.fixedRotation = new Angle(deg / 180 * Math.PI);
      }
    }
  };

  this.start = start;
  this.end   = end;
}

Line.prototype = new Shape;
Line.prototype.constructor = Line;

Line.prototype.setEnd = function(point) {
  if(this.fixedLength || this.fixedRotation) {
    var rotation = this.fixedRotation || new Line(this.start, point).angle;
    var length   = this.fixedLength || new Line(this.start, point).length;
    this.end = new Point(
      this.start.x + Math.cos(rotation.rad) * length,
      this.start.y + Math.sin(rotation.rad) * length
    );
  } else {
    this.end = point;
  }
}

Object.defineProperty(Line.prototype, 'length', {
  get: function() {
    return Math.sqrt(Math.pow(this.end.x - this.start.x, 2) + Math.pow(this.end.y - this.start.y, 2));
  }
});

Object.defineProperty(Line.prototype, 'angle', {
  get: function() { return getAngle(this.start, this.end); },
});

Object.defineProperty(Line.prototype, 'arcAngle', {
  get: function() {
    var arc = new Arc(this.start, 15, new Angle(0), this.angle);
    (function(line) {
      arc.setEnd = function(point) {
        this.endAngle = getAngle(line.start, point);
      };
    })(this);
    return arc;
  }
});

Object.defineProperty(Line.prototype, 'showText', {
  get: function() {
    return 'length: ' + this.length.toFixed(2);
  }
});

Line.prototype.nextStep = Line.prototype.complete;

Line.prototype.draw = function(context) {
  context.beginPath();
    context.moveTo(this.start.x, this.start.y);
    context.lineTo(this.end.x, this.end.y);
  context.stroke();
}

////////////////////
// Special Lines: //
////////////////////

function VerticalLine(x) {
  return new Line({ x: x, y: 0 }, { x: x, y: front().canvas.height });
}

function HorizontalLine(y) {
  return new Line({ x: 0, y: y }, { x: front().canvas.width, y: y });
}

function AxisPair(origin) {
  return {
    vertical: new Line({ x: origin.x, y: 0 }, { x: origin.x, y: front().canvas.height }),
    horizontal: new Line({ x: 0, y: origin.y }, { x: front().canvas.width, y: origin.y }),
    draw: function(context) {
      this.vertical.draw(context);
      this.horizontal.draw(context);
    },
    sketch: function(context) {
      this.vertical.sketch(context);
      this.horizontal.sketch(context);
    }
  }
}
