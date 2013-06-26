
var KineticHexMap = Model({
  map: new HexMap(),

  selectedTile: null,

  initialize: function(width, height, layer, settings) {
    this.map.initializeMap(width, height);

    var s = _.defaults(settings || {}, {
      hexRadius: 64,
      hexMargin: 5,
      marginLeft: 30,
      marginTop: 20,
      fill: 'rgb(0, 200, 255)',
      stroke: '1C75BC'
    });

    var me = this;
    var tiles = new Array(width * height);
    var board = new Array(width * height);
    var hexHeight = s.hexRadius * 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((hexHeight + s.hexMargin) / 2) + s.marginTop;

    for(var i = 0; i < width; i++) {
      for(var j = 0; j < height; j++) {
        var index = i * height + j;
        var hex = Hex(-Math.floor(j/2) + i, j);
        var tileData = (this.map.getMapData(hex));
        tiles[index] = new Kinetic.RegularPolygon({
          x: marginLeft + i * (hexWidth + s.hexMargin) + (j % 2) * (hexWidth + s.hexMargin) / 2,
          y: marginTop + j * (hexHeight - (hexHeight / 4) + s.hexMargin),
          sides: 6,
          radius: s.hexRadius,
          fill: (tileData.passable ? 'ivory' : 'gray'),
          originalFill: (tileData.passable ? 'ivory' : 'gray'),
          stroke: (tileData.passable ? 'gray' : 'black'),
          originalStroke: (tileData.passable ? 'gray' : 'black'),
          strokeWidth: 2,
          originalStrokeWidth: 2,
          opacity: 1.0,
          scaleX: 0.8,
          scaleY: 0.8,
          hex: hex
        });

        tiles[index].on('mouseover touchstart', function() {
          me.trigger('enter', this);
        });

        tiles[index].on('mouseout touchend', function() {
          me.trigger('leave', this);
        });

        tiles[index].on('click', function() {
          if (!me.selectedTile)
            return;

          me.trigger('move', { 
            fromData: me.map.getMapData(me.selectedTile.attrs.hex), 
            toData: me.map.getMapData(this.attrs.hex) 
          });
          // Hack to deselect the tile after the action
          me.trigger('deselected', me.selectedTile);
        });
        
        layer.add(tiles[index]);

        if (Math.random() < 0.3) {
          board[index] = new Kinetic.RegularPolygon({
            x: marginLeft + i * (hexWidth + s.hexMargin) + (j % 2) * (hexWidth + s.hexMargin) / 2,
            y: marginTop + j * (hexHeight - (hexHeight / 4) + s.hexMargin),
            sides: 6,
            radius: s.hexRadius,
            fill: (tileData.player === 0 ? s.fill : '#FF8000'),
            originalStroke: (tileData.player === 0 ? s.stroke : 'orangered'),
            stroke: (tileData.player === 0 ? s.stroke : 'orangered'),
            strokeWidth: 3,
            originalStrokeWidth: 3,
            opacity: 1.0,
            scaleX: 0.8,
            scaleY: 0.8,
            hex: hex
          });

          board[index].on('mouseover touchstart', function() {
            me.trigger('enter', this);
          });

          board[index].on('mouseout touchend', function() {
            me.trigger('leave', this);
          });

          board[index].on('click', function() {
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
                  fromData: me.map.getMapData(me.selectedTile.attrs.hex), 
                  toData: me.map.getMapData(this.attrs.hex) 
                });
                // Hack to deselect the tile after the action
                me.trigger('deselected', me.selectedTile);
                me.selectedTile = null;
              }
            }
          });

          layer.add(board[index]);
        }

        this.map.setTile(hex, board[index] || tiles[index]);

      }
    }

    me.trigger('initialized', tiles);
    me.trigger('initialized', _.compact(board));
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
      return tile.passable && tile.player === 0;
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
    return this.map.getTile(hex);
  }
});
