var R = Raphael("board","100%","100%");

function createTile(x, y, color) {
  var width = 120;
  var height = 120;
  var rect = R.rect(x, y, width, height, 10).attr({
      fill: color,
      stroke: "#000",
      "stroke-width": 2,
      opacity: 0.5
  });
  return rect;
}

Raphael.el.setGroup = function (group) {
  this.group = group;
};

Raphael.el.getGroup = function () {
  return this.group;
};

Raphael.fn.unitTile = function (x, y, text) {
  var width = 120;
  var height = 120;
  var borderRounding = 10;
  var background = this.rect(x, y, width, height, borderRounding).attr({
    fill: "red",
    stroke: "#000",
    "stroke-width": 1
  });
  var label = this.text(x + width / 2, y + height / 2, text).attr({font: '20px Helvetica'});
  var layer = this.rect(x, y, width, height, borderRounding).attr({
    fill: "#FFF",
    "fill-opacity": 0,
    "stroke-opacity": 0
  });
  var group = this.set();
  group.push(background, label, layer);
  layer.setGroup(group);
  layer.background = background;
  return layer;
};

var start = function () {
    this.animate({
        opacity: 0.5
    }, 500, "<>");
    this.group = this.getGroup();
    this.lastDx = 0;
    this.lastDy = 0;
},
    move = function (dx, dy) {
      var snapDx = Math.floor(0.5 + dx / 125) * 125;
      var snapDy = Math.floor(0.5 + dy / 125) * 125;
      //var transformString = "t" + snapDx + "," + snapDy;
      //this.group.transform(transformString);
      this.group.translate(snapDx - this.lastDx, snapDy - this.lastDy); // TODO: Deprecated!
      this.lastDx = snapDx;
      this.lastDy = snapDy;
    },
    up = function () {
        this.background.animate({
            opacity: 1.0
        }, 500, "<>");
    },
    hoverIn = function () {
        this.background.animate({
            "stroke-width": 8
        }, 500, "elastic");
    },
    hoverOut = function () {
        this.background.animate({
            "stroke-width": 2
        }, 500, "<>");
    };

var tiles = [];
for (var y = 0; y < 5; y++) {
  for (var x = 0; x < 5; x++) {
    tiles.push(createTile(5 + x * 125, 5 + y * 125, "gray"));
  }
}

var unit = R.unitTile(5 + 2 * 125, 5 + 3 * 125, "red");

R.set(unit).hover(hoverIn, hoverOut);
R.set(unit).drag(move, start, up);

