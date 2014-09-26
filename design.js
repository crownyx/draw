function design(shape) {
  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  window.eventListeners.add('keydown', 'exitDesignMode', function(e) {
    if(e.which == charCodes['esc']) changeMode(commandMode);
  });

  front.eventListeners.add('mousemove', 'setEnd',    function(e) { shape.setEnd(getPoint(e)); });

  front.eventListeners.add('mousemove', 'drawShape', refreshMiddle = function()  {
    middle.clear(); shape.preview();
  });

  front.eventListeners.add('click', 'completeShape', function()  { shape.nextStep(); });

  front.eventListeners.add('mousemove', 'showText', function() {
    middle.context.fillText(shape.infoText(), 10, 15);
  });

  shape.preview();
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
    '[i]: show/hide info',
    '',
    '[SHIFT] +'
  ].concat(
    shape.shiftCommands.map(function(command) {
      return '[' + command.key.toUpperCase() + ']: ' + (command.toggle ? 'toggle ' : 'set ') + command.forWhat;
    })
  ).concat([
    '',
    '[esc]: stop drawing'
  ]));

  window.eventListeners.add('keydown', 'showHideInfo', hideInfo = function(e) {
    if(e.which == charCodes['i']) {
      front.eventListeners.suspend('showText');
      refreshMiddle();
      window.eventListeners.add('keydown', 'showHideInfo', showInfo = function(e) {
        front.eventListeners.resume('showText');
        front.eventListeners.find('showText').callback();
        window.eventListeners.add('keydown', 'showHideInfo', hideInfo);
      });
    }
  });

  shape.shiftCommands.forEach(function(command) {
    if(command.toggle) {
      window.eventListeners.add('keydown', 'toggle' + command.forWhat.capitalize(), function(e) {
        if(e.shiftKey && e.which == charCodes[command.key]) {
          command.callback.call(shape);
        }
      });
    } else {
      window.eventListeners.add('keydown', 'set' + command.forWhat.capitalize(), function(e) {
        if(e.shiftKey && e.which == charCodes[command.key]) {
          var helpText = 'enter ' + command.forWhat + ': ';
          if(command.subtext) helpText = { main: helpText, subtext: command.subtext };
          getInput(helpText, command.callback, shape);
        }
      });
    }
  });
}
