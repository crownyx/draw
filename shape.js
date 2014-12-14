function Shape() {
  this.rotation = new Angle(0);
  this.shiftCommands = [];
  this.intersectShapes = [];

  this.lineWidth   = 1;
  this.strokeStyle = 'black';
}

Shape.prototype.complete = function() {
  if(this.guideline) {
    front.guideShapes.push(this);
    front.refresh();
  } else {
    back.shapes.push(this);
    back.refresh();
  }
}

Shape.prototype.nextStep = function() {
  this.complete();
  changeMode(commandMode);
}

Shape.prototype.sketch = function(context, params) {
  params = params || {};
  context.save();
    context.strokeStyle = params.strokeStyle || "blue";
    context.setLineDash([5]);
    context.beginPath();
      this.drawPath(context);
    context.stroke();
  context.restore();
}

Shape.prototype.draw = function(context, params = {}) {
  if(this.guideline) {
    this.sketch(context);
  } else {
    context.save();
      if(this.lineWidth || params.lineWidth) {
        context.strokeStyle = params.strokeStyle || this.strokeStyle;
        context.lineWidth   = params.lineWidth   || this.lineWidth;
        context.setLineDash(this.lineDash || []);
        context.beginPath();
          if(this.intersectShapes.length) {
            var paths = this.intersectShapes.filterMap(function(shape) {
              return this.intersection(shape, { inclusive: false });
            }, this).flatten();
            paths.eachDo('drawPath', context);
          } else {
            this.drawPath(context);
          }
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

Shape.prototype.translate = function(pointOrX, yOrParams) {
  var point = pointOrX;
  var params;
  if(typeof pointOrX == 'number' && typeof yOrParams == 'number') {
    point = new Point(pointOrX, yOrParams);
  } else if(typeof yOrParams == 'object') {
    params = yOrParams;
  }
  this._translate(point, params);
  //if(this.clipShape) this.clipShape._translate(point.minus(point.minus(this.clipShape.center)), params);
  return this;
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
  Object.keys(this).forEach(function(key) {
    if(this[key] instanceof Array) {
      newShape[key] = this[key].map(function(element) {
        return element.copy ? element.copy() : element;
      });
    } else {
      newShape[key] = this[key].copy ? this[key].copy() : this[key];
    }
  }, this);
  return newShape;
}

Shape.prototype.reflect = function(line) {
  var reflected = this._reflect(line);
  if(this.clipShape) reflected.clipShape = this.clipShape.reflect(line);
  return reflected;
}

Object.defineProperty(Shape.prototype, 'name', {
  get: function() { return this.constructor.name; },
});

Shape.prototype.intersection = function(otherShape, params = { inclusive: false }) {
  var intersections = this.intersections(otherShape);
  var intersection;
  if(intersections.length <= 1 || (intersections.length === 2 && intersections[0].same(intersections[1]))) {
    var centerToCenter = this.center.to(otherShape.center);
    if(!centerToCenter.intersections(otherShape).length && this.area < otherShape.area)
      intersection = [this];
  } else {
    intersection = this._intersection(otherShape);
  }
  return intersection;
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
