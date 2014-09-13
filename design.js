function design(shape) {
  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  window.eventListeners.add('keydown', 'exitDesignMode', function(e) {
    if(e.which == charCodes['esc']) changeMode(commandMode);
  });

  front.eventListeners.add('mousemove', 'setEnd',    function(e) { shape.setEnd(getPoint(e)); });
  front.eventListeners.add('mousemove', 'drawShape', function()  { shape.preview(); });

  front.eventListeners.add('click', 'completeShape', function()  {
    shape.nextStep();
  });

  front.eventListeners.add('mousemove', 'showText', function() {
    front.context.fillText(shape.infoText(), 10, 15);
  });

  shape.draw(front.context);
  front.context.fillText(shape.infoText(), 10, 15);

  replaceInfoText([
    '[a]: arc',
    '[b]: bezier curve',
    '[c]: circle',
    '[e]: ellipse',
    '[l]: line',
    '[r]: rectangle',
    '[s]: square',
    '[t]: triangle',
    '',
    '[SHIFT] +'
  ].concat(
    shape.shiftCommands.map(function(command) {
      return '[' + command.key.toUpperCase() + ']: set ' + command.forWhat;
    })
  ).concat([
    '',
    '[esc]: stop drawing'
  ]));

  shape.shiftCommands.forEach(function(command) {
    window.eventListeners.add('keydown', 'set' + command.forWhat.capitalize(), function(e) {
      if(e.shiftKey && e.which == charCodes[command.key]) {
        var helpText = 'enter ' + command.forWhat + ': ';
        if(command.subtext) helpText = { main: helpText, subtext: command.subtext };
        getInput(helpText, command.callback);
      }
    });
  });

  return shape;
}
