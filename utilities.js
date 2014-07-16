function getInput(promptText, propToFill) {
  var mainText = promptText.main || promptText;

  var textToAdd = [{ className: 'center', text: mainText, id: 'inputdiv' }];
  if(promptText.subtext)
    textToAdd.push({ className: 'center', text: promptText.subtext });
  textToAdd.push('', '[esc]: cancel');
  var replacement = replaceInfoText(textToAdd);

  var b = replacement.bs[0];

  var prevCommands = window.eventListeners.clear();

  window.eventListeners.add('keydown', 'getInput', function(e) {
    if(e.which >= charCodes.zero && e.which <= charCodes.nine) {
      b.textContent += (e.which - charCodes.zero);
    } else if(e.which == charCodes.enter) {
      window.eventListeners.remove('getInput');
      prevCommands.forEach(function(el) {
        window.eventListeners.add(el.eventType, el.callbackName, el.callback);
      });
      propToFill(infodiv.textContent.replace(mainText, ''));
      document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
      if(subdiv) document.getElementById('infopanel').removeChild(subdiv);
    } else if(e.which == charCodes['backspace']) {
      b.textContent = infodiv.textContent.slice(0, -1);
    } else if(e.which == charCodes['esc']) {
      window.eventListeners.remove('getInput');
      prevCommands.forEach(function(el) {
        window.eventListeners.add(el.eventType, el.callbackName, el.callback);
      });
      document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
      if(subdiv) document.getElementById('infopanel').removeChild(subdiv);
    }
  });
}

function replaceInfoText(infoText) {
  var infodiv = front().canvas.infodiv;
  var newdiv = document.createElement('div');
  newdiv.id = 'infodiv';
  var bs = infoText.map(function(text) {
    var b = document.createElement('b');
    if(text.id) b.id = text.id;
    if(text.className) b.className = text.className;
    var text = text.text || text || '<br/>';
    b.innerHTML = text;
    newdiv.appendChild(b);
    return b;
  });
  document.getElementById('infopanel').replaceChild(newdiv, infodiv);
  return { olddiv: infodiv, newdiv: newdiv, bs: bs };
}
