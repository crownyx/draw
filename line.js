function designLine(startPoint, endPoint) {
  var line = new Line(startPoint, endPoint);
  var startAxis = new AxisPair(line.start);
  var arcAngle  = new Arc(line.start, 15, new Angle(0), line.angle);

  showLine();
  showInfo();

  displayHelpText('line', 'l', [
    '[L]: set length',
    '[R]: set rotation'
  ]);

  function showLine() {
    line.draw(front.context);

    startAxis.sketch(front.context);

    arcAngle.endAngle = line.angle;
    arcAngle.sketch(front.context);
  }

  function showInfo() {
    var text = 'x: '        + line.start.x.toFixed(2) +
               ', y: '      + line.start.y.toFixed(2) +
               ' to x: '    + line.end.x.toFixed(2)   +
               ', y: '      + line.end.y.toFixed(2)   +
               ', length: ' + line.length.toFixed(2);
    showText(text, front.lastPoint, getAngle(line.start, front.lastPoint), front.context);

    var text = line.angle.deg.toFixed(2) + "\xB0"
    showText(text, line.start, new Angle(line.angle.rad + Math.PI), front.context);
  }

  front.eventListeners.add('mousemove', 'setEnd', function() {
    line.setEnd(front.lastPoint);
  });
  front.eventListeners.add('mousemove', 'showLine', showLine);
  front.eventListeners.add('mousemove', 'showInfo', showInfo);
  front.eventListeners.add('click', 'saveLine', function() { line.complete() });

  window.eventListeners.add('keydown', 'lineCommands', function(e) {
    if(e.shiftKey) {
      switch(e.which) {
        case charCodes['l']:
          getInput('enter length: ', function(input) {
            line.fixedLength = parseInt(input);
            line.setEnd(front.lastPoint);
            front.clear();
            front.showAxes();
            showLine();
            showInfo();
          });
        break;
        case charCodes['r']:
          getInput({ main: 'enter rotation: ', subtext: '(in degrees)' }, function(input) {
            line.fixedRotation = new Angle(parseInt(input) / 180 * Math.PI);
            line.setEnd(front.lastPoint);
            front.clear();
            front.showAxes();
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
  return new Line({ x: x, y: 0 }, { x: x, y: front.canvas.height });
}

function HorizontalLine(y) {
  return new Line({ x: 0, y: y }, { x: front.canvas.width, y: y });
}

function AxisPair(origin) {
  return {
    vertical: new Line({ x: origin.x, y: 0 }, { x: origin.x, y: front.canvas.height }),
    horizontal: new Line({ x: 0, y: origin.y }, { x: front.canvas.width, y: origin.y }),
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
