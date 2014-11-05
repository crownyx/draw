function Shape() {
  this.origin = new Point(0, 0);
  this.rotation = new Angle(0);
  this.shiftCommands = [];

  this.lineWidth   = 1;
  this.strokeStyle = 'black';
}

Shape.prototype.complete = function() {
  back.shapes.push(this);
  back.refresh();
}

Shape.prototype.nextStep = function() {
  this.complete();
  changeMode(commandMode);
}

Shape.prototype.sketch = function(context, params = {}) {
  context.save();
    context.strokeStyle = params.strokeStyle || "blue";
    context.setLineDash([5]);
    context.beginPath();
      this.drawPath(context);
    context.stroke();
  context.restore();
}

Shape.prototype.draw = function(context, params = {}) {
  context.save();
    if(this.translateContext) context.translate(this.translateContext.x, this.translateContext.y);
    if(this.rotateContext) context.rotate(this.rotateContext.rad);
    if(this.xScale && this.yScale) {
      context.scale(this.xScale, this.yScale);
    }
    if(this.clipShape) {
      context.beginPath();
        this.clipShape.drawPath(context);
      context.clip();
    }
    context.strokeStyle = params.strokeStyle || this.strokeStyle;
    context.lineWidth   = params.lineWidth   || this.lineWidth;
    context.setLineDash(this.lineDash || []);
    if(this.lineWidth || params.lineWidth) {
      context.beginPath();
        this.drawPath(context);
      context.stroke();
    }
    if(params.fillStyle || this.fillStyle) {
      context.fillStyle = params.fillStyle || this.fillStyle;
      context.beginPath();
        this.drawPath(context);
      context.fill();
    }
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

Shape.prototype.deleteFixedProperty = function() {
  for(var i = 0; i < arguments.length; i++) {
    if(this[arguments[i]]) {
      delete this[arguments[i]];
      infopanel.bottom.find(arguments[i]).remove();
    }
  }
}

Shape.prototype.copy = function() {
  var newShape = this._copy();
  newShape.fillStyle = this.fillStyle;
  newShape.strokeStyle = this.strokeStyle;
  newShape.lineWidth = this.lineWidth;
  if(this.clipShape) newShape.clipShape = this.clipShape.copy();
  return newShape;
}

Object.defineProperty(Shape.prototype, 'name', {
  get: function() { return this.constructor.name; },
});

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
