function design(shape) {
  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  window.eventListeners.add('keydown', 'exitDesignMode', function(e) {
    if(e.which == charCodes['esc']) changeMode(commandMode);
  });

  front.eventListeners.add('mousemove', 'setEnd',    function(e) {
    shape.setEnd(getPoint(e));
  });

  front.eventListeners.add('mousemove', 'previewShape', refreshMiddle = function()  {
    middle.clear();
    shape.preview();
  });

  front.eventListeners.add('click', 'nextStep', function()  { shape.nextStep(); });

  shape.preview();

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
    '[i]: show/hide info',
    '',
    '[SHIFT] +'
  ].concat(
    shape.shiftCommands.map(function(command) {
      var verb = command.toggle ? 'toggle ' : 'set ';
      return '[' + command.key.toUpperCase() + ']: ' + verb + command.forWhat;
    })
  ).concat([
    '',
    '[esc]: stop drawing'
  ]));

  window.eventListeners.add('keydown', 'showHideInfo', hideInfo = function(e) {
    if(e.which == charCodes['i']) {
      middle.showText = !middle.showText;
      refreshMiddle();
    }
  });

  shape.shiftCommands.forEach(function(command) {
    if(command.toggle) {
      window.eventListeners.add('keydown', 'toggle' + command.forWhat.capitalize(), function(e) {
        if(e.shiftKey && e.which == charCodes[command.key]) {
          command.callback.call(shape);
          refreshMiddle();
        }
      });
    } else {
      window.eventListeners.add('keydown', 'set' + command.forWhat.capitalize(), function(e) {
        if(e.shiftKey && e.which == charCodes[command.key]) {
          var helpText = 'enter ' + command.forWhat + ': ';
          if(command.subtext) helpText = { main: helpText, subtext: command.subtext };
          getInput(helpText, command.callback, command.acceptChars || [], shape);
        }
      });
    }
  });
}
