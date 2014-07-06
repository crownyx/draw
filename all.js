function Arc(radiusStart, radiusLength, startAngle, endAngle) {
return {
center: radiusStart,
startAngle: startAngle,
endAngle: endAngle,
draw: function(context) {
context.beginPath();
context.arc(this.center.x, this.center.y, radiusLength, this.startAngle.rad, this.endAngle.rad, false);
context.stroke();
},
sketch: function(context) {
context.save();
context.strokeStyle = "blue";
context.lineWidth = 0.5;
context.setLineDash([5]);
this.draw(context);
context.restore();
}
};
}
function EventListenerCollection(receiver) {
return {
added: [],
add: function(eventType, callbackName, callback) {
receiver.addEventListener(eventType, callback, false);
this.added.push({ eventType: eventType, callbackName: callbackName, callback: callback });
},
remove: function(callbackName) {
var index = this.added.findIndex(function(cb) { return cb.callbackName == callbackName; });
var cb = this.added[index];
receiver.removeEventListener(cb.eventType, cb.callback, false);
this.added.splice(index, 1);
return cb;
},
clear: function() {
var had = this.added;
this.added.forEach(function(eventListener) {
receiver.removeEventListener(eventListener.eventType, eventListener.callback, false);
});
this.added = [];
return had;
}
};
}
function Canvas(id) {
var _canvas = document.getElementById(id);
this.canvas = _canvas;
this.context = _canvas.getContext('2d');
this.clear = function() {
this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
this.eventListeners = new EventListenerCollection(_canvas)
}
var charCodes = {
backspace: 8,
tab: 9,
enter: 13,
shift: 16,
ctrl: 17,
alt: 18,
pause: 19,
caps_lock: 20,
esc: 27,
page_up: 33,
page_down: 34,
end: 35,
home: 36,
left_arrow: 37,
up_arrow: 38,
right_arrow: 39,
down_arrow:	40,
insert: 45,
delete: 46,
zero: 48,
one: 49,
two: 50,
three: 51,
four: 52,
five: 53,
six: 54,
seven: 55,
eignt: 56,
nine: 57,
a: 65,
b: 66,
c: 67,
d: 68,
e: 69,
f: 70,
g: 71,
h: 72,
i: 73,
j: 74,
k: 75,
l: 76,
m: 77,
n: 78,
o: 79,
p: 80,
q: 81,
r: 82,
s: 83,
t: 84,
u: 85,
v: 86,
w: 87,
x: 88,
y: 89,
z: 90,
left_window_key: 91,
right_window_key: 92,
select_key: 93,
numpad_0: 96,
numpad_1: 97,
numpad_2: 98,
numpad_3: 99,
numpad_4: 100,
numpad_5: 101,
numpad_6: 102,
numpad_7: 103,
numpad_8: 104,
numpad_9: 105,
multiply: 106,
add: 107,
subtract: 109,
decimal_point: 110,
divide: 111,
f1: 112,
f2: 113,
f3: 114,
f4: 115,
f5: 116,
f6: 117,
f7: 118,
f8: 119,
f9: 120,
f10: 121,
f11: 122,
f12: 123,
num_lock: 144,
scroll_lock: 145,
semi_colon: 186,
equal_sign: 187,
comma: 188,
dash: 189,
period: 190,
forward_slash: 191,
grave_accent: 192,
open_bracket: 219,
back_slash: 220,
close_braket: 221,
single_quote: 222
}
function designCir(radStart, radEnd) {
var circle = new Circle(radStart, radEnd);
var startAxis = new AxisPair(radStart);
showCircle();
showInfo();
displayHelpText('circle', 'c', [
'[R]: set radius length'
]);
function showCircle() {
circle.draw(front.context);
startAxis.sketch(front.context);
}
function showInfo() {
new AxisPair(circle.center).sketch(front.context);
circle.radius.sketch(front.context);
var text = 'center x: ' + circle.center.x + ', y: ' + circle.center.y + ', radius length: ' + circle.radius.length.toFixed(2);
showText(text, front.lastPoint, getAngle(radStart, front.lastPoint), front.context);
}
front.eventListeners.add('mousemove', 'setEnd', function() {
circle.radius.setEnd(front.lastPoint);
});
front.eventListeners.add('mousemove', 'showCircle', showCircle);
front.eventListeners.add('mousemove', 'showInfo', showInfo);
front.eventListeners.add('click', 'saveCir', function() { circle.complete(); });
window.eventListeners.add('keydown', 'circleCommands', function(e) {
if(e.shiftKey) {
switch(e.which) {
case charCodes['r']:
getInput('enter radius length: ', function(input) {
circle.radius.fixedLength = parseInt(input);
circle.radius.setEnd(front.lastPoint);
front.clear();
front.showAxes();
showCircle();
showInfo();
});
break;
}
}
});
}
/////////////
// Circle: //
/////////////
function Circle(radStart, radEnd) {
Shape.call(this);
this.center = radStart;
this.radius = new Line(radStart, radEnd);
}
Circle.prototype = new Shape;
Circle.prototype.constructor = Circle;
Circle.prototype.draw = function(context) {
context.beginPath();
context.arc(this.center.x, this.center.y, this.radius.length, 0, 2 * Math.PI);
context.stroke();
}
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
function designEllipse(radStart, radEnd) {
var ellipse = new Ellipse(radStart, radEnd);
var startAxis = new AxisPair(radStart);
var arcAngle = new Arc(radStart, 15, new Angle(0), ellipse.rotation);
showEllipse();
showInfo();
function showEllipse() {
ellipse.draw(front.context);
startAxis.sketch(front.context);
arcAngle.endAngle = ellipse.rotation;
arcAngle.sketch(front.context);
}
function showInfo() {
var text = 'center x: ' + ellipse.center.x +
', y: ' + ellipse.center.y +
', semimajor axis length: ' + ellipse.semiMajor.length.toFixed(2) +
', semiminor axis length: ' + ellipse.semiMinor.length.toFixed(2);
showText(text, front.lastPoint, getAngle(radStart, front.lastPoint), front.context);
front.context.save();
front.context.translate(ellipse.center.x, ellipse.center.y);
front.context.rotate(ellipse.rotation.rad);
new Line({ x: 0, y: 0 }, { x: ellipse.xAxis.length, y: 0 }).sketch(front.context);
new Line({ x: 0, y: 0 }, { x: 0, y: -ellipse.yAxis.length }).sketch(front.context);
front.context.restore();
var text = ellipse.rotation.deg.toFixed(2) + unescape("%B0");
showText(text, radStart, new Angle(getAngle(radStart, front.lastPoint).rad + Math.PI), front.context);
}
front.eventListeners.add('mousemove', 'showEllipse', showEllipse);
front.eventListeners.add('mousemove', 'showInfo', showInfo);
front.eventListeners.add('mousemove', 'setRadiiEnds', function() {
ellipse.xAxis.end.x = front.lastPoint.x;
ellipse.yAxis.end.y = front.lastPoint.y
});
front.eventListeners.add('click', 'setEllipseRotation', function() {
front.eventListeners.remove('setEllipseRotation');
front.eventListeners.remove('setRadiiEnds');
var origRot = new Line(radStart, front.lastPoint).angle;
front.eventListeners.add('mousemove', 'rotateEllipse', function() {
var currAngle = getAngle(radStart, front.lastPoint);
ellipse.rotation = new Angle(currAngle.rad - origRot.rad);
});
front.eventListeners.add('click', 'complete', function() { ellipse.complete() });
});
}
//////////////
// Ellipse: //
//////////////
function Ellipse(radStart, radEnd) {
Shape.call(this);
this.center = radStart;
this.xAxis = new Line(radStart, { x: radEnd.x, y: radStart.y });
this.yAxis = new Line(radStart, { x: radStart.x, y: radEnd.y });
this.rotation = new Angle(0);
}
Ellipse.prototype = new Shape;
Ellipse.prototype.constructor = Ellipse;
Object.defineProperty(Ellipse.prototype, 'semiMajor', {
get: function() {
return this.yAxis.length >= this.xAxis.length ? this.yAxis : this.xAxis;
}
});
Object.defineProperty(Ellipse.prototype, 'semiMinor', {
get: function() {
return this.yAxis.length >= this.xAxis.length ? this.xAxis : this.yAxis;
}
});
Ellipse.prototype.draw = function(context) {
context.beginPath();
context.save();
context.translate(this.center.x, this.center.y);
context.rotate(this.rotation.rad);
context.scale(this.xAxis.length / this.semiMinor.length, this.yAxis.length / this.semiMinor.length);
context.arc(0, 0, this.semiMinor.length, 0, 2 * Math.PI);
context.restore();
context.stroke();
}
function Point(x, y) {
this.x = x;
this.y = y;
this.toString = function() {
return "(x: " + this.x + ", y: " + this.y + ")";
}
}
function getPoint(point) {
return (new Point (
point.pageX - front.canvas.offsetLeft,
point.pageY - front.canvas.offsetTop
));
}
function getAngle(lineStart, lineEnd) {
var adjacent = new Line({ x: 0, y: 0 }, { x: lineEnd.x - lineStart.x, y: 0 }).length;
var hypotenuse = new Line(lineStart, lineEnd).length;
var rotation = (function() {
var refAngle = Math.acos(adjacent / hypotenuse);
switch(getQuadrant(lineStart, lineEnd)) {
case 1: return refAngle;               break;
case 2: return Math.PI - refAngle;     break;
case 3: return Math.PI + refAngle;     break;
case 4: return 2 * Math.PI - refAngle; break;
}
})();
return new Angle(rotation);
}
function getQuadrant(lineStart, lineEnd) {
if(lineEnd.x >= lineStart.x && lineEnd.y > lineStart.y) {
return 1;
} else if(lineEnd.x < lineStart.x && lineEnd.y >= lineStart.y) {
return 2;
} else if(lineEnd.x <= lineStart.x && lineEnd.y < lineStart.y) {
return 3;
} else {
return 4;
}
}
function Angle(rad) {
var _rad = ((rad || 0) + 2 * Math.PI) % (2 * Math.PI);
return {
rad: _rad,
deg: (_rad / Math.PI * 180),
quadrant: Math.ceil(_rad / (0.5 * Math.PI)) || 4
};
}
function designLine(startPoint, endPoint) {
var line = new Line(startPoint, endPoint);
var startAxis = new AxisPair(line.start);
var arcAngle  = new Arc(line.start, 15, new Angle(0), line.angle);
showLine();
showInfo();
displayHelpText('line', 'l', [
'[L]: set length',
'[R]: set rotation'
]);
function showLine() {
line.draw(front.context);
startAxis.sketch(front.context);
arcAngle.endAngle = line.angle;
arcAngle.sketch(front.context);
}
function showInfo() {
var text = 'x: '        + line.start.x.toFixed(2) +
', y: '      + line.start.y.toFixed(2) +
' to x: '    + line.end.x.toFixed(2)   +
', y: '      + line.end.y.toFixed(2)   +
', length: ' + line.length.toFixed(2);
showText(text, front.lastPoint, getAngle(line.start, front.lastPoint), front.context);
var text = line.angle.deg.toFixed(2) + unescape("%B0");
showText(text, line.start, new Angle(line.angle.rad + Math.PI), front.context);
}
front.eventListeners.add('mousemove', 'setEnd', function() {
line.setEnd(front.lastPoint);
});
front.eventListeners.add('mousemove', 'showLine', showLine);
front.eventListeners.add('mousemove', 'showInfo', showInfo);
front.eventListeners.add('click', 'saveLine', function() { line.complete() });
window.eventListeners.add('keydown', 'lineCommands', function(e) {
if(e.shiftKey) {
switch(e.which) {
case charCodes['l']:
getInput('enter length: ', function(input) {
line.fixedLength = parseInt(input);
line.setEnd(front.lastPoint);
front.clear();
front.showAxes();
showLine();
showInfo();
});
break;
case charCodes['r']:
getInput({ main: 'enter rotation: ', subtext: '(in degrees)' }, function(input) {
line.fixedRotation = new Angle(parseInt(input) / 180 * Math.PI);
line.setEnd(front.lastPoint);
front.clear();
front.showAxes();
showLine();
showInfo();
});
break;
}
}
});
}
///////////
// Line: //
///////////
function Line(start, end) {
Shape.call(this);
this.start = start;
this.end   = end;
}
Line.prototype = new Shape;
Line.prototype.constructor = Line;
Line.prototype.setEnd = function(point) {
if(this.fixedLength || this.fixedRotation) {
var rotation = this.fixedRotation || new Line(this.start, point).angle;
var length   = this.fixedLength || new Line(this.start, point).length;
this.end = new Point(
this.start.x + Math.cos(rotation.rad) * length,
this.start.y + Math.sin(rotation.rad) * length
);
} else {
this.end = point;
}
}
Object.defineProperty(Line.prototype, 'length', {
get: function() {
return Math.sqrt(Math.pow(this.end.x - this.start.x, 2) + Math.pow(this.end.y - this.start.y, 2));
}
});
Object.defineProperty(Line.prototype, 'angle', {
get: function() { return getAngle(this.start, this.end); },
});
Line.prototype.draw = function(context) {
context.beginPath();
context.moveTo(this.start.x, this.start.y);
context.lineTo(this.end.x, this.end.y);
context.stroke();
}
////////////////////
// Special Lines: //
////////////////////
function VerticalLine(x) {
return new Line({ x: x, y: 0 }, { x: x, y: front.canvas.height });
}
function HorizontalLine(y) {
return new Line({ x: 0, y: y }, { x: front.canvas.width, y: y });
}
function AxisPair(origin) {
return {
vertical: new Line({ x: origin.x, y: 0 }, { x: origin.x, y: front.canvas.height }),
horizontal: new Line({ x: 0, y: origin.y }, { x: front.canvas.width, y: origin.y }),
draw: function(context) {
this.vertical.draw(context);
this.horizontal.draw(context);
},
sketch: function(context) {
this.vertical.sketch(context);
this.horizontal.sketch(context);
}
}
}
if (!Array.prototype.findIndex) {
Object.defineProperty(Array.prototype, 'findIndex', {
enumerable: false,
configurable: true,
writable: true,
value: function(predicate) {
if (this == null) {
throw new TypeError('Array.prototype.find called on null or undefined');
}
if (typeof predicate !== 'function') {
throw new TypeError('predicate must be a function');
}
var list = Object(this);
var length = list.length >>> 0;
var thisArg = arguments[1];
var value;
for (var i = 0; i < length; i++) {
if (i in list) {
value = list[i];
if (predicate.call(thisArg, value, i, list)) {
return i;
}
}
}
return -1;
}
});
}
function designRect(diagStart, diagEnd) {
displayHelpText('rectangle', 'r', [
'[H]: set height',
'[L]: set length',
'[R]: set rotation'
]);
function refAngle() { return (rect.diagonal.angle.quadrant - 1) / 2 * Math.PI; }
var rect = new Rectangle(diagStart, diagEnd);
var startAxis = new AxisPair(rect.diagonal.start);
var arcAngle = new Arc(rect.diagonal.start, 15, new Angle(refAngle()), new Angle(refAngle() + rect.rotation.rad));
showRect();
showInfo();
function showRect() {
rect.draw(front.context);
startAxis.sketch(front.context);
arcAngle.startAngle = new Angle(refAngle());
arcAngle.endAngle = new Angle(refAngle() + rect.rotation.rad);
arcAngle.sketch(front.context);
}
function showInfo() {
var text = 'length: ' + rect.length + ', height: ' + rect.height;
showText(text, front.lastPoint, getAngle(rect.diagonal.start, front.lastPoint), front.context);
var text = rect.rotation.deg.toFixed(2) + unescape("%B0")
showText(text, rect.diagonal.start, new Angle(rect.rotation.rad + Math.PI), front.context);
}
front.eventListeners.add('mousemove', 'setEnd', function() {
rect.setEnd(front.lastPoint);
});
front.eventListeners.add('mousemove', 'showRect', showRect);
front.eventListeners.add('mousemove', 'showInfo', showInfo);
front.eventListeners.add('click', 'setRectRot', function(e) {
if(rect.fixedRotation) rect.complete();
front.eventListeners.remove('setEnd');
front.eventListeners.remove('setRectRot');
rect.fixedLength = rect.length;
rect.fixedHeight = rect.height;
rect.inRotation = true;
front.eventListeners.add('mousemove', 'setRot', function() {
var angle = getAngle(rect.diagonal.start, front.lastPoint);
rect.rotation = new Angle(angle.rad - rect.diagonal.angle.rad);
});
front.eventListeners.add('click', 'saveRect', rect.complete.bind(rect));
});
window.eventListeners.add('keydown', 'rectCommands', function(e) {
if(e.shiftKey) {
var cleanUp = function() {
rect.setEnd(front.lastPoint);
front.clear();
front.showAxes();
showRect();
showInfo();
};
switch(e.which) {
case charCodes['l']:
getInput('enter length: ', function(input) {
rect.fixedLength = parseInt(input);
cleanUp();
});
break;
case charCodes['h']:
getInput('enter height: ', function(input) {
rect.fixedHeight = parseInt(input);
cleanUp();
});
break;
case charCodes['r']:
getInput({ main: 'enter rotation: ', subtext: '(in degrees)' }, function(input) {
rect.fixedRotation = new Angle(parseInt(input) / 180 * Math.PI);
cleanUp();
});
break;
}
}
});
}
////////////////
// Rectangle: //
////////////////
function Rectangle(diagStart, diagEnd) {
Shape.call(this);
this.diagonal = new Line(diagStart, diagEnd);
this._rotation = new Angle(0);
}
Rectangle.prototype = new Shape;
Rectangle.prototype.constructor = Rectangle;
Object.defineProperty(Rectangle.prototype, 'length', {
get: function() {
return this.fixedLength || Math.abs(this.diagonal.end.x - this.diagonal.start.x);
}
});
Object.defineProperty(Rectangle.prototype, 'height', {
get: function() {
return this.fixedHeight || Math.abs(this.diagonal.end.y - this.diagonal.start.y);
}
});
Object.defineProperty(Rectangle.prototype, 'rotation', {
get: function() {
return this.fixedRotation || this._rotation;
},
set: function(angle) {
this._rotation = angle;
}
});
Rectangle.prototype.setEnd = function(point) {
var quad = (this.inRotation ? this.diagonal.angle : getAngle(this.diagonal.start, point)).quadrant;
var x = this.fixedLength ?
this.diagonal.start.x + (quad == 2 || quad == 3 ? -1 : 1) * this.length :
point.x;
var y = this.fixedHeight ?
this.diagonal.start.y + (quad == 3 || quad == 4 ? -1 : 1) * this.height :
point.y;
this.diagonal.setEnd(new Point(x, y));
}
Rectangle.prototype.draw = function(context) {
var width  = this.diagonal.end.x - this.diagonal.start.x,
height = this.diagonal.end.y - this.diagonal.start.y;
context.save();
context.translate(this.diagonal.start.x, this.diagonal.start.y);
context.rotate((this.fixedRotation || this.rotation).rad);
context.strokeRect(0, 0, width, height);
context.restore();
}
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
function showText(text, point, angle, context) {
context.save();
switch(angle.quadrant) {
case 1:
context.fillText(text, point.x + 15, point.y + 20);
break;
case 2:
context.textAlign = "right";
context.fillText(text, point.x - 15, point.y + 20);
break;
case 3:
context.textAlign = "right";
context.fillText(text, point.x - 15, point.y - 15);
break;
case 4:
context.fillText(text, point.x + 15, point.y - 15);
break;
}
context.restore();
}
function Text(text, point) {
return {
text: text,
point: point,
textAlign: front.context.textAlign,
background: null,
fontColor: front.context.fillStyle,
draw: function(context) {
context.save();
context.textAlign = this.textAlign;
if(this.background) {
context.fillStyle = this.background;
context.fillRect(this.point.x, this.point.y - 10, context.measureText(text).width, 20);
}
context.fillStyle = this.fontColor;
context.fillText(this.text, this.point.x, this.point.y);
context.restore();
}
};
}
function getInput(promptText, propToFill) {
var mainText = promptText.main || promptText;
var textToAdd = [{ className: 'center', text: mainText, id: 'inputdiv' }];
if(promptText.subtext)
textToAdd.push({ className: 'center', text: promptText.subtext });
textToAdd.push('', '[esc]: cancel');
var replacement = replaceInfoText(textToAdd);
var b = replacement.bs[0];
var prevCommands = window.eventListeners.clear();
window.eventListeners.add('keydown', 'getInput', function(e) {
if(e.which >= charCodes.zero && e.which <= charCodes.nine) {
b.textContent += (e.which - charCodes.zero);
} else if(e.which == charCodes.enter) {
window.eventListeners.remove('getInput');
prevCommands.forEach(function(el) {
window.eventListeners.add(el.eventType, el.callbackName, el.callback);
});
propToFill(infodiv.textContent.replace(mainText, ''));
document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
if(subdiv) document.getElementById('infopanel').removeChild(subdiv);
} else if(e.which == charCodes['backspace']) {
b.textContent = infodiv.textContent.slice(0, -1);
} else if(e.which == charCodes['esc']) {
window.eventListeners.remove('getInput');
prevCommands.forEach(function(el) {
window.eventListeners.add(el.eventType, el.callbackName, el.callback);
});
document.getElementById('infopanel').replaceChild(replacement.olddiv, replacement.newdiv);
if(subdiv) document.getElementById('infopanel').removeChild(subdiv);
}
});
}
function replaceInfoText(infoText) {
var infodiv = document.getElementById('infodiv');
var newdiv = document.createElement('div');
newdiv.id = 'infodiv';
var bs = infoText.map(function(text) {
var b = document.createElement('b');
if(text.id) b.id = text.id;
if(text.className) b.className = text.className;
var text = text.text || text || '<br/>';
b.innerHTML = text;
newdiv.appendChild(b);
return b;
});
document.getElementById('infopanel').replaceChild(newdiv, infodiv);
return { olddiv: infodiv, newdiv: newdiv, bs: bs };
}
function displayHelpText(shapeName, ownCommand, shiftCommands) {
var shapeCommands = [
'drawing ' + shapeName,
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
return commandLine.slice(0,3) != '[' + ownCommand + ']';
});
var allText = shapeCommands.concat([
'',
'[esc]: stop drawing',
'',
'Shift+'
]).concat(shiftCommands);
replaceInfoText(allText);
}
