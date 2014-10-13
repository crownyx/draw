function design(shape) {
  middle.shape = shape;

  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  window.eventListeners.add('keydown', 'exitDesignMode', function(e) {
    if(e.which == charCodes['esc']) changeMode(commandMode);
  });

  front.eventListeners.add('mousemove', 'setEnd', function(e) { shape.setEnd(front.lastPoint); });

  front.eventListeners.add('mousemove', 'previewShape', refreshMiddle = function()  {
    middle.clear();
    shape.preview();
  });

  front.eventListeners.add('click', 'nextStep', function()  { shape.nextStep(); });

  shape.preview();

  replaceInfoText([{
    className: 'box',
    textContent: shape.name
  }].concat([
      'a:arc',
      'b:bezier curve',
      'c:circle',
      'e:ellipse',
      'l:line',
      'r:rectangle',
      's:square',
      't:triangle',
    ].map(function(command) {
      return({
        className: 'button',
        color: 'gray',
        textContent: command
      });
    })
  ).concat({
    className: 'button',
    color: 'yellow',
    textContent: 'i:show/hide info'
  }).concat(
    shape.shiftCommands.map(function(command) {
      return({
        className: 'button',
        color: 'blue',
        textContent: command.key.toUpperCase() + ':' + (command.type || 'set') + ' ' + command.forWhat
      });
    }),
    { className: 'button', textContent: 'esc:stop drawing', color: 'red' }
  ));

  window.eventListeners.add('keydown', 'showHideInfo', hideInfo = function(e) {
    if(e.which == charCodes['i']) {
      middle.showText = !middle.showText;
      refreshMiddle();
    }
  });

  shape.shiftCommands.forEach(function(command) {
    switch(command.type) {
      case 'toggle':
        window.eventListeners.add('keydown', 'toggle' + command.forWhat.capitalize(), function(e) {
          if(e.shiftKey && e.which == charCodes[command.key]) {
            command.callback.call(shape);
            refreshMiddle();
          }
        });
      break;
      case 'switch to':
        window.eventListeners.add('keydown', 'switchTo' + command.forWhat.capitalize(), function(e) {
          if(e.shiftKey && e.which == charCodes[command.key]) {
            window.designShape(command.switchTo.call(shape));
          }
        });
      break;
      default:
        window.eventListeners.add('keydown', 'set' + command.forWhat.capitalize(), function(e) {
          if(e.shiftKey && e.which == charCodes[command.key]) {
            var helpText = 'enter ' + command.forWhat + ': ';
            if(command.subtext) helpText = { main: helpText, subtext: command.subtext };
            getInput(helpText, command.callback, command.acceptChars || [], shape);
          }
        });
      break;
    }
  });
}
