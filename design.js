function design(shape) {
  middle.shape = shape;

  window.eventListeners.add('keydown', 'drawCommands', drawCommands);

  window.eventListeners.add('keydown', 'exitDesignMode', function(e) {
    if(e.which == charCodes['esc']) changeMode(commandMode);
  });

  front.eventListeners.add('mousemove', 'setEnd', function(e) { shape.setEnd(front.setPoint || front.lastPoint); });

  front.eventListeners.add('mousemove', 'previewShape', refreshMiddle = function()  {
    middle.clear();
    shape.preview();
  });

  front.eventListeners.add('click', 'nextStep', function() {
    delete front.setPoint;
    shape.nextStep();
  });

  shape.preview();

  /* set up infopanel */ infopanel.top = shape.name;
  /*                  */ 
  /*                  */ infopanel.buttons = [
  /*                  */   Button('a', 'arc',          'green'),
  /*                  */   Button('b', 'bezier curve', 'green'),
  /*                  */   Button('c', 'circle',       'green'),
  /*                  */   Button('e', 'ellipse',      'green'),
  /*                  */   Button('l', 'line',         'green'),
  /*                  */   Button('r', 'rectangle',    'green'),
  /*                  */   Button('s', 'square',       'green'),
  /*                  */   Button('t', 'triangle',     'green')
  /*                  */ ];
  /*                  */ 
  /*                  */ infopanel.buttons.add(
  /*                  */   Button('i', 'show/hide info', 'yellow'),
  /*                  */   Button('g', 'go to point',    'yellow')
  /*                  */ );
  /*                  */ 
  /*                  */ shape.shiftCommands.forEach(function(command) {
  /*                  */   infopanel.buttons.add(Button(
  /*                  */     command.key.toUpperCase(),
  /*                  */     (command.type || 'set') + ' ' + command.forWhat,
  /*                  */     'blue'
  /*                  */   ));
  /*                  */ });
  /*                  */
  /*                  */ infopanel.buttons.add(Button('esc', 'cancel', 'red'));

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
