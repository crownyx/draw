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
