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
    front.infopanel.replaceChild(
      (function() {
        var newdiv = document.createElement('div');
        ['[a]: arc',
         '[b]: bezier curve',
         '[c]: circle',
         '[e]: ellipse',
         '[l]: line',
         '[r]: rectangle',
         '[s]: square',
         '[t]: triangle',
         '',
         '[esc]: stop drawing'
        ].forEach(function(line) {
          newdiv.appendChild((function() {
            if(line) {
              var b = document.createElement('b');
              b.textContent = line;
              return b;
            } else {
              return document.createElement('br');
            }
          })());
        });
        newdiv.id = 'infodiv';
        return newdiv;
      })(),
      front.infopanel.infodiv
    );
  }

  return shape;
}
