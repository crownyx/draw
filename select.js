function selectMode() {
  front.refresh();

  replaceInfoText([{
    text: 'select one or more points from each shape you want to select',
    className: 'center'
  }]);

  var allPoints = back.shapes.reduce(function(prev, currShape) {
    var points = currShape.points;
    points.forEach(function(point) {
      point.shape = currShape;
    });
    return prev.concat(points);
  }, []);

  allPoints.forEach(function(point) {
    point.fill(back.context, { radius: 2 });
  });

  front.eventListeners.add('click', 'select', function(e) {
    front.eventListeners.clear();

    var selectRect = new Rectangle(getPoint(e), getPoint(e));
    front.eventListeners.add('mousemove', 'showSelectRect', function(e) {
      selectRect.setEnd(getPoint(e));
      front.context.strokeStyle = "blue";
      front.context.fillStyle = "rgba(173,216,230,0.25)";
        selectRect.draw(front.context);
        front.context.fillRect(
          selectRect.diagonal.start.x,
          selectRect.diagonal.start.y,
          selectRect.diagonal.end.x - selectRect.diagonal.start.x,
          selectRect.diagonal.end.y - selectRect.diagonal.start.y
        );
      front.context.strokeStyle = "black";
      front.context.fillStyle = "black";
    });

    front.eventListeners.add('click', 'completeSelection', function(e) {
      front.eventListeners.clear();

      selectRect.setEnd(getPoint(e));
      var leftMost  = Math.min(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var rightMost = Math.max(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var upperMost = Math.min(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
      var lowerMost = Math.max(selectRect.diagonal.end.y, selectRect.diagonal.start.y);

      back.clear();
      var selected = [];
      allPoints.forEach(function(point) {
        if(point.x > leftMost && point.x < rightMost && point.y > upperMost && point.y < lowerMost) {
          if(!(selected.indexOf(point.shape) + 1)) {
            selected.push(point.shape);
            back.shapes.remove(point.shape);
            //point.shape.strokeStyle = "blue";
            //point.shape.draw(back.context);
          }
        }
      });
      back.shapes.forEach(function(shape) { shape.draw(back.context); });
      front.refresh();
      design(selected[0]);
    });
  });

  window.eventListeners.add('keydown', 'selectCommands', function(e) {
    switch(e.which) {
      case charCodes['esc']:
        front.refresh(true);
        back.clear();
        back.shapes.forEach(function(shape) { shape.draw(back.context); });
      break;
    }
  });
}
