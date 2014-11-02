function Button(key, text, color) {
  var button = document.createElement('div');

  button.button = true;

  button.appendChild((function(keySegment) {
    keySegment.appendChild((function(span) {
      span.textContent = key;
      return span;
    })(document.createElement('span')));
    keySegment.className = 'key_segment';
    return keySegment;
  })(document.createElement('div')));

  button.appendChild((function(textSegment) {
    textSegment.textContent = text;
    textSegment.className = 'text_segment';
    return textSegment;
  })(document.createElement('div')));

  button.className = 'button ' + color;
  button.id = 'button-' + key;

  return button;
}
