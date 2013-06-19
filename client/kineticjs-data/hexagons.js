
window.onload=function(){

  var stage = new Kinetic.Stage({
      container: 'container',
      width: 700,
      height: 700
  });

  var hexLayer = new Kinetic.Layer();

  var map = new KineticHexMap();
  var selectedHexagon = null;
  var neighborHexagons = [];
  var hexRadius = 70;

  map.on('enter', function(tile) {
    if (tile === selectedHexagon) return;

    tile.setStroke('blue');
    hexLayer.draw();
  });

  map.on('leave', function(tile) {
    if (tile === selectedHexagon) return;
    
    tile.setStroke('1C75BC');
    hexLayer.draw();
  });

  map.on('click', function(tile) {
    //var tiles = map.getRingData(tile.attrs.hex);
    //var tiles = map.getRangeData(tile.attrs.hex);
    var tiles = map.getReachableTilesData(tile.attrs.hex);
    _.each(tiles, function(tile) {
      tile.setScaleX(1);
      tile.moveToTop();
    })
    var timeline = new TimelineLite({ paused:false, onUpdate: stage.draw, onUpdateScope:stage });
    timeline
      .staggerTo(neighborHexagons, 0.2, { setScaleX: 1, setFillG: 200, setFillR: 0, ease: Bounce.easeOut }, 0.02)
      .staggerTo(tiles, 0.4, { setScaleX: -1, setFillG: 100, setFillR: 200, ease: Bounce.easeOut }, 0.04);
    neighborHexagons = tiles;

    if (selectedHexagon) {
      selectedHexagon.setStrokeWidth(3);
      selectedHexagon.setStroke('blue');
      
      TweenLite.to(selectedHexagon, 0.4, {
        setStrokeWidth: 3,
        setRadius: hexRadius,
        setFillPatternScaleX: 1.2,
        setFillPatternScaleY: 1.2,
        ease: Elastic.easeOut,
        onUpdate: stage.draw, 
        onUpdateScope:stage
      });
    }

    if (selectedHexagon === tile) {
      selectedHexagon = null;
    } else {
      TweenLite.to(tile, 1.0, {
        setStrokeWidth: 8,
        setFillPatternScaleX: 1.4,
        setFillPatternScaleY: 1.4,
        ease: Elastic.easeOut,
        onUpdate: stage.draw, 
        onUpdateScope:stage
      });
      tile.setStroke('gold');
      tile.moveToTop();
      selectedHexagon = tile;
    }
  });

  stage.add(hexLayer);

  map.on('initialized', function(hexagons) {
    var tl = new TimelineLite({ paused:false, onUpdate: stage.draw, onUpdateScope:stage });
    var staggerFromData = { 
      setY: -80, 
      ease: Bounce.easeOut, 
      setRotation: Math.PI / 2 
    };
    var staggerToData = { 
      setScaleX: 1.0, 
      setScaleY: 1.0, 
      ease: Elastic.easeOut 
    };

    tl
      .staggerFrom(_.shuffle(hexagons), 0.7, staggerFromData, 0.01)
      .staggerTo(hexagons, 0.5, staggerToData, 0.01);
  });

  map.initialize(5, 6, hexLayer, {});
}
