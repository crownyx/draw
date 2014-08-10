function editMode() {
  front.refresh();

  replaceInfoText([{
    text: 'select point',
    className: 'center'
  }]);

  var allPoints = back.shapes.map(function(shape) {
    var points = shape.points;
    points.forEach(function(point) { point.shape = shape; });
    return points;
  }).flatten();

  allPoints.forEach(function(point) { point.fill(back.context); });

  front.eventListeners.add('mousemove', 'findPoint', function(e) {
    if(front.eventListeners.find('selectPoint'))
      front.eventListeners.remove('selectPoint');
    var currPoint = getPoint(e);
    var nearPoint = allPoints.filter(function(point) {
      return new Line(point, currPoint).length < 5;
    }).sort(function(point) {
      return new Line(point, currPoint).length;
    })[0];

    if(nearPoint) {
      nearPoint.draw(front.context, { radius: 5, strokeStyle: "blue" });
      front.eventListeners.add('click', 'selectPoint', function() {
        back.shapes.remove(nearPoint.shape);
        back.refresh();
        var shape = nearPoint.shape;
        switch(shape.constructor) {
          case Line:
            if(nearPoint === shape.start) {
              shape.start = shape.end;
              shape.end = nearPoint;
              design(shape);
            } else if(nearPoint === shape.end) {
              design(shape);
            } else {
              translate(shape);
            }
          break;
          case Rectangle:
            var x = nearPoint.x === shape.diagonal.end.x ? shape.diagonal.start.x : shape.diagonal.end.x;
            var y = nearPoint.y === shape.diagonal.end.y ? shape.diagonal.start.y : shape.diagonal.end.y;
            shape.diagonal = new Line(new Point(x, y), nearPoint);
            design(shape);
          break;
          case Ellipse:
            if(nearPoint.x === shape.yAxis.end.x) {
              shape.yAxis.fixed = false;
              shape.xAxis.fixed = true;
              shape.yAxis.end = nearPoint;
            }
            if(nearPoint.y === shape.xAxis.end.y) {
              shape.xAxis.fixed = false;
              shape.yAxis.fixed = true;
              shape.xAxis.end = nearPoint;
            }
            design(shape);
          break;
        }
      });
    }
  });
}
