function getInput(promptText, propToFill, acceptChars, shape) {
  var mainText = promptText.main || promptText;

  var oldTop = infopanel.top.textContent;
  infopanel.top = mainText;

  var inputfield = document.createElement('div');
  infopanel.top.appendChild(inputfield);

  if(promptText.subtext) {
    var subtext = document.createElement('div');
    subtext.textContent = promptText.subtext;
    infopanel.top.appendChild(subtext);
  }

  window.eventListeners.suspendAll();

  var input = [];
  var acceptedChar;

  window.eventListeners.add('keydown', 'getInput', function(e) {
    if(e.which >= charCodes.zero && e.which <= charCodes.nine) {
      inputfield.textContent += (e.which - charCodes.zero);
      input.push(e.which - charCodes.zero);
    } else if((function() {
        var found = acceptChars.find(function(acceptChar) {
          return e.which == acceptChar.charCode;
        });
        acceptedChar = (found || {}).character;
        return acceptedChar;
      })())
    {
      inputfield.textContent += acceptedChar;
      input.push(acceptedChar);
    } else if(e.which == charCodes['enter']) {
      window.eventListeners.remove('getInput');
      window.eventListeners.resumeAll();
      infopanel.top = oldTop;
      middle.clear();
      propToFill.call((shape || window), input.join(''));
      if(shape) shape.setEnd(front.lastPoint);
      if(shape) shape.preview();
    } else if(e.which == charCodes['backspace']) {
      inputfield.textContent = inputfield.textContent.slice(0, -1);
      input.pop();
    } else if(e.which == charCodes['esc']) {
      window.eventListeners.remove('getInput');
      window.eventListeners.resumeAll();
      infopanel.top = oldTop;
    }
  });
}
