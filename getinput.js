function getInput(promptText, propToFill, acceptChars = [], shape) {
  var mainText = promptText.main || promptText;

  var oldTop = infopanel.top.textContent;
  infopanel.top = mainText;
  var newTop = infopanel.top.getElementsByClassName('box top')[0];

  var inputfield = document.createElement('div');
  newTop.appendChild(inputfield);

  if(promptText.subtext) {
    var subtext = document.createElement('div');
    subtext.textContent = promptText.subtext;
    subtext.className = 'input-subtext'
    newTop.appendChild(subtext);
  }

  window.eventListeners.suspendAll();
  window.removeEventListener('keydown', setOrPickPoint, false);
  // ^^^ defined in draw.js; need to remove separately because not included in window.eventListeners

  var input = [];
  var alphabetical = !!acceptChars.find(function(charSet) { return charSet == 'a-z' });
  var acceptedChar;

  window.eventListeners.add('keydown', 'getInput', function(e) {
    if(e.which >= charCodes.zero && e.which <= charCodes.nine && !e.shiftKey) {
      inputfield.textContent += (e.which - charCodes.zero);
      input.push(e.which - charCodes.zero);
    } else if((function() {
        acceptedChar = acceptChars.find(function(acceptChar) {
          return(
            e.which == (charCodes[acceptChar] && charCodes[acceptChar].code ? charCodes[acceptChar].code : charCodes[acceptChar]) &&
            e.shiftKey == !!(charCodes[acceptChar]).shiftKey
          );
        });
        if(!acceptedChar && alphabetical && e.which >= charCodes['a'] && e.which <= charCodes['z'])
          acceptedChar = charCodes.find(function(character, code) { return code == e.which; })[0];
        return acceptedChar;
      })())
    {
      inputfield.textContent += acceptedChar;
      input.push(acceptedChar);
    } else if(e.which == charCodes['enter']) {
      window.eventListeners.remove('getInput');
      window.addEventListener('keydown', setOrPickPoint, false);
      window.eventListeners.resumeAll();
      infopanel.top = oldTop;
      middle.clear();
      propToFill(input.join(''));
      if(shape) shape.setEnd(front.usePoint);
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
