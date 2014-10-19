function setUpInfoDiv() {
  document.infodiv = {
    get bottom() {
      return {
        clear: function() {
          var boxBottom = document.getElementById('infodiv').getElementsByClassName('box bottom')[0];
          if(boxBottom) document.getElementById('infodiv').removeChild(boxBottom);
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
    adjustChildSizes: function() {
      this.buttons.forEach(function(button) {
        var keySegment = button.getElementsByClassName('key_segment')[0];
        var textSegment = button.getElementsByClassName('text_segment')[0];
        var clientWidth = document.getElementById('infodiv').clientWidth;
        keySegment.style.width  = clientWidth * 0.2 + 'px';
        textSegment.style.width = clientWidth - parseInt(keySegment.style.width) - 30 + 'px';
        button.style.width = parseInt(keySegment.style.width) + parseInt(textSegment.style.width) + 20 + 'px';
        keySegment.style.paddingTop = (textSegment.clientHeight - keySegment.getElementsByTagName('span')[0].offsetHeight) - 5 + 'px';
        if(document.getElementById('infodiv').clientWidth != clientWidth) this.adjustChildSizes();
        keySegment.getElementsByTagName('span')[0].style.top = (keySegment.clientHeight - parseInt(keySegment.style.paddingTop) - 5 - textSegment.clientHeight + 10) / 2 + 'px';
      });
    }
  };
}
