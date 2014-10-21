function setUpInfoDiv() {
  document.body.infodiv = {
    set top(textContent) {
      var infodiv = document.getElementById('infodiv');
      var boxTop = (function(box) {
        box.className = 'box top';
        box.textContent = textContent.textContent;
        return box;
      })(document.createElement('div'));
      if(infodiv.getElementsByClassName('box top')[0]) {
        infodiv.replaceChild(boxTop, infodiv.getElementsByClassName('box top')[0]);
      } else {
        infodiv.appendChild(boxTop);
      }
      this.adjustChildSizes;
    },
    get bottom() {
      return {
        clear: function() {
          var boxBottom = document.getElementById('infodiv').getElementsByClassName('box bottom')[0];
          if(boxBottom) document.getElementById('infodiv').removeChild(boxBottom);
        },
        get textContent() {
          return document.getElementById('infodiv').getElementsByClassName('box bottom')[0].textContent;
        }
      }
    },
    set bottom(textContent) {
      document.getElementById('infodiv').appendChild((function(box) {
        box.className = "box bottom";
        box.textContent = textContent;
        return box;
      })(document.createElement('div')));
      this.adjustChildSizes();
    },
    get buttons() {
      var buttons = [];
      var infodiv = document.getElementById('infodiv');
      for(var i = 0; i < infodiv.childNodes.length; i++) {
        if(infodiv.childNodes[i].button) buttons.push(infodiv.childNodes[i]);
      }
      return buttons;
    },
    set buttons(buttonsArray) {
      var infodiv = document.getElementById('infodiv');
      this.buttons.forEach(function(button) {
        infodiv.removeChild(button);
      });
      var buttons = buttonsArray.map(function(button) {
        var buttonDiv = document.createElement('div');
        buttonDiv.className = 'button ' + button.color;
        buttonDiv.appendChild((function(keySegment) {
          keySegment.className = 'key_segment';
          var span = keySegment.appendChild(document.createElement('span'));
          span.textContent = button.textContent.split(':')[0];
          return keySegment;
        })(document.createElement('div')));
        buttonDiv.appendChild((function(textSegment) {
          textSegment.className = 'text_segment';
          textSegment.textContent = button.textContent.split(':')[1];
          return textSegment;
        })(document.createElement('div')));
        buttonDiv.button = true;
        infodiv.insertBefore(buttonDiv, infodiv.getElementsByClassName('box bottom')[0]);
        return buttonDiv;
      });
      this.adjustChildSizes();
    },
    adjustChildSizes: function() {
      this.buttons.forEach(function(button) {
        var keySegment = button.getElementsByClassName('key_segment')[0];
        var textSegment = button.getElementsByClassName('text_segment')[0];
        var clientWidth = document.getElementById('infodiv').clientWidth;
        button.style.width = clientWidth + 'px';
        keySegment.style.width  = clientWidth * 0.15 + 'px';
        textSegment.style.width = clientWidth - parseFloat(keySegment.style.width) - 12 + 'px';
        keySegment.style.paddingTop = (textSegment.clientHeight - keySegment.getElementsByTagName('span')[0].offsetHeight) - 3 + 'px';
        keySegment.getElementsByTagName('span')[0].style.top = (keySegment.clientHeight - parseInt(keySegment.style.paddingTop) - 3 - textSegment.clientHeight + 6) / 2 + 'px';
        if(document.getElementById('infodiv').clientWidth != clientWidth) this.adjustChildSizes();
      }, this);
    }
  };
}
