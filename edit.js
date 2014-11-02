function editMode() {
  infopanel.top = 'select point to begin editing';
  infopanel.buttons = [Button('esc', 'cancel', 'red')];
  infopanel.bottom.add('select center point of a shape to delete/translate/rotate');

  var allPoints = back.shapes.map(function(shape) { return shape.points.values; }).flatten();

  allPoints.forEach(function(point) { point.fill(back.context); });

  var lastHighlighted;

  window.eventListeners.add('keydown', 'exitEditMode', function(e) {
    if(e.which == charCodes['esc']) {
      back.refresh();
      changeMode(commandMode);
    }
  });

  front.eventListeners.add('mousemove', 'findPoint', function(e) {
    if(front.eventListeners.find('selectPoint')) front.eventListeners.remove('selectPoint');

    var currPoint = Point.from(e);

    var nearPoint = allPoints.filter(function(point) {
      return new Line(currPoint, point).length < 5;
    }).sort(function(point) {
      return new Line(currPoint, point).length;
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });

      lastHighlighted = nearPoint.shape;

      back.clear();

      back.shapes.forEach(function(shape) {
        shape === nearPoint.shape ?
        shape.draw(back.context, { strokeStyle: "blue" }) :
        shape.draw(back.context);
      });

      allPoints.forEach(function(point) { point.fill(back.context); });

      front.eventListeners.add('click', 'selectPoint', function() {
        infopanel.top.clear();
        window.refresh(); front.refresh();

        var shape = nearPoint.shape;
        var origShape = shape.copy();

        back.shapes.remove(shape);
        back.refresh();

        if(nearPoint.same(shape.center)) {
          infopanel.buttons = [
            Button('c',   'clip',      'green'),
            Button('d',   'delete',    'green'),
            Button('m',   'mirror',    'green'),
            Button('r',   'rotate',    'green'),
            Button('s',   'style',     'green'),
            Button('t',   'translate', 'green'),
            Button('esc', 'cancel',    'red')
          ];

          shape.draw(middle.context, { strokeStyle: 'blue' });
          front.startPoint = shape.center;
          shape.center.round().preview();
          window.eventListeners.add('keydown', 'rotateOrTranslate', function(e) {
            switch(e.which) {
              case charCodes['c']:
                window.eventListeners.remove('rotateOrTranslate');
                clip(new Group([shape.copy()]));
              break;
              case charCodes['d']: changeMode(commandMode); break;
              case charCodes['s']:
                window.eventListeners.remove('rotateOrTranslate');
                getInput(
                  'enter color:',
                  function(color) {
                    shape.fillStyle = color;
                    shape.complete();
                    changeMode(commandMode);
                  },
                  ['a-z', '(', ')', ',']
                );
              break;
              case charCodes['m']:
                window.eventListeners.remove('rotateOrTranslate');
                mirror(new Group([shape.copy()]));
              break;
              case charCodes['r']:
                window.eventListeners.remove('rotateOrTranslate');
                rotate(new Group([shape.copy()]), nearPoint);
              break;
              case charCodes['t']:
                window.eventListeners.remove('rotateOrTranslate');
                translate(new Group([shape.copy()]), nearPoint);
              break;
            }
          });
        } else {
          switch(shape.constructor) {
            case Arc:
              var workingRadius = nearPoint.same(shape.points.end1) ? shape.startRadius : shape.endRadius;
              var otherRadius = nearPoint.same(shape.points.end1) ? shape.endRadius : shape.startRadius;
              shape._workingRadius = function() { return workingRadius; }
              shape._otherRadius = function() { return otherRadius; }
              shape.nextStep = Shape.prototype.nextStep;
              shape.setEnd(nearPoint);
              front.startPoint = shape.center;
              design(shape);
            break;
            case Circle:
              shape.setEnd(nearPoint);
              front.startPoint = shape.center;
              design(shape);
            break;
            case Ellipse:
              if(nearPoint.same(shape.points.yTop) || nearPoint.same(shape.points.yBottom)) {
                shape.yAxis.fixed = false;
                shape.xAxis.fixed = true;
                shape.setEnd(nearPoint);
              } else if(nearPoint.same(shape.points.xLeft) || nearPoint.same(shape.points.xRight)) {
                shape.xAxis.fixed = false;
                shape.yAxis.fixed = true;
                shape.setEnd(nearPoint);
              }
              front.startPoint = shape.center;
              design(shape);
            break;
            case Line:
              (function(backwards) {
                var start = backwards ? shape.end : shape.start;
                var end   = backwards ? shape.start : shape.end;
                front.startPoint = start;
                shape.start = start;
                shape.end = end;
                design(shape);
              })(nearPoint.same(shape.start));
            break;
            case Rectangle:
              var opposite = nearPoint.same(shape.points.corner1) ? shape.points.corner3 :
                             nearPoint.same(shape.points.corner2) ? shape.points.corner4 :
                             nearPoint.same(shape.points.corner3) ? shape.points.corner1 :
                             shape.points.corner2;
              if(!shape.fixedEnd) {
                shape.diagonal.start = opposite;
                shape.origin = opposite;
                front.startPoint = opposite;
                shape.setEnd(nearPoint);
              }
              design(shape);
            break;
          }
          window.eventListeners.remove('exitDesignMode');
        }
        window.eventListeners.add('keydown', 'exitEditMode', function(e) {
          if(e.which == charCodes['esc']) {
            back.shapes.push(origShape);
            back.refresh();
            changeMode(commandMode);
          }
        });
      });
    } else if(lastHighlighted) {
      back.clear();
      back.shapes.forEach(function(shape) { shape.draw(back.context); });
      allPoints.forEach(function(point) { point.fill(back.context); });
      lastHighlighted = null;
    }
  });
}
