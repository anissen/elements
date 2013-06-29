
var KineticHexMap = Model({
  map: new HexMap.HexMap(),

  selectedTile: null,

  initialize: function(width, height, layer, settings) {
    //this.map.initializeMap(width, height);

    var s = _.defaults(settings || {}, {
      hexRadius: 64,
      hexMargin: 5,
      marginLeft: 30,
      marginTop: 20,
      fill: 'rgb(0, 200, 255)',
      stroke: '1C75BC'
    });

    var me = this;
    var tiles = [];
    var board = [];
    var hexHeight = s.hexRadius * 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((hexHeight + s.hexMargin) / 2) + s.marginTop;

    for(var i = 0; i < width; i++) {
      for(var j = 0; j < height; j++) {
        var index = i * height + j;
        var hex = HexMap.Hex(-Math.floor(j/2) + i, j);
        var type = (Math.random() < 0.3 ? 'unit' : 'empty');
        var passable = true;
        var player = (Math.random() < 0.7 ? 0 : 1);
        var tile = new Kinetic.RegularPolygon({
          x: marginLeft + i * (hexWidth + s.hexMargin) + (j % 2) * (hexWidth + s.hexMargin) / 2,
          y: marginTop + j * (hexHeight - (hexHeight / 4) + s.hexMargin),
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
          hex: hex
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

          var fromHex = me.selectedTile.attrs.hex.clone();
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

        var unit = null;
        if (type === 'unit') {
          unit = new Kinetic.RegularPolygon({
            x: marginLeft + i * (hexWidth + s.hexMargin) + (j % 2) * (hexWidth + s.hexMargin) / 2,
            y: marginTop + j * (hexHeight - (hexHeight / 4) + s.hexMargin),
            sides: 6,
            radius: s.hexRadius,
            fill: (player === 0 ? s.fill : '#FF8000'),
            originalStroke: (player === 0 ? s.stroke : 'orangered'),
            stroke: (player === 0 ? s.stroke : 'orangered'),
            strokeWidth: 3,
            originalStrokeWidth: 3,
            opacity: 1.0,
            scaleX: 0.8,
            scaleY: 0.8,
            hex: hex
          });

          unit.on('mouseover touchstart', function() {
            me.trigger('enter', this);
          });

          unit.on('mouseout touchend', function() {
            me.trigger('leave', this);
          });

          unit.on('click', function() {
            if (!me.selectedTile) {
              me.trigger('selected', this)
              me.selectedTile = this;
            } else {
              // deselect selected tile
              if (this === me.selectedTile) {
                me.trigger('deselected', this);
                me.selectedTile = null;
              } else {
                me.trigger('attack', { 
                  fromData: me.map.get(me.selectedTile.attrs.hex), 
                  toData: me.map.get(this.attrs.hex) 
                });
                // Deselect the tile after the action
                me.trigger('deselected', me.selectedTile);
                me.selectedTile = null;
              }
            }
          });

          layer.add(unit);
          board.push(unit);
        }

        this.map.set(hex, { 
            player: player, 
            type: type,
            passable: passable,
            tile: tile,
            unit: unit
        });
      }
    }

    me.trigger('initialized', tiles);
    me.trigger('initialized', board);
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
  }
});
