
var R = Raphael("board","100%","100%");

function createTile(x, y, color) {
  var width = 120;
  var height = 120;
  var rect = R.rect(x, y, width, height, 10).attr({
      fill: color,
      stroke: "#000",
      "stroke-width": 2,
      opacity: 0.8
  });
  return rect;
}

Raphael.fn.unitTile = function (x, y, text) {
  var width = 120;
  var height = 120;
  var borderRounding = 10;
  var background = this.rect(x, y, width, height, borderRounding).attr({
    fill: "red",
    stroke: "#000",
    "stroke-width": 1
  });
  var label = this.text(x + width / 2 , y + height / 2, text).attr({
    font: '20px Helvetica'
  });

  var layer = this.rect(x, y, width, height, borderRounding).attr({
    fill: "#FFF",
    "fill-opacity": 0,
    "stroke-opacity": 0
  });
  var group = this.set();
  group.push(background, layer);
  layer.group = group;
  layer.background = background;
  layer.label = label;
  return layer;
};

var hoverIn = function () {
        this.background.animate({
            "stroke-width": 5,
            "stroke": "yellow"
        }, 500, "elastic");
    },
    hoverOut = function () {
        this.background.animate({
            "stroke-width": 2,
            "stroke": "black"
        }, 500, "<>");
    };

function toCenter(val) {
  return (val + 0.5) * 125;
}

function toCorner(val) {
  return val * 125;
}

var tiles = [];

var startArrow = function () {
    this.ox = Math.floor(this.attr("x") / 125);
    this.oy = Math.floor(this.attr("y") / 125);
    this.lastSnapDx = this.ox;
    this.lastSnapDy = this.oy;
    // this.snaps = [];
    arrow.attr({
      opacity: 0.8,
      path: "M" + toCenter(this.ox) + " " + toCenter(this.oy) + " L" + toCenter(this.ox) + 20 + " " + toCenter(this.oy) + 20,
      stroke: '#FF0000'
    });
  },
  moveArrow = function (dx, dy) {
    var snapDx = this.ox + Math.floor(0.5 + dx / 125);
    var snapDy = this.oy + Math.floor(0.5 + dy / 125);
    if (snapDx === this.lastSnapDx && snapDy === this.lastSnapDy)
      return;

    if (snapDx === this.ox && snapDy === this.oy) {
      arrow.animate({
        path: "M" + toCenter(this.ox) + " " + toCenter(this.oy) + " L" + toCenter(snapDx) + 10 + " " + toCenter(snapDy) + 10 // T313 313 "
      }, 50, "<>");
    } else {
      tiles[snapDy][snapDx].animate({
        stroke: 'yellow'
      }, 100, 'bounce');

      tiles[this.lastSnapDy][this.lastSnapDx].animate({
        stroke: 'black'
      }, 100, 'bounce');

      /*
      var blahString = "";
      for (var i = 0; i < this.snaps.length; i++) {
        var snap = this.snaps[i];
        blahString += snap.x + " " + snap.y + " ";
      }
      */
      arrow.animate({
        path: "M" + toCenter(this.ox) + " " + toCenter(this.oy) + " L" /* + " T" + blahString + " " */ + toCenter(snapDx) + " " + toCenter(snapDy)
      }, 50, "<>");

      // this.snaps.push({x: toCenter(snapDx), y: toCenter(snapDy)});
    }

    this.lastSnapDx = snapDx;
    this.lastSnapDy = snapDy;
  },
  upArrow = function () {
    arrow.animate({
      opacity: 0.0
    }, 50, "<>");

    this.group.animate({
      x: toCorner(this.lastSnapDx) + 5,
      y: toCorner(this.lastSnapDy) + 5
    }, 200, "<>");

    this.label.animate({
      x: toCenter(this.lastSnapDx) + 5,
      y: toCenter(this.lastSnapDy) + 5
    }, 200, "<>");

    tiles[this.lastSnapDy][this.lastSnapDx].animate({
      stroke: 'black'
    }, 100, 'bounce');
  };
/*
for (var y = 0; y < 5; y++) {
  tiles.push(new Array());
  for (var x = 0; x < 5; x++) {
    tiles[y].push(createTile(5 + x * 125, 5 + y * 125, "gray"));
  }
}

var arrow = R.path('M10 10 L50 10');
arrow.attr({
  stroke: 'none',
  'stroke-width': 10,
  'arrow-end': 'classic-wide-long',
  'opacity': 0.8
});

var unit = R.unitTile(5 + 2 * 125, 5 + 3 * 125, "red");

R.set(unit).hover(hoverIn, hoverOut);
R.set(unit).drag(moveArrow, startArrow, upArrow);
*/

Raphael.fn.star = function (cx, cy, r, r2, rays) {
    r2 = r2 || r * 0.382;
    rays = rays || 5;
    var points = ["M", cx, cy + r2, "L"],R;

    for (var i = 1; i < rays * 2; i++)
    {
        R = i % 2 ? r : r2;
        points = points.concat([(cx + R * Math.sin(i * Math.PI / rays)), (cy + R * Math.cos(i * Math.PI / rays))]);
    }
    points.push("z");
    return this.path(points.join());
};

Raphael.fn.hexagon = function (cx, cy, size) {
    return R.star(cx, cy, size, size, 3);
};

var hexagons = [];
var xstart = 60;
var ystart = 60;
var hexsize = 60;
var margin = 4;
var hexwidth = hexsize * Math.PI/2 + margin * 2;
for (var y = 0; y < 7; y++) {
    for (var x = 0; x < 5; x++) {
        var xpos = xstart + ((y % 2) === 0 ? x * (hexwidth + margin) : (hexwidth + margin) / 2 + x * (hexwidth + margin));
        var ypos = ystart + margin + y * hexwidth * 0.9;
        var hexagon = R.hexagon(xpos, ypos, hexsize);
        hexagons.push(hexagon);
    }
}

var hexagonHoverIn = function() {
  this.animate({
    "stroke-width": 5,
    stroke: 'yellow'
  }, 250, "elastic");
};

var hexagonHoverOut = function() {
  this.animate({
    "stroke-width": 1,
    stroke: 'black'
  }, 250, "<>");
};

R.set(hexagons)
  .attr({fill:'#3333FF'})
  .hover(hexagonHoverIn, hexagonHoverOut);
