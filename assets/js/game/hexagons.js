
function setupKinetic() {
  var stage = new Kinetic.Stage({
      container: 'container',
      width: 700,
      height: 700
  });

  var hexLayer = new Kinetic.Layer();
  stage.add(hexLayer);

  var game = new KineticHexMap();
  var selectedTile = null;
  var neighborHexagons = [];
  var hexRadius = 70;

  var timeline = new TimelineLite({ paused: false, onUpdate: hexLayer.draw, onUpdateScope: hexLayer });

  game.on('enter', function(tile) {
    tile.setStroke('darkred');
    tile.setStrokeWidth(5);
    hexLayer.draw();
  });

  game.on('leave', function(tile) {
    tile.setStroke(tile.attrs.originalStroke);
    tile.setStrokeWidth(tile.attrs.originalStrokeWidth);
    hexLayer.draw();
  });

  game.on('selected', function(entity) {
    entity.moveToTop();

    var entities = game.getReachableTilesData(entity.attrs.hex, 2);
    timeline
      .to(entity, 0.5, { setStrokeWidth: 8, setScaleX: 1.2, setScaleY: 1.2, /* setFillB: 75, */ ease: Elastic.easeOut })
      .staggerTo(entities, 0.4, { setScaleX: -1.0, setFillR: 255, setFillG: 180, setFillB: 75, ease: Bounce.easeOut }, 0.03, "-=0.4");

    neighborHexagons = entities;
  });

  game.on('deselected', function(entity) {
    timeline
      .to(entity, 0.5, { setStrokeWidth: 2, setScaleX: 1.0, setScaleY: 1.0, /* setFillB: 255, */ ease: Elastic.easeOut })
      .staggerTo(neighborHexagons, 0.2, { setScaleX: 1.0, setScaleY: 1.0, setFillR: 255, setFillG: 255, setFillB: 240, ease: Bounce.easeOut }, 0.02, "-=0.4");
  });

  game.on('attack', function(data) {
    var fromTile = data.fromData.entity;
    var toTile = data.toData.entity;

    var oldData = {x: fromTile.getX(), y: fromTile.getY()};
    timeline
      .to(fromTile, 0.3, { setX: toTile.getX(), setY: toTile.getY(), ease: Bounce.easeOut })
      .to(fromTile, 0.6, { setX: oldData.x, setY: oldData.y, ease: Elastic.easeOut });
  });

  game.on('move', function(data) {
    var fromTile = data.fromData.entity;
    var toTile = data.toData.tile;

    timeline
      .to(fromTile, 0.3, { setX: toTile.getX(), setY: toTile.getY(), ease: Cubic.easeOut /*, onComplete: data.callback */ });
  });

  game.on('play-entity', function(data) {
    timeline
      .from(data.entity, 1.0, { 
        setY: (data.player === 0 ? 800 : -80),
        setRotation: Math.PI / 2,
        setScaleX: 0.5,
        setScaleY: 0.5,
        ease: Bounce.easeOut 
      });
  });

  game.on('initialized', function(hexagons) {
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

  game.layer = hexLayer;

  window.game = game;
}
