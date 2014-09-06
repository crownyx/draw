function Shape() {
  this.origin = new Point(0, 0);
  this.rotation = new Angle(0);
  this.shiftCommands = [];
}

Shape.prototype.complete = function() {
  back.shapes.push(this);
  this.draw(back.context);
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
    context.layer.translate(this.origin);
    context.rotate(this.rotation.rad);
    context.beginPath();
      this.drawPath(context);
    context.stroke();
  context.restore();
}
