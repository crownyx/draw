var front, back;

window.addEventListener('load', function() {
  front = new Canvas('frontlayer');
  back  = new Canvas('backlayer');

  front.canvas.width  = this.innerWidth  - 202;
  front.canvas.height = this.innerHeight - 40;
  back.canvas.width   = this.innerWidth  - 202;
  back.canvas.height  = this.innerHeight - 40;

  document.getElementById('infopanel').style.width  = this.innerWidth - front.canvas.width - 42 + 'px';
  document.getElementById('infopanel').style.height = this.innerHeight - 40 + 'px';

  this.eventListeners = new EventListenerCollection(this);

  init();
}, false);

function init() {
  front.infodiv = document.getElementById('infodiv');

  front.startDrawing = function(e) {
    front.refresh();

    front.startPoint = getPoint(e);
    designLine(front.startPoint, front.startPoint);

    window.eventListeners.add('keydown', 'drawCommands', window.drawCommands);
  }

  window.drawCommands = function(e) {
    if(!e.shiftKey) {
      switch(e.which){
        case charCodes['esc']:
          this.eventListeners.clear();
          front.refresh(true);
        break;
        case charCodes['c']:
          front.refresh();
          this.eventListeners.add('keydown', 'drawCommands', window.drawCommands);
          designCir(front.startPoint, front.lastPoint);
        break;
        case charCodes['e']:
          front.refresh();
          this.eventListeners.add('keydown', 'drawCommands', window.drawCommands);
          designEllipse(front.startPoint, front.lastPoint);
        break;
        case charCodes['l']:
          front.refresh();
          this.eventListeners.add('keydown', 'drawCommands', window.drawCommands);
          designLine(front.startPoint, front.lastPoint);
        break;
        case charCodes['r']:
          front.refresh();
          this.eventListeners.add('keydown', 'drawCommands', window.drawCommands);
          designRect(front.startPoint, front.lastPoint);
        break;
      }
    }
  }

  front.refresh = function(restart) {
    this.clear();
    this.eventListeners.clear();
    window.eventListeners.clear();
    this.shapes = [];
    this.showAxes();

    if(restart) {
      this.eventListeners.add('click', 'startDrawing', this.startDrawing.bind(this));
      this.eventListeners.add('mousemove', 'showPos', this.showPos.bind(this));
      this.showPos();
      document.getElementById('infopanel').replaceChild(
        this.infodiv,
        document.getElementById('infodiv')
      );
    }
  }

  front.showAxes = function() {
    this.context.lineWidth = 0.5;
      new AxisPair(this.lastPoint).draw(this.context);
    this.context.lineWidth = 1;
  }

  front.showPos = function() {
    this.context.fillText(
      "x: " + this.lastPoint.x +
      ", y: " + this.lastPoint.y,
      this.lastPoint.x + 10,
      this.lastPoint.y - 10
    );
  };

  front.canvas.addEventListener('mousemove', function(e) {
    front.lastPoint = getPoint(e);
  }, false);

  front.eventListeners.add('click', 'startDrawing', front.startDrawing);

  front.canvas.addEventListener('mousemove', function() { front.clear(); }, false);
  front.canvas.addEventListener('mousemove', function() { front.showAxes(); }, false);

  front.eventListeners.add('mousemove', 'showPos', front.showPos.bind(front));
}
