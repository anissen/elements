var R = Raphael("board","100%","100%");

function createTile(x, y, color) {
  return R.rect(x, y, 120, 120, 10).attr({
      fill: color,
      stroke: "#000",
      "stroke-width": 2
  });
}

var start = function () {
    this.ox = this.attr("x");
    this.oy = this.attr("y");
    this.animate({
        //width: 150,
        //height: 150
        opacity: 0.5
    }, 500, "<>");
},
    move = function (dx, dy) {
        this.attr({
            x: this.ox + Math.floor(0.5 + dx / 125) * 125,
            y: this.oy + Math.floor(0.5 + dy / 125) * 125
        });
    },
    up = function () {
        this.animate({
            //width: 120,
            //height: 120,
            opacity: 1.0
        }, 500, "<>");
    },
    hoverIn = function () {
        this.animate({
            "stroke-width": 5
        }, 500, "elastic");
    },
    hoverOut = function () {
        this.animate({
            "stroke-width": 2
        }, 500, "<>");
    };

var tiles = [];
for (var y = 0; y < 5; y++) {
  for (var x = 0; x < 5; x++) {
    tiles.push(createTile(5 + x * 125, 5 + y * 125, "lightblue"));
  }
}
R.set(tiles).hover(hoverIn, hoverOut);

var units = [];
units.push(createTile(5 + 2 * 125, 5 + 3 * 125, "red"));

R.set(units).drag(move, start, up);
