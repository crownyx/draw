function Shape() { }

Shape.prototype.complete = function() {
  refreshCanvas(true);
  this.draw(back().context);
}

Shape.prototype.sketch = function(context) {
  context.save();
    context.strokeStyle = "blue";
    context.lineWidth = 0.5;
    context.setLineDash([5]);
    this.draw(context);
  context.restore();
}

Object.defineProperty(Shape.prototype, 'infoText', {
  get: function() {
    return [
      this.name,
      '',
      '[a]: arc',
      '[b]: bezier curve',
      '[c]: circle',
      '[e]: ellipse',
      '[l]: line',
      '[r]: rectangle',
      '[s]: square',
      '[t]: triangle'
    ].filter(function(commandLine) {
      return commandLine.slice(0,3) != '[' + this.ownCommand + ']';
    }).concat([
      '',
      '[esc]: stop drawing',
      '',
      '[Shift]+'
    ]).concat((function(commands) {
      return Object.keys(commands).map(function(command) {
        return '[' + command + ']: ' + commands[command].info;
      });
    })(this.shiftCommands));
  }
});
