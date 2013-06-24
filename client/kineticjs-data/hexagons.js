
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
  tile.setStroke('blue');
  hexLayer.draw();
});

map.on('leave', function(tile) {
  tile.setStroke('1C75BC');
  hexLayer.draw();
});

map.on('selected', function(tile) {
  tile.moveToTop();

  var tiles = map.getReachableTilesData(tile.attrs.hex, 2);
  timeline
    .to(tile, 0.5, { setStrokeWidth: 5, setScaleX: 1.2, setScaleY: 1.2, ease: Elastic.easeOut })
    .staggerTo(tiles, 0.4, { setScaleX: -1.0, setFillG: 100, setFillR: 200, ease: Bounce.easeOut }, 0.03, "-=0.4");
  console.log('selected', tile.getScale());

  neighborHexagons = tiles;
});

map.on('deselected', function(tile) {
  timeline
    .to(tile, 0.5, { setStrokeWidth: 2, setScaleX: 1.0, setScaleY: 1.0, ease: Elastic.easeOut })
    .staggerTo(neighborHexagons, 0.2, { setScaleX: 1.0, setScaleY: 1.0, setFillG: 200, setFillR: 0, ease: Bounce.easeOut }, 0.02, "-=0.4");
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
    }, 0.01);
});

map.initialize(5, 6, hexLayer, {});
