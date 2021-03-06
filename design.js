function design(shape) {
  middle.shape = shape;
  shape.preview();

  if(front.pickedPoint) delete front.pickedPoint;

  window.eventListeners.add('keydown', 'drawCommands', drawCommands); // why here and draw.js?

  window.eventListeners.add('keydown', 'exitMode', function(e) {
    if(e.which === charCodes['esc']) changeMode(commandMode);
  });

  front.eventListeners.add('mousemove', 'setEnd', function() {
    shape.setEnd(front.usePoint);
    shape.preview();
  });

  front.eventListeners.add('click', 'nextStep', function() {
    shape.setEnd(front.usePoint);
    shape.preview();
    if(front.setPoint) {
      delete front.setPoint;
      infopanel.bottom.clear();
    }
    shape.nextStep();
  });

  //////////////////////
  // set up infopanel //
  //////////////////////
  infopanel.top = shape.name;
  
  infopanel.buttons = [
    Button('a', 'arc',          'green'),
    Button('b', 'bezier curve', 'green'),
    Button('c', 'circle',       'green'),
    Button('e', 'ellipse',      'green'),
    Button('l', 'line',         'green'),
    Button('r', 'rectangle',    'green'),
    //Button('s', 'square',       'green'),
    //Button('t', 'triangle',     'green'),
    Button(':', 'show/hide info', 'yellow'),
    Button('>', 'go to point',    'yellow'),
    Button('.', 'show points',    'yellow')
  ];

  var guidelineCommand = {
    key: 'g',
    type: 'toggle',
    forWhat: 'guideline'
  }
  
  shape.shiftCommands.concat(guidelineCommand).sortBy('key').forEach(function(command) {
    infopanel.buttons.add(Button(
      command.key.toUpperCase(),
      (command.type || 'set') + ' ' + command.forWhat,
      'blue'
    ));
  });
  
  infopanel.buttons.add(Button('esc', 'cancel', 'red'));
  //////////////////////
  //////////////////////
  //////////////////////

  shape.shiftCommands.concat(guidelineCommand).forEach(function(command) {
    var propertyName = 'fixed' + (command.propertyName || command.forWhat).capitalize();
    command.infobox = function() {
      return {
        main: 'fixed ' + command.forWhat + ': ' + command.prettify(),
        subtext: 'to undo, type "' + command.key.capitalize() + '", then enter "x"',
        id: propertyName, mainColor: 'yellow'
      };
    }
    var property = shape[propertyName];
    if(property) infopanel.bottom.add(command.infobox(), propertyName);
  });

  window.eventListeners.add('keydown', 'showHideInfo', hideInfo = function(e) {
    if(e.which === charCodes[':'].code) {
      middle.showText = !middle.showText;
      middle.redraw();
    }
  });

  shape.shiftCommands.concat(guidelineCommand).forEach(function(command) {
    switch(command.type) {
      case 'toggle':
        window.eventListeners.add('keydown', 'toggle' + command.forWhat.capitalize(), function(e) {
          if(e.shiftKey && e.which == charCodes[command.key]) {
            var propertyName = command.propertyName || command.forWhat;
            command.callback ? command.callback.call(shape) : shape[propertyName] = !shape[propertyName];
            middle.redraw();
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
            getInput(helpText, function(input) {
              command.callback.call(shape, input);
              var propertyName = 'fixed' + (command.propertyName || command.forWhat).capitalize();
              var property = shape[propertyName];
              if(property) {
                if(infopanel.bottom.find(propertyName)) infopanel.bottom.find(propertyName).remove();
                infopanel.bottom.add(command.infobox(), propertyName);
              }
            }, command.acceptChars || [], shape);
          }
        });
      break;
    }
  });

  return shape;
}
