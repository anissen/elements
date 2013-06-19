
var KineticHexMap = Model({
  map: new HexMap(),

  initialize: function(width, height, layer, settings) {
    this.map.initializeMap(width, height);

    var s = _.defaults(settings || {}, {
      hexHeight: 128,
      hexMargin: 5,
      marginLeft: 30,
      marginTop: 20,
      fill: 'rgb(0, 200, 255)',
      stroke: '1C75BC'
    });

    var me = this;
    var hexagons = [];
    //var hexHeight = 128;
    var hexRadius = s.hexHeight / 2;
    var hexWidth = (Math.sqrt(3) / 2) * s.hexHeight;
    //var hexMargin = 5;
    var marginLeft = ((hexWidth + s.hexMargin) / 2) + s.marginLeft;
    var marginTop  = ((s.hexHeight + s.hexMargin) / 2) + s.marginTop;
    var selectedHexagon = null;
    var neighborHexagons = [];
    for(var i = 0; i < width; i++){
      for(var j = 0; j < height; j++){
        var index = i * height + j;
        var hex = Hex(-Math.floor(j/2) + i, j);
        var tileData = (this.map.getMapData(hex));
        hexagons[index] = new Kinetic.RegularPolygon({
          x: marginLeft + i * (hexWidth + s.hexMargin) + (j % 2) * (hexWidth + s.hexMargin) / 2,
          y: marginTop + j * (s.hexHeight - (s.hexHeight / 4) + s.hexMargin),
          sides: 6,
          radius: hexRadius,
          fill: s.fill, //(tileData.player === 0 ? 'rgb(0, 200, 255)' : '#FF8000'),
          stroke: s.stroke, //(tileData.player === 0 ? '1C75BC' : 'orangered'),
          strokeWidth: 3,
          opacity: (tileData.passable ? 1.0 : 0.15),
          scaleX: 0.8,
          scaleY: 0.8,
          hex: hex
        });

        this.map.setTile(hexagons[index].attrs.hex, hexagons[index]);

        hexagons[index].on('mouseover touchstart', function() {
          me.trigger('enter', this);
        });

        hexagons[index].on('mouseout touchend', function() {
          me.trigger('leave', this);
        });

        hexagons[index].on('click', function() {
          me.trigger('click', this);
        });
        
        layer.add(hexagons[index]);
      }
    }

    me.trigger('initialized', hexagons);
  },

  getRingData: function(hex, R) {
    var ringHexes = this.map.getRing(hex, R);
    return this.getTileData(ringHexes);
  },

  getRangeData: function(hex) {
    var ringHexes = this.map.getRange(hex, 1, 2);
    return this.getTileData(ringHexes);
  },

  getReachableTilesData: function(hex) {
    var reachableHexes = this.map.getReachableTiles(hex, 2, function(tile) {
      return tile.passable;
    });
    return this.getTileData(reachableHexes);
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
