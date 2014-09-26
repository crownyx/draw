function getInput(promptText, propToFill, shape) {
  var mainText = promptText.main || promptText;

  var textToAdd = [{ className: 'center', text: mainText, id: 'inputdiv' }];
  if(promptText.subtext)
    textToAdd.push('', { className: 'center', text: promptText.subtext });
  textToAdd.push('', '[esc]: cancel');
  var replacement = replaceInfoText(textToAdd);

  var b = replacement.bs[0];

  window.eventListeners.suspendAll();

  var input = [];

  window.eventListeners.add('keydown', 'getInput', function(e) {
    if(e.which >= charCodes.zero && e.which <= charCodes.nine) {
      b.textContent += (e.which - charCodes.zero);
      input.push(e.which - charCodes.zero);
    } else if(e.which == charCodes['comma']) {
      b.textContent += ',';
      input.push(',');
    } else if(e.which == charCodes.enter) {
      window.eventListeners.remove('getInput');
      window.eventListeners.resumeAll();
      propToFill.call(shape, input.join(''));
      document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
      middle.clear();
      shape.setEnd(front.lastPoint);
      shape.preview();
      front.eventListeners.find('showText').callback();
    } else if(e.which == charCodes['backspace']) {
      b.textContent = b.textContent.slice(0, -1);
      input.pop();
    } else if(e.which == charCodes['esc']) {
      window.eventListeners.remove('getInput');
      window.eventListeners.resumeAll();
      document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
    }
  });
}

function replaceInfoText(infoText) {
  var infodiv = document.getElementById('infodiv');
  var newdiv = document.createElement('div');
  newdiv.id = 'infodiv';
  var bs = infoText.map(function(text) {
    var b = document.createElement('b');
    if(text.id) b.id = text.id;
    if(text.className) b.className = text.className;
    var text = text.text || text;
    if(text) { b.textContent = text; } else { b = document.createElement('br'); }
    newdiv.appendChild(b);
    return b;
  });
  document.getElementById('infopanel').replaceChild(newdiv, infodiv);
  return { olddiv: infodiv, newdiv: newdiv, bs: bs };
}
