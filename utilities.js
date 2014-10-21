function getInput(promptText, propToFill, acceptChars, shape) {
  var mainText = promptText.main || promptText;

  var replacement = replaceInfoText([{
    className: 'box',
    textContent: mainText,
    id: 'inputbox'
  },
  {
    className: 'button',
    textContent: 'esc:cancel',
    color: 'red'
  }]);

  var inputbox = document.getElementById('inputbox');
  var inputfield = document.createElement('div');
  inputbox.appendChild(inputfield);

  if(promptText.subtext) {
    var subtext = document.createElement('div');
    subtext.textContent = promptText.subtext;
    inputbox.appendChild(subtext);
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
      document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
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
      document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
    }
  });
}

function replaceInfoText(itemsToAdd) {
  document.body.infodiv.top = itemsToAdd.splice(0, 1)[0];
  document.body.infodiv.buttons = itemsToAdd;
  //var infodiv = document.getElementById('infodiv');
  //var newdiv = document.createElement('div');
  //newdiv.id = 'infodiv';

  //itemsToAdd = itemsToAdd.map(function(item) {
  //  var div;
  //  if(item.className == 'button') {
  //    div = generateButton(item.textContent.split(':')[0], item.textContent.split(':')[1], item.color);
  //  } else {
  //    div = document.createElement('div');
  //    div.className = item.className;
  //    div.id = item.id;
  //    div.textContent = item.textContent;
  //  }
  //  newdiv.appendChild(div);
  //  return div;
  //});
  //document.getElementById('infopanel').replaceChild(newdiv, infodiv);

  //(adjustSizes = function() {
  //  itemsToAdd.forEach(function(button) {
  //    if(button.button) {
  //      var keySegment = button.getElementsByClassName('key_segment')[0];
  //      var textSegment = button.getElementsByClassName('text_segment')[0];
  //      var clientWidth = document.getElementById('infodiv').clientWidth;
  //      button.style.width = clientWidth + 'px';
  //      keySegment.style.width  = clientWidth * 0.15 + 'px';
  //      textSegment.style.width = clientWidth - parseFloat(keySegment.style.width) - 12 + 'px';
  //      keySegment.style.paddingTop = (textSegment.clientHeight - keySegment.getElementsByTagName('span')[0].offsetHeight) - 3 + 'px';
  //      keySegment.getElementsByTagName('span')[0].style.top = (keySegment.clientHeight - parseInt(keySegment.style.paddingTop) - 3 - textSegment.clientHeight + 6) / 2 + 'px';
  //      if(document.getElementById('infodiv').clientWidth != clientWidth) adjustSizes();
  //    }
  //  });
  //})();

  //return { olddiv: infodiv, newdiv: newdiv, bs: itemsToAdd };
}

function generateButton(keyText, infoText, color) {
  var button = document.createElement('div');
  button.className = color + ' button';
  var key = document.createElement('div');
  key.className = 'key_segment';
  var text = document.createElement('div');
  text.className = 'text_segment';
  var keySpan = document.createElement('span');
  keySpan.textContent = keyText;
  text.textContent = infoText;
  key.appendChild(keySpan);
  button.appendChild(key);
  button.appendChild(text);
  button.button = true;
  return button;
}
