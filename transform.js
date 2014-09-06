function translate(shape, origDiff) {
  front.eventListeners.add('mousemove', 'moveShape', function(e) {
    var currPoint = getPoint(e);
    shape.translate(new Point(currPoint.x + origDiff.x, currPoint.y + origDiff.y));
    shape.draw(front.context);
  });
  front.eventListeners.add('click', 'saveShape', function(e) {
    var currPoint = getPoint(e);
    shape.origin = new Point(currPoint.x + origDiff.x, currPoint.y + origDiff.y);
    shape.complete();
    changeMode(commandMode);
  });
}
