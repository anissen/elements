
var KineticHexMap = Model({
  map: new HexMap.HexMap(),

  settings: null,

  layer: null,

  entities: [],

  selectedTile: null,

  setupBoard: function(board, settings) {
    var s = this.settings = _.defaults(settings || {}, {
      hexRadius: 64,
      hexMargin: 5,
      marginLeft: 30,
      marginTop: 20,
      fill: 'rgb(0, 200, 255)',
      stroke: '1C75BC'
    });

    var me = this;
    var tiles = [];
    var hexHeight = s.hexRadius * 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((hexHeight + s.hexMargin) / 2) + s.marginTop;

    for(var key in board) {
      //var index = y * height + x;
      //var hex = HexMap.Hex(-Math.floor(y/2) + x, y);
      var tile = board[key];
      var hex = HexMap.Hex.fromString(key);
      var x = hex.q + Math.floor(hex.r / 2);
      var y = hex.r;
      var type = (tile.entity ? tile.entity.type : 'empty');
      var passable = (!tile.entity);
      var player = (tile.entity ? tile.entity.player : -1);
      var tileHex = new Kinetic.RegularPolygon({
        x: marginLeft + x * (hexWidth + s.hexMargin) + (y % 2) * (hexWidth + s.hexMargin) / 2,
        y: marginTop + y * (hexHeight - (hexHeight / 4) + s.hexMargin),
        sides: 6,
        radius: s.hexRadius,
        fill: 'rgb(255, 255, 240)', // (passable ? 'rgb(255, 255, 240)' : 'gray'),
        originalFill: 'rgb(255, 255, 240)', // (passable ? 'rgb(255, 255, 240)' : 'gray'),
        stroke: 'gray', //(passable ? 'gray' : 'black'), 
        originalStroke: 'gray', //(passable ? 'gray' : 'black'),
        strokeWidth: 2,
        originalStrokeWidth: 2,
        opacity: 1.0,
        scaleX: 0.8,
        scaleY: 0.8,
        hex: key
      });

      tileHex.on('mouseover touchstart', function() {
        me.trigger('enter', this);
      });

      tileHex.on('mouseout touchend', function() {
        me.trigger('leave', this);
      });

      tileHex.on('click', function() {
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
      
      this.layer.add(tileHex);
      tiles.push(tileHex);

      this.map.set(key, { 
          player: player, 
          type: type,
          passable: passable,
          tile: tileHex,
          entity: null
      });
    }

    me.trigger('initialized', tiles);
  },

  loadState: function(state) {
    this.state = state

    //this.layer.destroyChildren();
    var entities = [];
    for(var key in state.board) {
      var tile = state.board[key];
      var oldTile = this.map.get(key);
      
      if (tile.entity && oldTile.entity && tile.entity.type === oldTile.entity.type)
        continue;

      //var thehex = HexMap.Hex.fromString(key);
      //var hex = HexMap.Hex(-Math.floor(thehex.r/2) + thehex.q, thehex.r);
      //var tile = this.map.get(key);

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
        oldTile.entity = this.createEntity(tile.entity.type, HexMap.Hex.fromString(key), tile.entity.id);
        this.layer.add(oldTile.entity);
        this.layer.draw();
        entities.push(oldTile.entity);
      }
    }

    this.trigger('initialized', entities);
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
    var hexes = this.map.getReachableTiles(hex, movement || 2, function(tile) {
      return tile.type === 'empty';
    });
    var hexesWithoutStart = _.reject(hexes, function(H) {
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

    console.log(entityId, entity, targetHex);
    var source = this.map.get(entity.attrs.hex);
    var destination = this.map.get(targetHex);
    console.log('destination', destination);
    
    this.trigger('move', { 
      fromData: source, 
      toData: destination /*,
      callback: function() {
        //console.log('oncomplete callback triggered!');
        source.entity = null;
        destination.entity = entity;
        entity.attrs.hex = targetHex;
        callback();
      } */
    });
  },

  attack: function(cardId, targetHex) {
    var attacker = this.getEntityFromId(cardId);

    this.trigger('attack', { 
      fromData: this.map.get(attacker.attrs.hex), 
      toData: this.map.get(targetHex) 
    });
  },

  play: function(cardId, targetHex) {
    //if (cardId === 'unit') {
    var cardsInHand = _.values(this.state.players[this.state.currentPlayer].hand);
    var card = _.find(cardsInHand, function (cardInHand) {
      return cardInHand.id === cardId;
    });

    var player = card.player; // Math.floor(Math.random() * 2);
    var entity = this.createEntity(player, HexMap.Hex.fromString(targetHex), cardId);
    var mapData = this.map.get(targetHex);

    mapData.player = player;
    mapData.entity = entity;
    mapData.type = 'unit';

    this.entities.push(entity);

    this.layer.add(entity);
    this.trigger('play-entity', mapData);
    //}
  },

  getEntityFromId: function(cardId) {
    return _.find(this.entities, function(entity) {
      return entity.attrs.id === cardId;
    });
  },

  createEntity: function(player, hex, cardId) {
    var s = this.settings;
    var hexHeight = s.hexRadius * 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((hexHeight + s.hexMargin) / 2) + s.marginTop;

    var x = hex.q + Math.floor(hex.r / 2);
    var y = hex.r;

    var entity = new Kinetic.RegularPolygon({
      x: marginLeft + x * (hexWidth + s.hexMargin) + (y % 2) * (hexWidth + s.hexMargin) / 2,
      y: marginTop + y * (hexHeight - (hexHeight / 4) + s.hexMargin),
      sides: 6,
      radius: s.hexRadius,
      fill: (player === 0 ? s.fill : '#FF8000'),
      originalStroke: (player === 0 ? s.stroke : 'orangered'),
      stroke: (player === 0 ? s.stroke : 'orangered'),
      strokeWidth: 3,
      originalStrokeWidth: 3,
      opacity: 1.0,
      //scaleX: 0.8,
      //scaleY: 0.8,
      id: cardId,
      player: player,
      hex: hex.id
    });

    var me = this;
    entity.on('mouseover touchstart', function() {
      me.trigger('enter', this);
    });

    entity.on('mouseout touchend', function() {
      me.trigger('leave', this);
    });

    entity.on('click', this.onEntityClick);

    return entity;
  },

  onEntityClick: function(evt) {
    if (!this.selectedTile) {
      this.trigger('selected', evt.targetNode)
      this.selectedTile = evt.targetNode;
    } else {
      // deselect selected tile
      if (evt.targetNode === this.selectedTile) {
        this.trigger('deselected', evt.targetNode);
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

  doAction: function(actionName, cardId, targetHex) {
    //if (typeof targetHex === 'string')
    //    targetHex = HexMap.Hex.fromString(targetHex);

    this[actionName](cardId, targetHex);
  },

  doActionList: function(actions) {
    var me = this;
    var i = 0;
    _.each(actions, function(action) {
      setTimeout(function() { // Hack to avoid storing movement data before the hex state is updated
        me.doAction(action.type, action.card, action.target);
      }, 1000 * (i++));
    });
  }
});
