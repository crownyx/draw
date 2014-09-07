function editMode() {
  replaceInfoText([{ text: 'select point', className: 'center' }]);

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

    var currPoint = getPoint(e);

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
        window.refresh(); front.refresh();

        var shape = nearPoint.shape;
        var origShape = shape.copy();

        back.shapes.remove(shape);
        back.refresh();

        if(nearPoint.same(shape.center)) {
          shape.draw(front.context);
          var origDiff = { x: shape.origin.x - nearPoint.x, y: shape.origin.y - nearPoint.y };
          translate(shape, origDiff);
        } else {
          switch(shape.constructor) {
            case Line:
              if(nearPoint === shape.start) {
                shape.start = shape.end;
                shape.end = nearPoint;
                design(shape);
              } else if(nearPoint === shape.end) {
                design(shape);
              }
            break;
            case Rectangle:
              var opposite = nearPoint.same(shape.points.corner1) ? shape.points.corner3 :
                             nearPoint.same(shape.points.corner2) ? shape.points.corner4 :
                             nearPoint.same(shape.points.corner3) ? shape.points.corner1 :
                             shape.points.corner2;
              var rect = new Rectangle(opposite, nearPoint);
              rect.rotation = shape.rotation;
              rect.setEnd(nearPoint);
              design(rect);
            break;
            case Ellipse:
              if(nearPoint.same(shape.points.yTop) || nearPoint.same(shape.points.yBottom)) {
                shape.yAxis.fixed = false;
                shape.xAxis.fixed = true;
                shape.yAxis.end = nearPoint;
              } else if(nearPoint.same(shape.points.xLeft) || nearPoint.same(shape.points.xRight)) {
                shape.xAxis.fixed = false;
                shape.yAxis.fixed = true;
                shape.xAxis.end = nearPoint;
              }
              design(shape);
            break;
            default:
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
