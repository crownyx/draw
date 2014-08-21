function translate(shape) {
  front.eventListeners.add('mousemove', 'moveShape', function(e) {
    shape.translate(getPoint(e));
    shape.draw(front.context);
  });
  front.eventListeners.add('click', 'saveShape', function(e) {
    shape.translate(getPoint(e));
    shape.complete();
    changeMode(commandMode);
  });
}
