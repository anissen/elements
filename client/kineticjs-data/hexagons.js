
var stage = new Kinetic.Stage({
    container: 'container',
    width: 700,
    height: 700
});

var hexLayer = new Kinetic.Layer();
stage.add(hexLayer);

var map = new KineticHexMap();
var selectedTile = null;
var neighborHexagons = [];
var hexRadius = 70;

var timeline = new TimelineLite({ paused: false, onUpdate: hexLayer.draw, onUpdateScope: hexLayer });

map.on('enter', function(tile) {
  tile.setStroke('darkred');
  tile.setStrokeWidth(5);
  hexLayer.draw();
});

map.on('leave', function(tile) {
  tile.setStroke(tile.attrs.originalStroke);
  tile.setStrokeWidth(3);
  hexLayer.draw();
});

map.on('selected', function(tile) {
  tile.moveToTop();

  var tiles = map.getReachableTilesData(tile.attrs.hex, 1);
  timeline
    .to(tile, 0.5, { setStrokeWidth: 8, setScaleX: 1.2, setScaleY: 1.2, setFillB: 75, ease: Bounce.easeOut })
    .staggerTo(tiles, 0.4, { setScaleX: -1.0, setFillR: 255, setFillG: 180, setFillB: 75, ease: Bounce.easeOut }, 0.03, "-=0.4");

  neighborHexagons = tiles;
});

map.on('deselected', function(tile) {
  timeline
    .to(tile, 0.5, { setStrokeWidth: 2, setScaleX: 1.0, setScaleY: 1.0, setFillB: 255, ease: Bounce.easeOut })
    .staggerTo(neighborHexagons, 0.2, { setScaleX: 1.0, setScaleY: 1.0, setFillG: 200, setFillR: 0, setFillB: 255, ease: Bounce.easeOut }, 0.02, "-=0.4");
});

map.on('perform-action', function(data) {
  var oldData = {x: data.selected.getX(), y: data.selected.getY()}
  timeline
    .to(data.selected, 0.3, { setX: data.target.getX(), setY: data.target.getY(), ease: Bounce.easeOut })
    .to(data.selected, 0.6, { setX: oldData.x, setY: oldData.y, ease: Elastic.easeOut });
});

// var image = new Image();
// image.src = 'kineticjs-data/big-wave.png';
// var rectSize = 65;
// var rect = new Kinetic.Rect({
//   x: tile.getX() - tile.getRadius() - rectSize + 10,
//   y: tile.getY() - rectSize / 2,
//   height: rectSize,
//   width: rectSize,
//   fillPatternImage: image,
//   fillPatternOffset: [4, 4],
//   fillPatternScale: 0.7
// });

// hexLayer.add(rect);

map.on('initialized', function(hexagons) {
  timeline
    .staggerFrom(_.shuffle(hexagons), 0.7, { 
      setY: -80, 
      setRotation: Math.PI / 2,
      ease: Bounce.easeOut
    }, 0.01)
    .staggerTo(hexagons, 0.5, { 
      setScaleX: 1.0, 
      setScaleY: 1.0, 
      ease: Elastic.easeInOut 
    }, 0.01, "-=0.4");
});

map.initialize(5, 6, hexLayer, {});
