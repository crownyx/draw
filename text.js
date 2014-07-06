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
