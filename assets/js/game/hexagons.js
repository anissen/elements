
function setupKinetic() {
  var stage = new Kinetic.Stage({
      container: 'container',
      width: 800,
      height: 800 /*,
      draggable: true,
      // only allow vertical dragging
      dragBoundFunc: function(pos) {
        return {
          x: this.getAbsolutePosition().x,
          y: pos.y
        };
      }
      */
  });

  var hexLayer = new Kinetic.Layer();
  stage.add(hexLayer);

  var game = new KineticHexMap();
  var selectedTile = null;
  var neighborHexagons = [];
  var hexRadius = 70;

  var timeline = new TimelineLite({ paused: false, onUpdate: hexLayer.draw, onUpdateScope: hexLayer });

  game.on('enter', function(tile) {
    var hex = tile.get('RegularPolygon')[0];
    hex.setStroke('darkred');
    hex.setStrokeWidth(hex.getStrokeWidth() + 2);
    hexLayer.draw();
  });

  game.on('leave', function(tile) {
    var hex = tile.get('RegularPolygon')[0];
    hex.setStroke(hex.attrs.originalStroke);
    hex.setStrokeWidth(hex.attrs.originalStrokeWidth);
    hexLayer.draw();
  });

  game.on('selected', function(entity) {
    entity.moveToTop();

    var entities = game.getReachableTilesData(entity.attrs.hex, 1);
    var entityHexes = _.map(entities, function(entity) {
      return entity.get('RegularPolygon')[0];
    });
    timeline
      .to(entity, 0.5, { setStrokeWidth: entity.attrs.selectedStrokeWidth, setScaleX: 1.3, setScaleY: 1.3, /* setFillB: 75, */ ease: Elastic.easeOut })
      .staggerTo(entityHexes, 0.4, { setScaleX: -1.0, setFillR: 255, setFillG: 180, setFillB: 75, ease: Bounce.easeOut }, 0.03, "-=0.4");

    neighborHexagons = entityHexes;
  });

  game.on('deselected', function(entity) {
    timeline
      .to(entity, 0.5, { setStrokeWidth: entity.attrs.originalStrokeWidth, setScaleX: 1.0, setScaleY: 1.0, /* setFillB: 255, */ ease: Elastic.easeOut })
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
      .to(fromTile, 0.3, { setX: toTile.getX(), setY: toTile.getY(), ease: Cubic.easeOut, onComplete: data.callback });
  });

  game.on('draw-card', function(entity) {
    var easings = [Bounce.easeOut, Back.easeOut, SlowMo.ease, Expo.easeOut];
    console.log(entity);
    timeline
      .from(entity, 1.0, { 
        setY: (entity.attrs.player === 0 ? 1000 : -100),
        setRotation: Math.PI / 2,
        setScaleX: 0.5,
        setScaleY: 0.5,
        ease: easings[Math.floor(Math.random() * easings.length)]
      });
  });

  game.on('play-card', function(data) {
    var toTile = data.target.tile;
    var easings = [Back.easeOut]; // [Bounce.easeOut, Back.easeOut, SlowMo.ease, Expo.easeOut];

    timeline
      .to(data.card, 1.0, { 
        setX: toTile.getX(), 
        setY: toTile.getY(),
        ease: easings[Math.floor(Math.random() * easings.length)]
      });
  });

  game.on('setup-board', function(hexagons) {
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

  game.on('state-loaded', function(data) {
    timeline
      .staggerFrom(_.shuffle(data), 1.0, { 
        setRotation: -Math.PI,
        setScaleX: 0.0,
        setScaleY: 0.0,
        ease: Back.easeOut
      }, 0.5);
  });

  game.on('turn-ended', function(playerId) {
    var oldPlayerEntities = _.chain(game.entities)
      .filter(function(entity) {
        return entity.attrs.player === playerId;
      })
      .map(function(entity) {
        return entity.get('RegularPolygon')[0];
      })
      .shuffle()
      .value();

    timeline
      .staggerTo(oldPlayerEntities, 0.3, {
        setStrokeWidth: 0,
        //setScaleY: 0.8,
        setShadowOpacity: 0.0,
        ease: Expo.easeOut
      }, 0.01);
  });

  game.on('turn-started', function(playerId) {
    var newPlayerEntities = _.chain(game.entities)
      .filter(function(entity) {
        return entity.attrs.player === playerId;
      })
      .map(function(entity) {
        return entity.get('RegularPolygon')[0];
      })
      .shuffle()
      .value();

    timeline
      .to(game.playerTurnIndicator, 0.5, {
        setY: (playerId === 1 ? 0 : (800 - 170)),
        setOpacity: 1.0,
        ease: Expo.easeOut
      });

    timeline
      .staggerTo(newPlayerEntities, 0.3, {
        setStrokeWidth: 3,
        //setScaleX: 1.0,
        //setScaleY: 1.0,
        setShadowOpacity: 1.0,
        ease: Expo.easeOut
      }, 0.01);
  });

  game.layer = hexLayer;

  window.game = game;
}
