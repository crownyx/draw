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
