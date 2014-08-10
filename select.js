function selectMode() {
  front.refresh();
  var selected = [];

  replaceInfoText([{
    text: 'select shape(s) by point(s)',
    className: 'center'
  }]);

  var allPoints = back.shapes.map(function(shape) {
    var points = shape.points;
    points.forEach(function(point) { point.shape = shape; });
    return points;
  }).flatten();

  allPoints.forEach(function(point) { point.fill(back.context); });

  front.eventListeners.add('click', 'select', function(e) {
    front.eventListeners.clear();

    var selectRect = new Rectangle(getPoint(e), getPoint(e));
    front.eventListeners.add('mousemove', 'showSelectRect', function(e) {
      selectRect.setEnd(getPoint(e));
      front.context.strokeStyle = "blue";
      front.context.fillStyle = "rgba(173,216,230,0.25)";
        selectRect.draw(front.context);
        selectRect.fill(front.context);
      front.context.strokeStyle = "black";
      front.context.fillStyle = "black";
    });

    front.eventListeners.add('click', 'completeSelection', function(e) {
      front.eventListeners.clear();

      selectRect.setEnd(getPoint(e));

      var leftMost  = Math.min(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var rightMost = Math.max(selectRect.diagonal.end.x, selectRect.diagonal.start.x);
      var upperMost = Math.min(selectRect.diagonal.end.y, selectRect.diagonal.start.y);
      var lowerMost = Math.max(selectRect.diagonal.end.y, selectRect.diagonal.start.y);

      back.clear();

      allPoints.forEach(function(point) {
        if(point.x > leftMost && point.x < rightMost && point.y > upperMost && point.y < lowerMost) {
          if(!(selected.indexOf(point.shape) + 1)) {
            selected.push(point.shape);
            back.shapes.remove(point.shape);
            point.shape.strokeStyle = "blue";
            point.shape.draw(back.context);
          }
        }
      });
      back.shapes.forEach(function(shape) { shape.draw(back.context); });
      
      if(selected.length) deleteOrTransform(selected);
    });
  });

  window.eventListeners.add('keydown', 'selectCommands', function(e) {
    switch(e.which) {
      case charCodes['esc']:
        selected.forEach(function(shape) {
          shape.strokeStyle = "black";
          back.shapes.push(shape);
        });
        back.refresh();
        front.refresh(true);
      break;
    }
  });
}

function deleteOrTransform(selected) {
  replaceInfoText([
    '[d]: delete',
    '[r]: rotate',
    '[t]: translate',
    '',
    '[esc]: cancel'
  ]);

  window.eventListeners.add('keydown', 'selectCommands', function(e) {
    switch(e.which) {
      case charCodes['d']:
        back.refresh();
        front.refresh(true);
      break;
      case charCodes['r']:
        back.refresh();
        rotateGroup(new Group(selected));
      break;
      case charCodes['t']:
        back.refresh();
        translateGroup(new Group(selected));
      break;
    }
  });
}

function Group(shapes) {
  this.shapes = shapes;
  this.translate = new Point(0, 0);

  this.draw = function(context) {
    context.save();
      context.translate(this.translate.x, this.translate.y);
      context.strokeStyle = this.strokeStyle;
      this.shapes.forEach(function(shape) {
        context.beginPath();
          shape.drawPath(context);
        context.stroke();
      });
    context.restore();
  }

  this.setTranslate = function(point) {
    this.translate = point;
    this.shapes.forEach(function(shape) {
      if (shape instanceof Ellipse) {
        var end = shape.controlLine.end;
        delete shape.controlLine;
        shape.controlLine = new Line(shape.center, end);
      }
      (function(start, end) {
        start.x = start.x - point.x;
        start.y = start.y - point.y;
        end.x = end.x - point.x;
        end.y = end.y - point.y;
      })(shape.controlLine.start, shape.controlLine.end);
    });
  }
}

function rotateGroup(group) {
  group.strokeStyle = "blue";

  front.eventListeners.add('mousemove', 'drawGroup', function() {
    group.draw(front.context);
  });

  replaceInfoText([{
    text: 'click center of rotation',
    className: 'center'
  }]);

  front.eventListeners.add('click', 'chooseCenter', function(e) {
    front.eventListeners.remove('chooseCenter');
    group.setTranslate(getPoint(e));

  });
}
