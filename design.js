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

  /* generateButton */ function generateButton(keyText, infoText, color) {
  /*                */   var button = document.createElement('div');
  /*                */   button.className = color + ' button';
  /*                */   var key = document.createElement('div');
  /*                */   key.className = 'key_segment';
  /*                */   var text = document.createElement('div');
  /*                */   text.className = 'text_segment';
  /*                */   var keySpan = document.createElement('span');
  /*                */   keySpan.textContent = keyText;
  /*                */   text.textContent = infoText;
  /*                */   key.appendChild(keySpan);
  /*                */   button.appendChild(key);
  /*                */   button.appendChild(text);
  /*                */   return button;
  /*                */ }

  var buttons = [
    'a:arc',
    'b:bezier curve',
    'c:circle',
    'e:ellipse',
    'l:line',
    'r:rectangle',
    's:square',
    't:triangle',
  ].map(function(command) {
    return generateButton(command.split(':')[0], command.split(':')[1], 'gray');
  }).concat(
    generateButton('i', 'show/hide info', 'yellow')
  ).concat(
    shape.shiftCommands.map(function(command) {
      return(generateButton(
        command.key.toUpperCase(),
        (command.type || 'set') + ' ' + command.forWhat,
        'blue'
      ));
    }),
    generateButton('esc', 'stop drawing', 'red')
  );

  var infodiv = document.getElementById('infodiv');
  var newdiv = document.createElement('div');
  newdiv.id = 'infodiv';

  buttons.forEach(function(button) { newdiv.appendChild(button); });

  document.getElementById('infopanel').replaceChild(newdiv, infodiv);

  buttons.forEach(function(button) {
    var keySegment = button.getElementsByClassName('key_segment')[0];
    var textSegment = button.getElementsByClassName('text_segment')[0];
    keySegment.style.width  = document.getElementById('infodiv').clientWidth * 0.2 + 'px';
    textSegment.style.width = document.getElementById('infodiv').clientWidth - parseInt(keySegment.style.width) - 30 + 'px';
    keySegment.style.paddingTop = (textSegment.clientHeight - keySegment.getElementsByTagName('span')[0].offsetHeight) - 5 + 'px';
    keySegment.getElementsByTagName('span')[0].style.top = (keySegment.clientHeight - parseInt(keySegment.style.paddingTop) - 5 - textSegment.clientHeight + 10) / 2 + 'px';
  });

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
