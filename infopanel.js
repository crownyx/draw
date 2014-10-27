var infopanel = {
  get top() {
    var _infopanel = document.getElementById('infopanel');
    var top = _infopanel.getElementsByClassName('box top')[0];
    if(!top) {
      top = _infopanel.insertBefore(document.createElement('div'), this.buttons[0]);
      top.className = 'top';
    }
    top.remove = function() { _infopanel.removeChild(top); }
    return top;
  },
  set top(textContent) {
    var _infopanel = document.getElementById('infopanel');
    var boxTop = document.createElement('div');
    boxTop.className = 'box top';
    boxTop.textContent = textContent;
    _infopanel.replaceChild(boxTop, this.top);
    this.resizeButtons();
  },
  get bottom() {
    var _infopanel = document.getElementById('infopanel');
    var bottom = _infopanel.getElementsByClassName('box bottom')[0];
    if(!bottom) {
      bottom = _infopanel.appendChild(document.createElement('div'));
      bottom.className = 'bottom';
    }
    bottom.remove = function() { _infopanel.removeChild(bottom); }
    bottom.add = function(textContent) {
      var newDiv = _infopanel.appendChild(document.createElement('div'));
      newDiv.className = 'box bottom';
      newDiv.textContent = textContent;
      infopanel.resizeButtons();
    }
    return bottom;
  },
  set bottom(textContent) {
    var _infopanel = document.getElementById('infopanel');
    var box = document.createElement('div');
    box.className = 'box bottom';
    box.textContent = textContent;
    if(_infopanel.getElementsByClassName('box bottom').length) {
      _infopanel.replaceChild(box, document.getElementsByClassName('bottom')[0]);
    } else {
      _infopanel.appendChild(box);
    }
    this.resizeButtons();
  },
  get buttons() {
    var buttons = [];
    var _infopanel = document.getElementById('infopanel');
    for(var i = 0; i < _infopanel.childNodes.length; i++) {
      if(_infopanel.childNodes[i].button) buttons.push(_infopanel.childNodes[i]);
    }
    buttons.add = function() {
      for(var i = 0; i < arguments.length; i++) {
        _infopanel.insertBefore(arguments[i], _infopanel.getElementsByClassName('box bottom')[0]);
      }
      infopanel.resizeButtons();
    }
    buttons.remove = function() {
      this.forEach(function(button) {
        _infopanel.removeChild(button);
      });
    }
    return buttons;
  },
  set buttons(buttonsArray) {
    var _infopanel = document.getElementById('infopanel');
    this.buttons.forEach(function(button) { _infopanel.removeChild(button); });
    buttonsArray.forEach(function(button) {
      _infopanel.insertBefore(button, infopanel.bottom);
    });
    this.resizeButtons();
  },
  resizeButtons: function() {
    this.buttons.forEach(function(button) {
      var keySegment = button.getElementsByClassName('key_segment')[0];
      var textSegment = button.getElementsByClassName('text_segment')[0];
      var clientWidth = document.getElementById('infopanel').clientWidth;
      button.style.width = clientWidth + 'px';
      keySegment.style.width  = clientWidth * 0.15 + 'px';
      textSegment.style.width = clientWidth - parseFloat(keySegment.style.width) - 18 + 'px';
      keySegment.style.paddingTop = (textSegment.clientHeight - keySegment.getElementsByTagName('span')[0].offsetHeight) - 3 + 'px';
      keySegment.getElementsByTagName('span')[0].style.top = (keySegment.clientHeight - parseInt(keySegment.style.paddingTop) - 3 - textSegment.clientHeight + 6) / 2 + 'px';
      if(document.getElementById('infopanel').clientWidth != clientWidth) this.resizeButtons();
    }, this);
  }
}
