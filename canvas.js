function Canvas(canvas) {
  this.canvas = typeof canvas === "string" ? document.getElementById(canvas) : canvas;
  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.context = this.canvas.getContext('2d');
  this.clear = function() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  var canvas = this;
}

Canvas.prototype.saved = function(callback, settings) {
  settings = (settings || {});
  var settingsKeys = Object.keys(settings);
  this.context.save();
    for(var i = 0; i < settingsKeys.length; i++) {
      this.context[settingsKeys[i]] = settings[settingsKeys[i]];
    }
    callback.call(this);
  this.context.restore();
}

Canvas.prototype.fillText = function(text, x, y, font, align, params) {
  this.context.save();
    if(params) {
      var ctx = this.context;
      $.each(params, function(prop, val) {
        ctx[prop] = val;
      });
    }
    this.context.textAlign = (align || this.context.textAlign);
    this.context.font = (font || this.context.font);
    this.context.fillText(text, x, y);
  this.context.restore();
}

Canvas.prototype.leftText = function(text, x, y, font) {
  this.fillText(text, x, y, font, 'left');
}

Canvas.prototype.rightText = function(text, x, y, font) {
  this.fillText(text, x, y, font, 'right');
}

Canvas.prototype.textWidth = function(text, font) {
  this.context.save();
    this.context.font = font;
    var width = this.context.measureText(text).width;
  this.context.restore();
  return width;
}

Canvas.prototype.fillRect = function(x, y, width, height, fillStyle) {
  this.context.save();
    this.context.fillStyle = (fillStyle || this.context.fillStyle);
    this.context.fillRect(x, y, width, height);
  this.context.restore();
}

// function Canvas(id) {
//   this.id = id;
// }
// 
// Object.defineProperty(Canvas.prototype, 'canvas', {
//   get: function() { return document.getElementById(this.id); }
// });
// 
// Object.defineProperty(Canvas.prototype, 'context', {
//   get: function() {
//     var ctx = this.canvas.getContext('2d');
//     ctx.layer = this;
//     return ctx;
//   }
// });
// 
// Canvas.prototype.resize = function() {
//   this.canvas.width   = window.innerWidth  - 202;
//   this.canvas.height  = window.innerHeight - 10;
// }
// 
// Canvas.prototype.clear = function() {
//   this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
// };
// 
// Canvas.prototype.save = function() { this.context.save(); }
// Canvas.prototype.restore = function() { this.context.restore(); }
// 
// Canvas.prototype.translate = function(point) {
//   this.origin = point;
//   this.context.translate(point.x, point.y);
// }
// 
// var front  = new Canvas('frontlayer');
// var middle = new Canvas('drawlayer');
// var back   = new Canvas('backlayer');
// 
// ///////////
// // front //
// ///////////
// 
// front.guideShapes = [];
// front.showGuideShapes = true;
// 
// Object.defineProperty(front, 'usePoint', {
//   get: function() {
//     return this.setPoint || this.pickedPoint || this.lastPoint;
//   }
// });
// 
// front.showPos = function(e) {
//   var currPoint = e ? Point.from(e) : this.lastPoint;
//   var angle = Angle.from(this.startPoint, currPoint);
//   var textAlignment = this.textAlignments[angle.quadrant - 1];
//   this.context.save();
//     this.context.textAlign = textAlignment.textAlign;
//     this.context.fillText(
//       "x: "   + currPoint.x +
//       ", y: " + currPoint.y,
//       currPoint.x + textAlignment.xPlus,
//       currPoint.y + textAlignment.yPlus
//     );
//   this.context.restore();
// };
// 
// front.showAxes = function() {
//   new AxisPair(this.lastPoint).draw(this.context, { lineWidth: 0.5 });
// }
// 
// front.redraw = function() {
//   this.clear();
//   this.showPos();
//   this.showAxes();
// 
//   if(this.guideShapes.length && this.showGuideShapes) {
//     this.guideShapes.eachDo('draw', this.context);
//   }
// 
//   if(this.setPoint) {
//     this.showPos(this.setPoint);
//     new AxisPair(this.setPoint).sketch(this.context, { strokeStyle: 'rgb(160,160,100)' });
//   }
// }
// 
// front.refresh = function() {
//   this.redraw();
// 
//   this.eventListeners.clear();
// 
//   infopanel.top.clear();
//   infopanel.buttons.clear();
//   infopanel.bottom.clear();
// }
// 
// front.textAlignments = [
//   { xPlus: 15,  yPlus: 20,  textAlign: 'left' },
//   { xPlus: -15, yPlus: 20,  textAlign: 'right'},
//   { xPlus: -15, yPlus: -15, textAlign: 'right'},
//   { xPlus: 15,  yPlus: -15, textAlign: 'left' }
// ]
// 
// Object.defineProperty(front, 'infodiv', {
//   get: function() {
//     return document.getElementById('infodiv');
//   }
// });
// 
// Object.defineProperty(front, 'boundingRect', {
//   get: function() {
//     return new Rectangle(new Point(0, 0), new Point(this.canvas.width, this.canvas.height));
//   }
// });
// 
// //////////
// // back //
// //////////
// 
// back.shapes = [];
// 
// back.redraw = function() {
//   this.clear();
//   this.shapes.eachDo('draw', this.context);
// }
// 
// back.refresh = back.redraw;
// 
// ////////////
// // middle //
// ////////////
// 
// middle.showText = true;
// middle.showPoints = false;
// 
// middle.refresh = function() {
//   delete this.shape;
//   delete this.group;
// 
//   this.redraw();
// }
// 
// middle.redraw = function() {
//   this.clear();
//   if(shape = this.shape) shape.preview();
//   if(group = this.group)
//     group.preview ? group.preview() : group.draw(this.context);
// }
