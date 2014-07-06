function Shape() { }

Shape.prototype.complete = function() {
  front.refresh(true);
  this.draw(back.context);
}

Shape.prototype.sketch = function(context) {
  context.save();
    context.strokeStyle = "blue";
    context.lineWidth = 0.5;
    context.setLineDash([5]);
    this.draw(context);
  context.restore();
}
