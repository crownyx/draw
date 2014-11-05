function style(group) {
  window.eventListeners.clear();

  infopanel.buttons = [
    Button('f',   'fill',   'green'),
    Button('l',   'line',   'green'),
    Button('esc', 'cancel', 'red')
  ];

  window.eventListeners.add('keydown', 'whatToStyle', function(e) {
    if(!e.shiftKey) {
      switch(e.which) {
        case charCodes['f']:
          getInput(
            {
              main: 'enter color:',
              subtext: '(color name or rgb/rgba function)'
            },
            function(color) {
              group.shapes.forEach(function(shape) { shape.fillStyle = color; });
              group.shapes.forEach(function(shape) { shape.complete(); });
              changeMode(commandMode);
            },
            ['a-z', '(', ')', ',']
          );
        break;
        case charCodes['l']:
          getInput(
            {
              main: 'enter line style:',
              subtext: 'width:[float], color:[colorvalue], cap:[butt|round|square], join:[round|bevel|miter], miterLimit:[integer]'
            },
            function(lineStyle) {
              keyValues = lineStyle.split(',').map(function(keyValue) { return keyValue.split(':'); });
              for(var i = 0; i < keyValues.length; i++) {
                switch(keyValues[i][0]) {
                  case 'width':
                    group.shapes.forEach(function(shape) { shape.lineWidth = keyValues[i][1]; });
                  break;
                  case 'color':
                    group.shapes.forEach(function(shape) { shape.strokeStyle = keyValues[i][1]; });
                  break;
                  case 'join':

                  break;
                }
                group.shapes.forEach(function(shape) { shape.complete(); });
                changeMode(commandMode);
              }
            },
            ['a-z', ':', ',']
          );
        break;
      }
    }
  });
}
