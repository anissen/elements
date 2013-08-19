
var KineticHexMap = Model({
  map: new HexMap.HexMap(),

  settings: null,

  layer: null,

  entities: {},

  playerTurnIndicator: null,

  selectedTile: null,

  setupBoard: function(state, settings) {
    var desktop = {
      hexRadius: 64,
      hexMargin: 8,
      marginLeft: 30,
      marginTop: 20 + 210 /* to fit top hand */,
      fill: 'rgb(0, 200, 255)',
      stroke: '1C75BC',
      tileStrokeWidth: 2,
      tileFontSize: 12,
      entityStrokeWidth: 3,
      entitySelectedStrokeWidth: 8,
      entityFontSize: 16
    };
    var mobile = {
      hexRadius: 40,
      hexMargin: 0,
      marginLeft: 10,
      marginTop: 130,
      fill: 'rgb(0, 200, 255)',
      stroke: '1C75BC',
      tileStrokeWidth: 0,
      tileFontSize: 8,
      entityStrokeWidth: 0,
      entitySelectedStrokeWidth: 5,
      entityFontSize: 12
    };
    var s = this.settings = _.defaults(settings || {}, desktop);

    this.playerTurnIndicator = new Kinetic.Rect({
      x: -100,
      y: 0,
      height: 170,
      width: 1000,
      fill: 'c5c5c5',
      opacity: 0.0,
      shadowColor: 'grey',
      shadowBlur: 500
    });

    this.layer.add(this.playerTurnIndicator);

    var me = this;
    var tiles = [];
    var hexHeight = s.hexRadius * 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((hexHeight + s.hexMargin) / 2) + s.marginTop;

    for (var playerId = 0; playerId < state.players.length; playerId++) {
      for (var i = 0; i < 5; i++) {
        var r = (playerId === 1 ? -2 : 4);
        var q = i - Math.floor(r / 2);
        var key = q + ',' + r;
        /*
        console.log(key, { entity: state.players[playerId].hand[i] || null });
        var entity = state.players[playerId].hand[i];
        if (entity) {
          entity.hex = key;
          state.board[key] = { entity: entity };
        } else {
          state.board[key] = { entity: null };
        }*/
        state.board[key] = { entity: state.players[playerId].hand[i] || null };
      }
    }

    for(var key in state.board) {
      var tile = state.board[key];
      var hex = HexMap.Hex.fromString(key);
      var x = hex.q + Math.floor(hex.r / 2);
      var y = hex.r;
      var type = (tile.entity ? tile.entity.type : 'empty');
      var passable = (!tile.entity);
      var player = (tile.entity ? tile.entity.player : -1);

      var tileGroup = new Kinetic.Group({
        x: marginLeft + x * (hexWidth + s.hexMargin) + (y % 2) * (hexWidth + s.hexMargin) / 2,
        y: marginTop + y * (hexHeight - (hexHeight / 4) + s.hexMargin),
        hex: key
      });

      var text = new Kinetic.Text({
        align: 'center',
        text: '(' + key + ')',
        fontSize: s.tileFontSize,
        fontFamily: 'Verdana',
        fill: 'grey'
      });

      text.setOffset({
        x: text.getWidth() / 2,
        y: text.getHeight() / 2
      });

      var tileHex = new Kinetic.RegularPolygon({
        sides: 6,
        radius: s.hexRadius,
        fill: 'rgb(255, 255, 240)',
        originalFill: 'rgb(255, 255, 240)',
        stroke: 'gray',
        originalStroke: 'gray',
        strokeWidth: s.tileStrokeWidth,
        originalStrokeWidth: s.tileStrokeWidth
      });

      tileGroup.add(tileHex);
      tileGroup.add(text);

      tileGroup.on('mouseover', function() {
        me.trigger('enter', this);
      });

      tileGroup.on('mouseout', function() {
        me.trigger('leave', this);
      });

      tileGroup.on('click touchstart', function() {
        if (!me.selectedTile)
          return;

        me.trigger('move', { 
          fromData: me.map.get(me.selectedTile.attrs.hex), 
          toData: me.map.get(this.attrs.hex) 
        });

        // TODO: Clean up this function!

        var fromHex = me.selectedTile.attrs.hex;
        me.selectedTile.attrs.hex = this.attrs.hex;

        var toData = me.map.get(this.attrs.hex);
        toData.entity = me.selectedTile;
        toData.type = 'unit';
        //me.map.set(this.attrs.hex, toData);
        
        var fromData = me.map.get(fromHex);
        fromData.entity = null;
        fromData.type = 'empty';
        //me.map.set(fromHex, fromData);

        // Deselect the tile after the action
        me.trigger('deselected', me.selectedTile);
        me.selectedTile = null;
      });
      
      this.layer.add(tileGroup);
      tiles.push(tileGroup);

      this.map.set(key, { 
          player: player, 
          type: type,
          passable: passable,
          tile: tileGroup,
          entity: null
      });
    }

    me.trigger('board-setup', tiles);
  },

  loadState: function(state) {
    this.state = state


    // TODO: Refactor this function!


    //this.layer.destroyChildren();
    var entities = [];
    for(var key in state.board) {
      var tile = state.board[key];
      var oldTile = this.map.get(key);
      
      if (tile.entity && oldTile.entity && tile.entity.type === oldTile.entity.type)
        continue;

      if (!tile.entity) {
        oldTile.player = -1;
        oldTile.type = 'empty';
        oldTile.passable = true;
        if (oldTile.entity)
          oldTile.entity.remove();
        oldTile.entity = null;
      } else {
        oldTile.player = tile.entity.player;
        oldTile.type = tile.entity.type;
        oldTile.passable = false;
        if (oldTile.entity)
          oldTile.entity.remove();
        oldTile.entity = this.createEntity(tile.entity, HexMap.Hex.fromString(key));
        this.layer.add(oldTile.entity);
        this.layer.draw();
      }
    }

    this.trigger('state-loaded', entities);
  },

  getRingData: function(hex, R) {
    var hexes = this.map.getRing(hex, R || 2);
    return this.getTileData(hexes);
  },

  getRangeData: function(hex, rangeStart, rangeEnd) {
    var hexes = this.map.getRange(hex, rangeStart || 1, rangeEnd || 2);
    return this.getTileData(hexes);
  },

  getReachableTilesData: function(hex, movement) {
    var hexes = this.map.getReachableTiles(HexMap.Hex.fromString(hex), movement || 2, function(tile) {
      return tile.entity === null; //passable;
    });
    var hexIds = _.pluck(hexes, 'id');
    var hexesWithoutStart = _.reject(hexIds, function(H) {
      return H === hex;
    });
    return this.getTileData(hexesWithoutStart);
  },

  getTileData: function(hexes) {
    return _.chain(hexes)
      .map(this.getTile)
      .compact()
      .value();
  },

  getTile: function(hex) {
    var data = this.map.get(hex);
    if (!data)
      return null;
    return data.tile;
  },

  move: function(entityId, targetHex) {
    var entity = this.getEntityFromId(entityId);

    var source = this.map.get(entity.attrs.hex);
    var destination = this.map.get(targetHex);
    console.log('move', entity);
    
    this.trigger('move', { 
      fromData: source, 
      toData: destination,
      callback: function() {
        //console.log('oncomplete callback triggered!');
        source.entity = null;
        destination.entity = entity;
        entity.attrs.hex = targetHex;
        //callback();
      }
    });
  },

  attack: function(cardId, targetId) {
    var attacker = this.getEntityFromId(cardId);
    var target = this.getEntityFromId(targetId);

    this.trigger('attack', {
      fromData: attacker,
      toData: target
    });
  },

  play: function(cardId, targetHex) {
    var entity = this.entities[cardId];
    var target = this.map.get(targetHex);
    target.entity = entity;

    this.trigger('play-card', { card: entity, target: target });
  },

  endturn: function() {
    this.trigger('turn-ended', this.state.currentPlayer);
    this.state.currentPlayer = (this.state.currentPlayer + 1) % this.state.players.length;
    this.trigger('turn-started', this.state.currentPlayer);

    if (this.state.currentPlayer !== 0) // HACK HACK HACK HACK
      return;

    var library = this.state.players[this.state.currentPlayer].library;
    var newCard = library.splice(0,1)[0];
    if (!newCard)
      return;

    var newCardEntity = this.createEntity(newCard, HexMap.Hex(2,4));
    this.layer.add(newCardEntity);
    this.trigger('draw-card', newCardEntity);
  },

  getEntityFromId: function(cardId) {
    return this.entities[cardId];
  },

  createEntity: function(card, hex) {
    var s = this.settings;
    var hexHeight = s.hexRadius * 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((hexHeight + s.hexMargin) / 2) + s.marginTop;

    var x = hex.q + Math.floor(hex.r / 2);
    var y = hex.r;

    var entity = new Kinetic.RegularPolygon({
      sides: 6,
      radius: s.hexRadius,
      fill: (card.player === 0 ? s.fill : '#FF8000'),
      originalStroke: (card.player === 0 ? s.stroke : 'orangered'),
      stroke: (card.player === 0 ? s.stroke : 'orangered'),
      strokeWidth: s.entityStrokeWidth,
      originalStrokeWidth: s.entityStrokeWidth,
      shadowColor: (card.player === 0 ? s.fill : '#FF8000'),
      shadowBlur: 20,
      shadowOpacity: 0.0
    });

    // HACK for customizing energy hex
    if (card.type === 'energy') {
      entity.attrs.fill = 'gold';
      entity.attrs.originalFill = 'gold';
      entity.attrs.strokeWidth = s.entityStrokeWidth * 2;
      entity.attrs.originalStrokeWidth = s.entityStrokeWidth * 2;
    }

    var nameLabel = new Kinetic.Text({
      align: 'center',
      width: hexWidth,
      text: card.name,
      fontSize: s.entityFontSize,
      fontFamily: 'Verdana',
      fill: 'black'
    });

    nameLabel.setOffset({
      x: nameLabel.getWidth() / 2,
      y: nameLabel.getHeight()
    });
    
    var idLabel = new Kinetic.Text({
      align: 'center',
      text: card.id,
      fontSize: 12,
      fontFamily: 'Verdana',
      fill: 'grey'
    });

    idLabel.setOffset({
      x: idLabel.getWidth() / 2,
      y: -idLabel.getHeight()
    });
    
    var entityGroup = new Kinetic.Group({
      x: marginLeft + x * (hexWidth + s.hexMargin) + (y % 2) * (hexWidth + s.hexMargin) / 2,
      y: marginTop + y * (hexHeight - (hexHeight / 4) + s.hexMargin),
      id: card.id,
      player: card.player,
      hex: hex.id
    });

    entityGroup.add(entity);
    entityGroup.add(nameLabel);
    entityGroup.add(idLabel);

    var me = this;
    entityGroup.on('mouseover', function() {
      me.trigger('enter', this);
    });

    entityGroup.on('mouseout', function() {
      me.trigger('leave', this);
    });

    entityGroup.on('click touchstart', this.onEntityClick);

    this.entities[card.id] = entityGroup;

    return entityGroup;
  },

  onEntityClick: function(evt) {
    var clickedGroup = evt.targetNode.parent;

    if (!this.selectedTile) {
      this.trigger('selected', clickedGroup);
      this.selectedTile = clickedGroup;
    } else {
      // deselect selected tile
      if (clickedGroup === this.selectedTile) {
        this.trigger('deselected', clickedGroup);
        this.selectedTile = null;
      } else {
        this.trigger('attack', { 
          fromData: this.map.get(this.selectedTile.attrs.hex), 
          toData: this.map.get(this.attrs.hex) 
        });
        // Deselect the tile after the action
        this.trigger('deselected', this.selectedTile);
        this.selectedTile = null;
      }
    }
  },

  playAction: function(actionName, cardId, targetHex) {
    this[actionName](cardId, targetHex);
  },

  playActionList: function(actions) {
    var me = this;
    var i = 0;
    _.each(actions, function(action) {
      setTimeout(function() { // Hack to avoid storing movement data before the hex state is updated
        me.playAction(action.type, action.card, action.target);
      }, 1000 * (i++));
    });
  }
});
