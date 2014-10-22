var infopanel = {
  get top() {
    var _infopanel = document.getElementById('infopanel');
    var top = _infopanel.getElementsByClassName('box top')[0];
    top.remove = function() { _infopanel.removeChild(top); }
    return top;
  },
  set top(textContent) {
    var _infopanel = document.getElementById('infopanel');
    var boxTop = document.createElement('div');
    boxTop.className = 'box top';
    boxTop.textContent = textContent;
    boxTop.id = 'boxtop';
    if(document.getElementById('boxtop')) {
      _infopanel.replaceChild(boxTop, document.getElementById('boxtop'));
    } else {
      _infopanel.appendChild(boxTop);
    }
    this.adjustChildSizes();
  },
  get bottom() {
    return {
      clear: function() {
        var boxBottom = document.getElementById('infopanel').getElementsByClassName('box bottom')[0];
        if(boxBottom) document.getElementById('infopanel').removeChild(boxBottom);
      },
      get textContent() {
        return document.getElementById('infopanel').getElementsByClassName('box bottom')[0].textContent;
      }
    }
  },
  set bottom(textContent) {
    document.getElementById('infopanel').appendChild((function(box) {
      box.className = "box bottom";
      box.textContent = textContent;
      return box;
    })(document.createElement('div')));
    this.adjustChildSizes();
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
      infopanel.adjustChildSizes();
    }
    return buttons;
  },
  set buttons(buttonsArray) {
    var _infopanel = document.getElementById('infopanel');
    this.buttons.forEach(function(button) { _infopanel.removeChild(button); });
    buttonsArray.forEach(function(button) { _infopanel.appendChild(button); });
    this.adjustChildSizes();
  },
  adjustChildSizes: function() {
    this.buttons.forEach(function(button) {
      var keySegment = button.getElementsByClassName('key_segment')[0];
      var textSegment = button.getElementsByClassName('text_segment')[0];
      var clientWidth = document.getElementById('infopanel').clientWidth;
      button.style.width = clientWidth + 'px';
      keySegment.style.width  = clientWidth * 0.15 + 'px';
      textSegment.style.width = clientWidth - parseFloat(keySegment.style.width) - 12 + 'px';
      keySegment.style.paddingTop = (textSegment.clientHeight - keySegment.getElementsByTagName('span')[0].offsetHeight) - 3 + 'px';
      keySegment.getElementsByTagName('span')[0].style.top = (keySegment.clientHeight - parseInt(keySegment.style.paddingTop) - 3 - textSegment.clientHeight + 6) / 2 + 'px';
      if(document.getElementById('infopanel').clientWidth != clientWidth) this.adjustChildSizes();
    }, this);
  }
}
