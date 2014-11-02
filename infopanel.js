var infopanel = {
  get element() {
    return document.getElementById('infopanel');
  },
  get top() {
    var top = document.getElementById('infopanel-top');
    top.clear = function() { this.innerHTML = ""; }
    return top;
  },
  set top(textContent) {
    this.top.clear();
    var infobox = this.top.appendChild(document.createElement('div'));
    infobox.className = 'box top';
    infobox.textContent = textContent;
    this.resizeButtons();
  },
  get buttons() {
    var buttons = document.getElementById('infopanel-buttons');
    buttons.add = function() {
      for(var i = 0; i < arguments.length; i++) {
        this.appendChild(arguments[i]);
      }
      infopanel.resizeButtons();
    }
    buttons.clear = function() { this.innerHTML = ""; }
    return buttons;
  },
  set buttons(buttonsArray) {
    this.buttons.clear();
    buttonsArray.forEach(function(button) { this.buttons.appendChild(button); }, this);
    this.resizeButtons();
  },
  resizeButtons: function() {
    for(var i = 0; i < this.buttons.childNodes.length; i++) {
      var button = this.buttons.childNodes[i];
      var keySegment = button.getElementsByClassName('key_segment')[0];
      var textSegment = button.getElementsByClassName('text_segment')[0];
      var clientWidth = document.getElementById('infopanel').clientWidth;
      button.style.width = clientWidth - 6 + 'px';
      keySegment.style.width  = clientWidth * 0.15 + 'px';
      textSegment.style.width = clientWidth - parseFloat(keySegment.style.width) - 18 + 'px';
      keySegment.style.paddingTop = (textSegment.clientHeight - keySegment.getElementsByTagName('span')[0].offsetHeight) - 3 + 'px';
      keySegment.getElementsByTagName('span')[0].style.top = (keySegment.clientHeight - parseInt(keySegment.style.paddingTop) - 3 - textSegment.clientHeight + 6) / 2 + 'px';
      if(document.getElementById('infopanel').clientWidth != clientWidth) this.resizeButtons();
    }
  },
  get bottom() {
    var bottom = document.getElementById('infopanel-bottom');
    bottom.clear = function() { this.innerHTML = ""; }
    bottom.add = function(textContent, id) {
      if(document.getElementById(id)) this.removeChild(document.getElementById(id));
      var newDiv = this.appendChild(document.createElement('div'));
      newDiv.className = 'box bottom';
      if(id) newDiv.id = id;
      var mainDiv = newDiv.appendChild(document.createElement('div'));
      mainDiv.textContent = textContent.main || textContent;
      if(textContent.mainColor) mainDiv.style.color = textContent.mainColor;
      if(textContent.subtext) {
        var subDiv = newDiv.appendChild(document.createElement('div'));
        subDiv.textContent = textContent.subtext;
      }
      infopanel.resizeButtons();
    }
    bottom.find = function(id) {
      var infobox = document.getElementById(id);
      if(infobox) infobox.remove = function() { infopanel.bottom.removeChild(infobox); }
      return infobox;
    }
    return bottom;
  }//,
  //set bottom(textContent) {
  //  var _infopanel = document.getElementById('infopanel');
  //  var box = document.createElement('div');
  //  box.className = 'box bottom';
  //  box.textContent = textContent;
  //  if(_infopanel.getElementsByClassName('box bottom').length) {
  //    _infopanel.replaceChild(box, document.getElementsByClassName('bottom')[0]);
  //  } else {
  //    _infopanel.appendChild(box);
  //  }
  //  this.resizeButtons();
  //}
}
