function translate(shape, origDiff) {
  var origin = shape.center;
  front.eventListeners.add('mousemove', 'moveShape', function(e) {
    middle.clear();
    var currPoint = Point.from(e);
    shape.translate(new Point(currPoint.x + origDiff.x, currPoint.y + origDiff.y));
    shape.draw(middle.context);
    var translationPath = new Line(origin, shape.center);
    translationPath.preview(true);
    front.context.fillText('distance: ' + Math.round(translationPath.length), 10, 15);
  });
  front.eventListeners.add('click', 'saveShape', function(e) {
    var currPoint = Point.from(e);
    shape.translate(new Point(currPoint.x + origDiff.x, currPoint.y + origDiff.y));
    shape.complete();
    changeMode(commandMode);
  });
}
