
var stage = new Kinetic.Stage({
    container: 'container',
    width: 700,
    height: 700
});

var hexLayer = new Kinetic.Layer();

var map = new KineticHexMap();
var neighborHexagons = [];
var hexRadius = 70;

map.on('enter', function(tile) {
  tile.setStroke('blue');
  tile.draw();
});

map.on('leave', function(tile) {
  tile.setStroke('1C75BC');
  tile.draw();
});

map.on('click', function(tile) {
  //var tiles = map.getRingData(tile.attrs.hex);
  //var tiles = map.getRangeData(tile.attrs.hex);
  var tiles = map.getReachableTilesData(tile.attrs.hex);
  var timeline = new TimelineLite({ paused:false, onUpdate: hexLayer.draw, onUpdateScope:hexLayer });
  timeline
    .staggerTo(neighborHexagons, 0.2, { setScaleX: 1, setFillG: 200, setFillR: 0, ease: Bounce.easeOut }, 0.02)
    .staggerTo(tiles, 0.4, { setScaleX: -1, setFillG: 100, setFillR: 200, ease: Bounce.easeOut }, 0.04);
  neighborHexagons = tiles;
});

stage.add(hexLayer);

map.on('initialized', function(hexagons) {
  var tl = new TimelineLite({ paused:false, onUpdate: hexLayer.draw, onUpdateScope:hexLayer });
  tl
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
