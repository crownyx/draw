function Arc(t,e,n,i){return{center:t,startAngle:n,endAngle:i,draw:function(t){t.beginPath(),t.arc(this.center.x,this.center.y,e,this.startAngle.rad,this.endAngle.rad,!1),t.stroke()},sketch:function(t){t.save(),t.strokeStyle="blue",t.lineWidth=.5,t.setLineDash([5]),this.draw(t),t.restore()}}}function EventListenerCollection(t){return{added:[],add:function(e,n,i){t.addEventListener(e,i,!1),this.added.push({eventType:e,callbackName:n,callback:i})},remove:function(e){var n=this.added.findIndex(function(t){return t.callbackName==e}),i=this.added[n]
return t.removeEventListener(i.eventType,i.callback,!1),this.added.splice(n,1),i},clear:function(){var e=this.added
return this.added.forEach(function(e){t.removeEventListener(e.eventType,e.callback,!1)}),this.added=[],e}}}function Canvas(t){var e=document.getElementById(t)
this.canvas=e,this.context=e.getContext("2d"),this.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)},this.eventListeners=new EventListenerCollection(e)}function designCir(t,e){function n(e){var n=e?getPoint(e):front.lastPoint
new AxisPair(i.center).sketch(front.context),i.radius.sketch(front.context)
var o="center x: "+i.center.x+", y: "+i.center.y+", radius length: "+i.radius.length.toFixed(2)
showText(o,n,getAngle(t,n),front.context)}displayHelpText("circle","c",["[R]: set radius length"])
var i=new Circle(t,e)
i.draw(front.context),n(),front.eventListeners.add("mousemove","showCir",function(t){i.radius.end=getPoint(t),i.draw(front.context)}),front.eventListeners.add("mousemove","showInfo",n),front.eventListeners.add("click","saveCir",function(){front.stopDrawing(!0),i.draw(back.context)})}function Circle(t,e){Shape.call(this),this.center=t,this.radius=new Line(t,e)}function init(){front.infodiv=document.getElementById("infodiv"),front.startDrawing=function(t){front.refresh(),front.startPoint=getPoint(t),designLine(front.startPoint,front.startPoint),window.eventListeners.add("keydown","drawCommands",window.drawCommands)},window.drawCommands=function(t){if(!t.shiftKey)switch(t.which){case charCodes.esc:this.eventListeners.clear(),front.refresh(!0)
break
case charCodes.c:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designCir(front.startPoint,front.lastPoint)
break
case charCodes.e:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designEllipse(front.startPoint,front.lastPoint)
break
case charCodes.l:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designLine(front.startPoint,front.lastPoint)
break
case charCodes.r:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designRect(front.startPoint,front.lastPoint)}},front.refresh=function(t){this.clear(),this.eventListeners.clear(),window.eventListeners.clear(),this.shapes=[],this.showAxes(),t&&(this.eventListeners.add("click","startDrawing",this.startDrawing.bind(this)),this.eventListeners.add("mousemove","showPos",this.showPos.bind(this)),this.showPos(),document.getElementById("infopanel").replaceChild(this.infodiv,document.getElementById("infodiv")))},front.showAxes=function(){this.context.lineWidth=.5,new AxisPair(this.lastPoint).draw(this.context),this.context.lineWidth=1},front.showPos=function(){this.context.fillText("x: "+this.lastPoint.x+", y: "+this.lastPoint.y,this.lastPoint.x+10,this.lastPoint.y-10)},front.canvas.addEventListener("mousemove",function(t){front.lastPoint=getPoint(t)},!1),front.eventListeners.add("click","startDrawing",front.startDrawing),front.canvas.addEventListener("mousemove",function(){front.clear()},!1),front.canvas.addEventListener("mousemove",function(){front.showAxes()},!1),front.eventListeners.add("mousemove","showPos",front.showPos.bind(front))}function designEllipse(t,e){function n(e){var n=e?getPoint(e):front.lastPoint
new AxisPair(i.center).sketch(front.context),new Arc(i.center,15,new Angle(0),i.rotation).sketch(front.context)
var o="center x: "+i.center.x+", y: "+i.center.y+", semimajor axis length: "+i.semiMajor.length.toFixed(2)+", semiminor axis length: "+i.semiMinor.length.toFixed(2)
showText(o,n,getAngle(t,n),front.context),front.context.save(),front.context.translate(i.center.x,i.center.y),front.context.rotate(i.rotation.rad),new Line({x:0,y:0},{x:i.xAxis.length,y:0}).sketch(front.context),new Line({x:0,y:0},{x:0,y:-i.yAxis.length}).sketch(front.context),front.context.restore()
var o=i.rotation.deg.toFixed(2)+"°"
showText(o,t,new Angle(getAngle(t,n).rad+Math.PI),front.context)}var i=new Ellipse(t,e)
i.draw(front.context),front.eventListeners.add("mousemove","showInfo",n),front.eventListeners.add("mousemove","setRadiiEnds",function(t){var e=getPoint(t)
i.xAxis.end.x=e.x,i.yAxis.end.y=e.y,i.draw(front.context)}),front.eventListeners.add("click","setEllipseRotation",function(e){front.eventListeners.remove("setEllipseRotation"),front.eventListeners.remove("setRadiiEnds")
var n=new Line(t,getPoint(e)).angle
front.eventListeners.add("mousemove","rotateEllipse",function(e){var o=getAngle(t,getPoint(e))
i.rotation=new Angle(o.rad-n.rad),i.draw(front.context)}),front.eventListeners.add("click","complete",i.complete)})}function Ellipse(t,e){return Shape({center:t,xAxis:new Line(t,{x:e.x,y:t.y}),yAxis:new Line(t,{x:t.x,y:e.y}),get semiMajor(){return this.yAxis.length>=this.xAxis.length?this.yAxis:this.xAxis},get semiMinor(){return this.yAxis.length>=this.xAxis.length?this.xAxis:this.yAxis},rotation:new Angle(0),draw:function(t){t.beginPath(),t.save(),t.translate(this.center.x,this.center.y),t.rotate(this.rotation.rad),t.scale(this.xAxis.length/this.semiMinor.length,this.yAxis.length/this.semiMinor.length),t.arc(0,0,this.semiMinor.length,0,2*Math.PI),t.restore(),t.stroke()}})}function Point(t,e){this.x=t,this.y=e,this.toString=function(){return"(x: "+this.x+", y: "+this.y+")"}}function getPoint(t){return new Point(t.pageX-front.canvas.offsetLeft,t.pageY-front.canvas.offsetTop)}function getAngle(t,e){var n=new Line({x:0,y:0},{x:e.x-t.x,y:0}).length,i=new Line(t,e).length,o=function(){var o=Math.acos(n/i)
switch(getQuadrant(t,e)){case 1:return o
case 2:return Math.PI-o
case 3:return Math.PI+o
case 4:return 2*Math.PI-o}}()
return new Angle(o)}function getQuadrant(t,e){return e.x>=t.x&&e.y>t.y?1:e.x<t.x&&e.y>=t.y?2:e.x<=t.x&&e.y<t.y?3:4}function Angle(t){var e=((t||0)+2*Math.PI)%(2*Math.PI)
return{rad:e,deg:e/Math.PI*180,quadrant:Math.ceil(e/(.5*Math.PI))||4}}function designLine(t,e){function n(){o.draw(front.context),r.sketch(front.context),s.endAngle=o.angle,s.sketch(front.context)}function i(){var t="x: "+o.start.x.toFixed(2)+", y: "+o.start.y.toFixed(2)+" to x: "+o.end.x.toFixed(2)+", y: "+o.end.y.toFixed(2)+", length: "+o.length.toFixed(2)
showText(t,front.lastPoint,getAngle(o.start,front.lastPoint),front.context)
var t=o.angle.deg.toFixed(2)+"°"
showText(t,o.start,new Angle(o.angle.rad+Math.PI),front.context)}var o=new Line(t,e),r=new AxisPair(o.start),s=new Arc(o.start,15,new Angle(0),o.angle)
n(),i(),displayHelpText("line","l",["[L]: set length","[R]: set rotation"]),front.eventListeners.add("mousemove","setEnd",function(){o.setEnd(front.lastPoint)}),front.eventListeners.add("mousemove","showLine",n),front.eventListeners.add("mousemove","showInfo",i),front.eventListeners.add("click","saveLine",o.complete.bind(o)),window.eventListeners.add("keydown","lineCommands",function(t){if(t.shiftKey)switch(t.which){case charCodes.l:getInput("enter length: ",function(t){o.fixedLength=parseInt(t),o.setEnd(front.lastPoint),front.clear(),front.showAxes(),n(),i()})
break
case charCodes.r:getInput({main:"enter rotation: ",subtext:"(in degrees)"},function(t){o.fixedRotation=new Angle(parseInt(t)/180*Math.PI),o.setEnd(front.lastPoint),front.clear(),front.showAxes(),n(),i()})}})}function Line(t,e){Shape.call(this),this.start=t,this.end=e}function VerticalLine(t){return new Line({x:t,y:0},{x:t,y:front.canvas.height})}function HorizontalLine(t){return new Line({x:0,y:t},{x:front.canvas.width,y:t})}function AxisPair(t){return{vertical:new Line({x:t.x,y:0},{x:t.x,y:front.canvas.height}),horizontal:new Line({x:0,y:t.y},{x:front.canvas.width,y:t.y}),draw:function(t){this.vertical.draw(t),this.horizontal.draw(t)},sketch:function(t){this.vertical.sketch(t),this.horizontal.sketch(t)}}}function designRect(t,e){function n(){return(r.diagonal.angle.quadrant-1)/2*Math.PI}function i(){r.draw(front.context),s.sketch(front.context),a.startAngle=new Angle(n()),a.endAngle=new Angle(n()+r.rotation.rad),a.sketch(front.context)}function o(){var t="length: "+r.length+", height: "+r.height
showText(t,front.lastPoint,getAngle(r.diagonal.start,front.lastPoint),front.context)
var t=r.rotation.deg.toFixed(2)+"°"
showText(t,r.diagonal.start,new Angle(r.rotation.rad+Math.PI),front.context)}displayHelpText("rectangle","r",["[H]: set height","[L]: set length","[R]: set rotation"])
var r=new Rectangle(t,e),s=new AxisPair(r.diagonal.start),a=new Arc(r.diagonal.start,15,new Angle(n()),new Angle(n()+r.rotation.rad))
i(),o(),front.eventListeners.add("mousemove","setEnd",function(){r.setEnd(front.lastPoint)}),front.eventListeners.add("mousemove","showRect",i),front.eventListeners.add("mousemove","showInfo",o),front.eventListeners.add("click","setRectRot",function(){r.fixedRotation&&r.complete(),front.eventListeners.remove("setEnd"),front.eventListeners.remove("setRectRot"),r.fixedLength=r.length,r.fixedHeight=r.height,r.inRotation=!0,front.eventListeners.add("mousemove","setRot",function(){var t=getAngle(r.diagonal.start,front.lastPoint)
r.rotation=new Angle(t.rad-r.diagonal.angle.rad)}),front.eventListeners.add("click","saveRect",r.complete.bind(r))}),window.eventListeners.add("keydown","rectCommands",function(t){if(t.shiftKey){var e=function(){r.setEnd(front.lastPoint),front.clear(),front.showAxes(),i(),o()}
switch(t.which){case charCodes.l:getInput("enter length: ",function(t){r.fixedLength=parseInt(t),e()})
break
case charCodes.h:getInput("enter height: ",function(t){r.fixedHeight=parseInt(t),e()})
break
case charCodes.r:getInput({main:"enter rotation: ",subtext:"(in degrees)"},function(t){r.fixedRotation=new Angle(parseInt(t)/180*Math.PI),e()})}}})}function Rectangle(t,e){Shape.call(this),this.diagonal=new Line(t,e),this._rotation=new Angle(0)}function Shape(){}function showText(t,e,n,i){switch(i.save(),n.quadrant){case 1:i.fillText(t,e.x+15,e.y+20)
break
case 2:i.textAlign="right",i.fillText(t,e.x-15,e.y+20)
break
case 3:i.textAlign="right",i.fillText(t,e.x-15,e.y-15)
break
case 4:i.fillText(t,e.x+15,e.y-15)}i.restore()}function Text(t,e){return{text:t,point:e,textAlign:front.context.textAlign,background:null,fontColor:front.context.fillStyle,draw:function(e){e.save(),e.textAlign=this.textAlign,this.background&&(e.fillStyle=this.background,e.fillRect(this.point.x,this.point.y-10,e.measureText(t).width,20)),e.fillStyle=this.fontColor,e.fillText(this.text,this.point.x,this.point.y),e.restore()}}}function getInput(t,e){var n=t.main||t,i=[{className:"center",text:n,id:"inputdiv"}]
t.subtext&&i.push({className:"center",text:t.subtext}),i.push("","[esc]: cancel")
var o=replaceInfoText(i),r=o.bs[0],s=window.eventListeners.clear()
window.eventListeners.add("keydown","getInput",function(t){t.which>=charCodes.zero&&t.which<=charCodes.nine?r.textContent+=t.which-charCodes.zero:t.which==charCodes.enter?(window.eventListeners.remove("getInput"),s.forEach(function(t){window.eventListeners.add(t.eventType,t.callbackName,t.callback)}),e(infodiv.textContent.replace(n,"")),document.getElementById("infopanel").replaceChild(o.olddiv,o.newdiv),subdiv&&document.getElementById("infopanel").removeChild(subdiv)):t.which==charCodes.backspace?r.textContent=infodiv.textContent.slice(0,-1):t.which==charCodes.esc&&(window.eventListeners.remove("getInput"),s.forEach(function(t){window.eventListeners.add(t.eventType,t.callbackName,t.callback)}),document.getElementById("infopanel").replaceChild(o.olddiv,o.newdiv),subdiv&&document.getElementById("infopanel").removeChild(subdiv))})}function replaceInfoText(t){var e=document.getElementById("infodiv"),n=document.createElement("div")
n.id="infodiv"
var i=t.map(function(t){var e=document.createElement("b")
t.id&&(e.id=t.id),t.className&&(e.className=t.className)
var t=t.text||t||"<br/>"
return e.innerHTML=t,n.appendChild(e),e})
return document.getElementById("infopanel").replaceChild(n,e),{olddiv:e,newdiv:n,bs:i}}function displayHelpText(t,e,n){var i=["drawing "+t,"","[a]: arc","[b]: bezier curve","[c]: circle","[e]: ellipse","[l]: line","[r]: rectangle","[s]: square","[t]: triangle"].filter(function(t){return t.slice(0,3)!="["+e+"]"}),o=i.concat(["","[esc]: stop drawing","","Shift+"]).concat(n)
replaceInfoText(o)}function Arc(t,e,n,i){return{center:t,startAngle:n,endAngle:i,draw:function(t){t.beginPath(),t.arc(this.center.x,this.center.y,e,this.startAngle.rad,this.endAngle.rad,!1),t.stroke()},sketch:function(t){t.save(),t.strokeStyle="blue",t.lineWidth=.5,t.setLineDash([5]),this.draw(t),t.restore()}}}function EventListenerCollection(t){return{added:[],add:function(e,n,i){t.addEventListener(e,i,!1),this.added.push({eventType:e,callbackName:n,callback:i})},remove:function(e){var n=this.added.findIndex(function(t){return t.callbackName==e}),i=this.added[n]
return t.removeEventListener(i.eventType,i.callback,!1),this.added.splice(n,1),i},clear:function(){var e=this.added
return this.added.forEach(function(e){t.removeEventListener(e.eventType,e.callback,!1)}),this.added=[],e}}}function Canvas(t){var e=document.getElementById(t)
this.canvas=e,this.context=e.getContext("2d"),this.clear=function(){this.context.clearRect(0,0,this.canvas.width,this.canvas.height)},this.eventListeners=new EventListenerCollection(e)}function designCir(t,e){function n(e){var n=e?getPoint(e):front.lastPoint
new AxisPair(i.center).sketch(front.context),i.radius.sketch(front.context)
var o="center x: "+i.center.x+", y: "+i.center.y+", radius length: "+i.radius.length.toFixed(2)
showText(o,n,getAngle(t,n),front.context)}displayHelpText("circle","c",["[R]: set radius length"])
var i=new Circle(t,e)
i.draw(front.context),n(),front.eventListeners.add("mousemove","showCir",function(t){i.radius.end=getPoint(t),i.draw(front.context)}),front.eventListeners.add("mousemove","showInfo",n),front.eventListeners.add("click","saveCir",function(){front.stopDrawing(!0),i.draw(back.context)})}function Circle(t,e){Shape.call(this),this.center=t,this.radius=new Line(t,e)}function init(){front.infodiv=document.getElementById("infodiv"),front.startDrawing=function(t){front.refresh(),front.startPoint=getPoint(t),designLine(front.startPoint,front.startPoint),window.eventListeners.add("keydown","drawCommands",window.drawCommands)},window.drawCommands=function(t){if(!t.shiftKey)switch(t.which){case charCodes.esc:this.eventListeners.clear(),front.refresh(!0)
break
case charCodes.c:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designCir(front.startPoint,front.lastPoint)
break
case charCodes.e:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designEllipse(front.startPoint,front.lastPoint)
break
case charCodes.l:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designLine(front.startPoint,front.lastPoint)
break
case charCodes.r:front.refresh(),this.eventListeners.add("keydown","drawCommands",window.drawCommands),designRect(front.startPoint,front.lastPoint)}},front.refresh=function(t){this.clear(),this.eventListeners.clear(),window.eventListeners.clear(),this.shapes=[],this.showAxes(),t&&(this.eventListeners.add("click","startDrawing",this.startDrawing.bind(this)),this.eventListeners.add("mousemove","showPos",function() {front.showPos()}),this.showPos(),document.getElementById("infopanel").replaceChild(this.infodiv,document.getElementById("infodiv")))},front.showAxes=function(){this.context.lineWidth=.5,new AxisPair(this.lastPoint).draw(this.context),this.context.lineWidth=1},front.showPos=function(){front.context.fillText("x: "+front.lastPoint.x+", y: "+front.lastPoint.y,front.lastPoint.x+10,front.lastPoint.y-10)},front.canvas.addEventListener("mousemove",function(t){front.lastPoint=getPoint(t)},!1),front.eventListeners.add("click","startDrawing",front.startDrawing),front.canvas.addEventListener("mousemove",function(){front.clear()},!1),front.canvas.addEventListener("mousemove",function(){front.showAxes()},!1),front.eventListeners.add("mousemove","showPos",function(){front.showPos()})}function designEllipse(t,e){function n(e){var n=e?getPoint(e):front.lastPoint
new AxisPair(i.center).sketch(front.context),new Arc(i.center,15,new Angle(0),i.rotation).sketch(front.context)
var o="center x: "+i.center.x+", y: "+i.center.y+", semimajor axis length: "+i.semiMajor.length.toFixed(2)+", semiminor axis length: "+i.semiMinor.length.toFixed(2)
showText(o,n,getAngle(t,n),front.context),front.context.save(),front.context.translate(i.center.x,i.center.y),front.context.rotate(i.rotation.rad),new Line({x:0,y:0},{x:i.xAxis.length,y:0}).sketch(front.context),new Line({x:0,y:0},{x:0,y:-i.yAxis.length}).sketch(front.context),front.context.restore()
var o=i.rotation.deg.toFixed(2)+"°"
showText(o,t,new Angle(getAngle(t,n).rad+Math.PI),front.context)}var i=new Ellipse(t,e)
i.draw(front.context),front.eventListeners.add("mousemove","showInfo",n),front.eventListeners.add("mousemove","setRadiiEnds",function(t){var e=getPoint(t)
i.xAxis.end.x=e.x,i.yAxis.end.y=e.y,i.draw(front.context)}),front.eventListeners.add("click","setEllipseRotation",function(e){front.eventListeners.remove("setEllipseRotation"),front.eventListeners.remove("setRadiiEnds")
var n=new Line(t,getPoint(e)).angle
front.eventListeners.add("mousemove","rotateEllipse",function(e){var o=getAngle(t,getPoint(e))
i.rotation=new Angle(o.rad-n.rad),i.draw(front.context)}),front.eventListeners.add("click","complete",i.complete)})}function Ellipse(t,e){return Shape({center:t,xAxis:new Line(t,{x:e.x,y:t.y}),yAxis:new Line(t,{x:t.x,y:e.y}),get semiMajor(){return this.yAxis.length>=this.xAxis.length?this.yAxis:this.xAxis},get semiMinor(){return this.yAxis.length>=this.xAxis.length?this.xAxis:this.yAxis},rotation:new Angle(0),draw:function(t){t.beginPath(),t.save(),t.translate(this.center.x,this.center.y),t.rotate(this.rotation.rad),t.scale(this.xAxis.length/this.semiMinor.length,this.yAxis.length/this.semiMinor.length),t.arc(0,0,this.semiMinor.length,0,2*Math.PI),t.restore(),t.stroke()}})}function Point(t,e){this.x=t,this.y=e,this.toString=function(){return"(x: "+this.x+", y: "+this.y+")"}}function getPoint(t){return new Point(t.pageX-front.canvas.offsetLeft,t.pageY-front.canvas.offsetTop)}function getAngle(t,e){var n=new Line({x:0,y:0},{x:e.x-t.x,y:0}).length,i=new Line(t,e).length,o=function(){var o=Math.acos(n/i)
switch(getQuadrant(t,e)){case 1:return o
case 2:return Math.PI-o
case 3:return Math.PI+o
case 4:return 2*Math.PI-o}}()
return new Angle(o)}function getQuadrant(t,e){return e.x>=t.x&&e.y>t.y?1:e.x<t.x&&e.y>=t.y?2:e.x<=t.x&&e.y<t.y?3:4}function Angle(t){var e=((t||0)+2*Math.PI)%(2*Math.PI)
return{rad:e,deg:e/Math.PI*180,quadrant:Math.ceil(e/(.5*Math.PI))||4}}function designLine(t,e){function n(){o.draw(front.context),r.sketch(front.context),s.endAngle=o.angle,s.sketch(front.context)}function i(){var t="x: "+o.start.x.toFixed(2)+", y: "+o.start.y.toFixed(2)+" to x: "+o.end.x.toFixed(2)+", y: "+o.end.y.toFixed(2)+", length: "+o.length.toFixed(2)
showText(t,front.lastPoint,getAngle(o.start,front.lastPoint),front.context)
var t=o.angle.deg.toFixed(2)+"°"
showText(t,o.start,new Angle(o.angle.rad+Math.PI),front.context)}var o=new Line(t,e),r=new AxisPair(o.start),s=new Arc(o.start,15,new Angle(0),o.angle)
n(),i(),displayHelpText("line","l",["[L]: set length","[R]: set rotation"]),front.eventListeners.add("mousemove","setEnd",function(){o.setEnd(front.lastPoint)}),front.eventListeners.add("mousemove","showLine",n),front.eventListeners.add("mousemove","showInfo",i),front.eventListeners.add("click","saveLine",o.complete.bind(o)),window.eventListeners.add("keydown","lineCommands",function(t){if(t.shiftKey)switch(t.which){case charCodes.l:getInput("enter length: ",function(t){o.fixedLength=parseInt(t),o.setEnd(front.lastPoint),front.clear(),front.showAxes(),n(),i()})
break
case charCodes.r:getInput({main:"enter rotation: ",subtext:"(in degrees)"},function(t){o.fixedRotation=new Angle(parseInt(t)/180*Math.PI),o.setEnd(front.lastPoint),front.clear(),front.showAxes(),n(),i()})}})}function Line(t,e){Shape.call(this),this.start=t,this.end=e}function VerticalLine(t){return new Line({x:t,y:0},{x:t,y:front.canvas.height})}function HorizontalLine(t){return new Line({x:0,y:t},{x:front.canvas.width,y:t})}function AxisPair(t){return{vertical:new Line({x:t.x,y:0},{x:t.x,y:front.canvas.height}),horizontal:new Line({x:0,y:t.y},{x:front.canvas.width,y:t.y}),draw:function(t){this.vertical.draw(t),this.horizontal.draw(t)},sketch:function(t){this.vertical.sketch(t),this.horizontal.sketch(t)}}}function designRect(t,e){function n(){return(r.diagonal.angle.quadrant-1)/2*Math.PI}function i(){r.draw(front.context),s.sketch(front.context),a.startAngle=new Angle(n()),a.endAngle=new Angle(n()+r.rotation.rad),a.sketch(front.context)}function o(){var t="length: "+r.length+", height: "+r.height
showText(t,front.lastPoint,getAngle(r.diagonal.start,front.lastPoint),front.context)
var t=r.rotation.deg.toFixed(2)+"°"
showText(t,r.diagonal.start,new Angle(r.rotation.rad+Math.PI),front.context)}displayHelpText("rectangle","r",["[H]: set height","[L]: set length","[R]: set rotation"])
var r=new Rectangle(t,e),s=new AxisPair(r.diagonal.start),a=new Arc(r.diagonal.start,15,new Angle(n()),new Angle(n()+r.rotation.rad))
i(),o(),front.eventListeners.add("mousemove","setEnd",function(){r.setEnd(front.lastPoint)}),front.eventListeners.add("mousemove","showRect",i),front.eventListeners.add("mousemove","showInfo",o),front.eventListeners.add("click","setRectRot",function(){r.fixedRotation&&r.complete(),front.eventListeners.remove("setEnd"),front.eventListeners.remove("setRectRot"),r.fixedLength=r.length,r.fixedHeight=r.height,r.inRotation=!0,front.eventListeners.add("mousemove","setRot",function(){var t=getAngle(r.diagonal.start,front.lastPoint)
r.rotation=new Angle(t.rad-r.diagonal.angle.rad)}),front.eventListeners.add("click","saveRect",r.complete.bind(r))}),window.eventListeners.add("keydown","rectCommands",function(t){if(t.shiftKey){var e=function(){r.setEnd(front.lastPoint),front.clear(),front.showAxes(),i(),o()}
switch(t.which){case charCodes.l:getInput("enter length: ",function(t){r.fixedLength=parseInt(t),e()})
break
case charCodes.h:getInput("enter height: ",function(t){r.fixedHeight=parseInt(t),e()})
break
case charCodes.r:getInput({main:"enter rotation: ",subtext:"(in degrees)"},function(t){r.fixedRotation=new Angle(parseInt(t)/180*Math.PI),e()})}}})}function Rectangle(t,e){Shape.call(this),this.diagonal=new Line(t,e),this._rotation=new Angle(0)}function Shape(){}function showText(t,e,n,i){switch(i.save(),n.quadrant){case 1:i.fillText(t,e.x+15,e.y+20)
break
case 2:i.textAlign="right",i.fillText(t,e.x-15,e.y+20)
break
case 3:i.textAlign="right",i.fillText(t,e.x-15,e.y-15)
break
case 4:i.fillText(t,e.x+15,e.y-15)}i.restore()}function Text(t,e){return{text:t,point:e,textAlign:front.context.textAlign,background:null,fontColor:front.context.fillStyle,draw:function(e){e.save(),e.textAlign=this.textAlign,this.background&&(e.fillStyle=this.background,e.fillRect(this.point.x,this.point.y-10,e.measureText(t).width,20)),e.fillStyle=this.fontColor,e.fillText(this.text,this.point.x,this.point.y),e.restore()}}}function getInput(t,e){var n=t.main||t,i=[{className:"center",text:n,id:"inputdiv"}]
t.subtext&&i.push({className:"center",text:t.subtext}),i.push("","[esc]: cancel")
var o=replaceInfoText(i),r=o.bs[0],s=window.eventListeners.clear()
window.eventListeners.add("keydown","getInput",function(t){t.which>=charCodes.zero&&t.which<=charCodes.nine?r.textContent+=t.which-charCodes.zero:t.which==charCodes.enter?(window.eventListeners.remove("getInput"),s.forEach(function(t){window.eventListeners.add(t.eventType,t.callbackName,t.callback)}),e(infodiv.textContent.replace(n,"")),document.getElementById("infopanel").replaceChild(o.olddiv,o.newdiv),subdiv&&document.getElementById("infopanel").removeChild(subdiv)):t.which==charCodes.backspace?r.textContent=infodiv.textContent.slice(0,-1):t.which==charCodes.esc&&(window.eventListeners.remove("getInput"),s.forEach(function(t){window.eventListeners.add(t.eventType,t.callbackName,t.callback)}),document.getElementById("infopanel").replaceChild(o.olddiv,o.newdiv),subdiv&&document.getElementById("infopanel").removeChild(subdiv))})}function replaceInfoText(t){var e=document.getElementById("infodiv"),n=document.createElement("div")
n.id="infodiv"
var i=t.map(function(t){var e=document.createElement("b")
t.id&&(e.id=t.id),t.className&&(e.className=t.className)
var t=t.text||t||"<br/>"
return e.innerHTML=t,n.appendChild(e),e})
return document.getElementById("infopanel").replaceChild(n,e),{olddiv:e,newdiv:n,bs:i}}function displayHelpText(t,e,n){var i=["drawing "+t,"","[a]: arc","[b]: bezier curve","[c]: circle","[e]: ellipse","[l]: line","[r]: rectangle","[s]: square","[t]: triangle"].filter(function(t){return t.slice(0,3)!="["+e+"]"}),o=i.concat(["","[esc]: stop drawing","","Shift+"]).concat(n)
replaceInfoText(o)}var charCodes={backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,pause:19,caps_lock:20,esc:27,page_up:33,page_down:34,end:35,home:36,left_arrow:37,up_arrow:38,right_arrow:39,down_arrow:40,insert:45,"delete":46,zero:48,one:49,two:50,three:51,four:52,five:53,six:54,seven:55,eignt:56,nine:57,a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,left_window_key:91,right_window_key:92,select_key:93,numpad_0:96,numpad_1:97,numpad_2:98,numpad_3:99,numpad_4:100,numpad_5:101,numpad_6:102,numpad_7:103,numpad_8:104,numpad_9:105,multiply:106,add:107,subtract:109,decimal_point:110,divide:111,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,num_lock:144,scroll_lock:145,semi_colon:186,equal_sign:187,comma:188,dash:189,period:190,forward_slash:191,grave_accent:192,open_bracket:219,back_slash:220,close_braket:221,single_quote:222}
Circle.prototype=new Shape,Circle.prototype.constructor=Circle,Circle.prototype.draw=function(t){t.beginPath(),t.arc(this.center.x,this.center.y,this.radius.length,0,2*Math.PI),t.stroke()}
var front,back
window.addEventListener("load",function(){front=new Canvas("frontlayer"),back=new Canvas("backlayer"),front.canvas.width=this.innerWidth-202,front.canvas.height=this.innerHeight-40,back.canvas.width=this.innerWidth-202,back.canvas.height=this.innerHeight-40,document.getElementById("infopanel").style.width=this.innerWidth-front.canvas.width-42+"px",document.getElementById("infopanel").style.height=this.innerHeight-40+"px",this.eventListeners=new EventListenerCollection(this),init()},!1),Line.prototype=new Shape,Line.prototype.constructor=Line,Line.prototype.setEnd=function(t){if(this.fixedLength||this.fixedRotation){var e=this.fixedRotation||new Line(this.start,t).angle,n=this.fixedLength||new Line(this.start,t).length
this.end=new Point(this.start.x+Math.cos(e.rad)*n,this.start.y+Math.sin(e.rad)*n)}else this.end=t},Object.defineProperty(Line.prototype,"length",{get:function(){return Math.sqrt(Math.pow(this.end.x-this.start.x,2)+Math.pow(this.end.y-this.start.y,2))}}),Object.defineProperty(Line.prototype,"angle",{get:function(){return getAngle(this.start,this.end)}}),Line.prototype.draw=function(t){t.beginPath(),t.moveTo(this.start.x,this.start.y),t.lineTo(this.end.x,this.end.y),t.stroke()},Rectangle.prototype=new Shape,Rectangle.prototype.constructor=Rectangle,Object.defineProperty(Rectangle.prototype,"length",{get:function(){return this.fixedLength||Math.abs(this.diagonal.end.x-this.diagonal.start.x)}}),Object.defineProperty(Rectangle.prototype,"height",{get:function(){return this.fixedHeight||Math.abs(this.diagonal.end.y-this.diagonal.start.y)}}),Object.defineProperty(Rectangle.prototype,"rotation",{get:function(){return this.fixedRotation||this._rotation},set:function(t){this._rotation=t}}),Rectangle.prototype.setEnd=function(t){var e=(this.inRotation?this.diagonal.angle:getAngle(this.diagonal.start,t)).quadrant,n=this.fixedLength?this.diagonal.start.x+(2==e||3==e?-1:1)*this.length:t.x,i=this.fixedHeight?this.diagonal.start.y+(3==e||4==e?-1:1)*this.height:t.y
this.diagonal.setEnd(new Point(n,i))},Rectangle.prototype.draw=function(t){var e=this.diagonal.end.x-this.diagonal.start.x,n=this.diagonal.end.y-this.diagonal.start.y
t.save(),t.translate(this.diagonal.start.x,this.diagonal.start.y),t.rotate((this.fixedRotation||this.rotation).rad),t.strokeRect(0,0,e,n),t.restore()},Shape.prototype.complete=function(){front.refresh(!0),this.draw(back.context)},Shape.prototype.sketch=function(t){t.save(),t.strokeStyle="blue",t.lineWidth=.5,t.setLineDash([5]),this.draw(t),t.restore()}
var charCodes={backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,pause:19,caps_lock:20,esc:27,page_up:33,page_down:34,end:35,home:36,left_arrow:37,up_arrow:38,right_arrow:39,down_arrow:40,insert:45,"delete":46,zero:48,one:49,two:50,three:51,four:52,five:53,six:54,seven:55,eignt:56,nine:57,a:65,b:66,c:67,d:68,e:69,f:70,g:71,h:72,i:73,j:74,k:75,l:76,m:77,n:78,o:79,p:80,q:81,r:82,s:83,t:84,u:85,v:86,w:87,x:88,y:89,z:90,left_window_key:91,right_window_key:92,select_key:93,numpad_0:96,numpad_1:97,numpad_2:98,numpad_3:99,numpad_4:100,numpad_5:101,numpad_6:102,numpad_7:103,numpad_8:104,numpad_9:105,multiply:106,add:107,subtract:109,decimal_point:110,divide:111,f1:112,f2:113,f3:114,f4:115,f5:116,f6:117,f7:118,f8:119,f9:120,f10:121,f11:122,f12:123,num_lock:144,scroll_lock:145,semi_colon:186,equal_sign:187,comma:188,dash:189,period:190,forward_slash:191,grave_accent:192,open_bracket:219,back_slash:220,close_braket:221,single_quote:222}
Circle.prototype=new Shape,Circle.prototype.constructor=Circle,Circle.prototype.draw=function(t){t.beginPath(),t.arc(this.center.x,this.center.y,this.radius.length,0,2*Math.PI),t.stroke()}
var front,back
window.addEventListener("load",function(){front=new Canvas("frontlayer"),back=new Canvas("backlayer"),front.canvas.width=this.innerWidth-202,front.canvas.height=this.innerHeight-40,back.canvas.width=this.innerWidth-202,back.canvas.height=this.innerHeight-40,document.getElementById("infopanel").style.width=this.innerWidth-front.canvas.width-42+"px",document.getElementById("infopanel").style.height=this.innerHeight-40+"px",this.eventListeners=new EventListenerCollection(this),init()},!1),Line.prototype=new Shape,Line.prototype.constructor=Line,Line.prototype.setEnd=function(t){if(this.fixedLength||this.fixedRotation){var e=this.fixedRotation||new Line(this.start,t).angle,n=this.fixedLength||new Line(this.start,t).length
this.end=new Point(this.start.x+Math.cos(e.rad)*n,this.start.y+Math.sin(e.rad)*n)}else this.end=t},Object.defineProperty(Line.prototype,"length",{get:function(){return Math.sqrt(Math.pow(this.end.x-this.start.x,2)+Math.pow(this.end.y-this.start.y,2))}}),Object.defineProperty(Line.prototype,"angle",{get:function(){return getAngle(this.start,this.end)}}),Line.prototype.draw=function(t){t.beginPath(),t.moveTo(this.start.x,this.start.y),t.lineTo(this.end.x,this.end.y),t.stroke()},Rectangle.prototype=new Shape,Rectangle.prototype.constructor=Rectangle,Object.defineProperty(Rectangle.prototype,"length",{get:function(){return this.fixedLength||Math.abs(this.diagonal.end.x-this.diagonal.start.x)}}),Object.defineProperty(Rectangle.prototype,"height",{get:function(){return this.fixedHeight||Math.abs(this.diagonal.end.y-this.diagonal.start.y)}}),Object.defineProperty(Rectangle.prototype,"rotation",{get:function(){return this.fixedRotation||this._rotation},set:function(t){this._rotation=t}}),Rectangle.prototype.setEnd=function(t){var e=(this.inRotation?this.diagonal.angle:getAngle(this.diagonal.start,t)).quadrant,n=this.fixedLength?this.diagonal.start.x+(2==e||3==e?-1:1)*this.length:t.x,i=this.fixedHeight?this.diagonal.start.y+(3==e||4==e?-1:1)*this.height:t.y
this.diagonal.setEnd(new Point(n,i))},Rectangle.prototype.draw=function(t){var e=this.diagonal.end.x-this.diagonal.start.x,n=this.diagonal.end.y-this.diagonal.start.y
t.save(),t.translate(this.diagonal.start.x,this.diagonal.start.y),t.rotate((this.fixedRotation||this.rotation).rad),t.strokeRect(0,0,e,n),t.restore()},Shape.prototype.complete=function(){front.refresh(!0),this.draw(back.context)},Shape.prototype.sketch=function(t){t.save(),t.strokeStyle="blue",t.lineWidth=.5,t.setLineDash([5]),this.draw(t),t.restore()}
