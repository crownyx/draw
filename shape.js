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

/*\ Shape public interface:
|*| name          : eg 'LINE'
|*| ownCommand    : eg 'l'
|*| setEnd(point) :
|*| arcAngle      : optional. use Object.defineProperty, have it return an arc
|*| showText      : text at endpoint. use Object.defineProperty
|*| nextStep      : must eventually resolve to Shape.prototype.complete()
|*| draw(context)
|*|
|*| shiftCommands : eg { 'L': { ... see below ... }, 'A': { ... see below ... } }
|*|    name       : used for window.eventListeners.add('keydown', name ...
|*|    info       : used in shapes help text
|*|    promptText : used in getInput mode
|*|    setProp    : function
\*/
