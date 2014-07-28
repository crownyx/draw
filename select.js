function selectMode() {
  front.refresh();

  replaceInfoText(['select']);

  back.shapes.forEach(function(shape) { shape.showPoints(); });

  front.eventListeners.add('mousemove', 'showPoints', function() {
    back.shapes.forEach(function(shape) { shape.showPoints(); });
  });

  front.eventListeners.add('click', 'select', function(e) {
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
  });

  window.eventListeners.add('keydown', 'selectCommands', function(e) {
    switch(e.which) {
      case charCodes['esc']:
        front.refresh(true);
      break;
    }
  });
}
