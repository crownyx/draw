function Shape() {
  this.origin = new Point(0, 0);
  this.rotation = new Angle(0);
  this.shiftCommands = [];
}

Shape.prototype.complete = function() {
  back.shapes.push(this);
  this.draw(back.context);
}

Shape.prototype.nextStep = function() {
  this.complete();
  changeMode(commandMode);
}

Shape.prototype.sketch = function(context) {
  context.save();
    context.strokeStyle = "blue";
    context.lineWidth = 0.5;
    context.setLineDash([5]);
    context.beginPath();
      this.drawPath(context);
    context.stroke();
  context.restore();
}

Shape.prototype.draw = function(context, params = {}) {
  context.save();
    context.strokeStyle = params.strokeStyle || this.strokeStyle || context.strokeStyle;
    context.lineWidth   = params.lineWidth   || this.lineWidth   || context.lineWidth;
    context.setLineDash(this.lineDash || []);
    context.beginPath();
      this.drawPath(context);
    context.stroke();
  context.restore();
}

Shape.prototype.fill = function(context, params = {}) {
  context.save();
    context.fillStyle = params.fillStyle || this.fillStyle || context.fillStyle;
    context.beginPath();
      this.drawPath(context);
    context.fill();
  context.restore();
}

Shape.prototype.preview = function() { this.draw(front.context); }

Shape.prototype.rotate = function(rotation) { this.rotation = rotation; }

Shape.prototype.translate = function(point) {
  this.origin = point;
  this.lines.forEach(function(line) { line.translate(point); });
}

Shape.prototype.copy = function() {
  var copy = this._copy();
  copy.rotation = this.rotation;
  return copy;
}

// Shape public interface:
//   .shiftCommands: array of objects: { key: ..., forWhat: ..., subtext: ..., callback: ... }
//   .infoText     : returns text to display in upper lefthand corner
//   .origin       : context is translated here before drawing
//   .rotation     : context is rotated by #.rotation.rad before drawing
//   .points       : returns object, eg { center: ..., topLeft: ... }
//   .lines        : array of lines associated with shape
//   .center       : point used to initiate translating in edit mode
//   .setEnd       : function (takes point) to resize shape as mouse moves
//   .drawPath     : specific commands for drawing, go between context.beginPath() and context.stroke()
//                   must also work for context.fill()
//   .preview      : set of instructions for when designing shape, eg showing angles, guidelines
//   .copy         : returns copy of self
//   .translate    : moves #.origin; must also translate own lines
//   .rotate       : changes #.rotation
