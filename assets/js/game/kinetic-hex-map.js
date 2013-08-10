
var KineticHexMap = Model({
  map: new HexMap.HexMap(),

  settings: null,

  layer: null,

  units: [],

  selectedTile: null,

  initialize: function(width, height, layer, settings) {
    this.layer = layer;

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

    for(var x = 0; x < width; x++) {
      for(var y = 0; y < height; y++) {
        var index = y * height + x;
        var hex = HexMap.Hex(-Math.floor(y/2) + x, y);
        var type = (Math.random() < 0.3 ? 'unit' : 'empty');
        var passable = true;
        var player = (Math.random() < 0.7 ? 0 : 1);
        var tile = new Kinetic.RegularPolygon({
          x: marginLeft + x * (hexWidth + s.hexMargin) + (y % 2) * (hexWidth + s.hexMargin) / 2,
          y: marginTop + y * (hexHeight - (hexHeight / 4) + s.hexMargin),
          sides: 6,
          radius: s.hexRadius,
          fill: (passable ? 'rgb(255, 255, 240)' : 'gray'),
          originalFill: (passable ? 'rgb(255, 255, 240)' : 'gray'),
          stroke: (passable ? 'gray' : 'black'),
          originalStroke: (passable ? 'gray' : 'black'),
          strokeWidth: 2,
          originalStrokeWidth: 2,
          opacity: 1.0,
          scaleX: 0.8,
          scaleY: 0.8,
          hex: x + ',' + y // hex.id
        });

        tile.on('mouseover touchstart', function() {
          me.trigger('enter', this);
        });

        tile.on('mouseout touchend', function() {
          me.trigger('leave', this);
        });

        tile.on('click', function() {
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
          toData.unit = me.selectedTile;
          toData.type = 'unit';
          //me.map.set(this.attrs.hex, toData);
          
          var fromData = me.map.get(fromHex);
          fromData.unit = null;
          fromData.type = 'empty';
          //me.map.set(fromHex, fromData);

          // Deselect the tile after the action
          me.trigger('deselected', me.selectedTile);
          me.selectedTile = null;
        });
        
        layer.add(tile);
        tiles.push(tile);

        this.map.set(hex.id, { 
            player: player, 
            type: type,
            passable: passable,
            tile: tile,
            unit: null
        });
      }
    }

    me.trigger('initialized', tiles);
  },

  loadState: function(state) {
    this.state = state

    //this.layer.destroyChildren();
    var units = [];
    for(var key in state.board) {
      var stateData = state.board[key];
      if (!stateData.entity)
        continue;

      var thehex = HexMap.Hex.fromString(key);
      var hex = HexMap.Hex(-Math.floor(thehex.r/2) + thehex.q, thehex.r);
      var tile = this.map.get(key);
      
      console.log(this.map.toString());

      /*
      var changedType = (stateData.entity && tile.type !== stateData.entity.type);
      if (!changedType)
        continue;
      */

      tile.player = stateData.entity.player;
      tile.type = 'unit';
      tile.passable = false;

      if (!stateData.entity) {
        if (tile.unit)
          tile.unit.remove();
      } else {
        tile.unit = this.createUnit(stateData.entity.type, hex, stateData.entity.id);
        this.layer.add(tile.unit);
        this.layer.draw();
        units.push(tile.unit);
      }
    }
    this.trigger('initialized', units);
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

  move: function(unitId, targetHex) {
    var unit = this.getUnitFromId(unitId);

    var source = this.map.get(unit.attrs.hex);
    var destination = this.map.get(targetHex);
    this.trigger('move', { 
      fromData: source, 
      toData: destination /*,
      callback: function() {
        //console.log('oncomplete callback triggered!');
        source.unit = null;
        destination.unit = unit;
        unit.attrs.hex = targetHex;
        callback();
      } */
    });
  },

  attack: function(cardId, targetHex) {
    var attacker = this.getUnitFromId(cardId);

    this.trigger('attack', { 
      fromData: this.map.get(attacker.attrs.hex), 
      toData: this.map.get(targetHex) 
    });
  },

  play: function(cardId, targetHex) {
    //if (cardId === 'unit') {
    var cardsOnBoard = _.values(this.state.board);
    var card = _.find(cardsOnBoard, function (boardCard) {
      return boardCard.entity && boardCard.entity.id === cardId;
    });

    var player = card.player; // Math.floor(Math.random() * 2);
    var unit = this.createUnit(player, HexMap.Hex.fromString(targetHex), cardId);
    var mapData = this.map.get(targetHex);

    mapData.player = player;
    mapData.unit = unit;
    mapData.type = 'unit';

    this.units.push(unit);

    this.layer.add(unit);
    this.trigger('play-unit', mapData);
    //}
  },

  getUnitFromId: function(cardId) {
    return _.find(this.units, function(unit) {
      return unit.attrs.id === cardId;
    });
  },

  createUnit: function(player, hex, cardId) {
    var s = this.settings;
    var hexHeight = s.hexRadius * 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((hexHeight + s.hexMargin) / 2) + s.marginTop;

    var x = hex.q + Math.floor(hex.r / 2);
    var y = hex.r;

    var unit = new Kinetic.RegularPolygon({
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
    unit.on('mouseover touchstart', function() {
      me.trigger('enter', this);
    });

    unit.on('mouseout touchend', function() {
      me.trigger('leave', this);
    });

    unit.on('click', this.onUnitClick);

    return unit;
  },

  onUnitClick: function(evt) {
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
