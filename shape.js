function Shape() { }

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

Shape.prototype.showPoints = function(context) {
  this.points.forEach(function(point) {
    var circle = new Circle(point, new Point(point.x + 2, point.y));
    circle.fill(context);
  });
}

Shape.prototype.draw = function(context, params = {}) {
  context.save();
    context.strokeStyle = this.strokeStyle || params.strokeStyle || context.strokeStyle;
    context.lineWidth   = this.lineWidth   || params.lineWidth   || context.lineWidth;
    context.setLineDash(this.lineDash || []);
    context.translate((this.origin || { x: 0 }).x, (this.origin || { y: 0 }).y);
    context.rotate((this.rotation || { rad: 0 }).rad);
    context.beginPath();
      this.drawPath(context);
    context.stroke();
  context.restore();
}

/*\ Shape public interface:
\*/
