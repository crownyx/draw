function design(shape) {
  front.refresh();

  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  front.eventListeners.add('mousemove', 'setEnd',    function(e) { shape.setEnd(getPoint(e)); });
  front.eventListeners.add('mousemove', 'drawShape', function()  { shape.draw(front.context); });
  front.eventListeners.add('click', 'completeShape', function()  { shape.complete();          });

  front.eventListeners.add('mousemove', 'showText', function() {
    front.context.fillText(shape.infoText(), 10, 15);
  });

  shape.draw(front.context);
  front.context.fillText(shape.infoText(), 10, 15);

  if(front.infopanel.contains(front.infopanel.infodiv)) {
    replaceInfoText(['[a]: arc',
     '[b]: bezier curve',
     '[c]: circle',
     '[e]: ellipse',
     '[l]: line',
     '[r]: rectangle',
     '[s]: square',
     '[t]: triangle',
     '',
     '[esc]: stop drawing'
    ]);
  }

  return shape;
}
