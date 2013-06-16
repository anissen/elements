
var Hex = function(q, r) {
  var hex = {};
  hex.q = q;
  hex.r = r;
  hex.toString = function() {
    return '(q: ' + q + ', r: ' + r + ')';
  }
  return hex;
};

function createHexMapData(height, width) {
  var me = this;
  this.hexData = new Array(height);

  this.setMapData = function(hex, data) {
    me.hexData[hex.r][Math.floor(hex.r / 2) + hex.q] = data;
  };

  this.setTile = function(hex, tile) {
    var mapData = getMapData(hex);
    if (!mapData)
      return;
    mapData.tile = tile;
  };

  this.getTile = function(hex) {
    var mapData = getMapData(hex);
    if (!mapData)
      return null;
    return mapData.tile;
  };

  this.getMapData = function(hex) {
    if (hex.r < 0 || hex.r >= me.hexData.length)
      return null;
    var correctedQ = Math.floor(hex.r / 2) + hex.q;
    if (correctedQ < 0 || correctedQ >= me.hexData[hex.r].length)
      return null;
    return me.hexData[hex.r][correctedQ];
  };

  this.getNeighbor = function(hex, direction) {
    var neighbors =  [
        [+1,  0],  [+1, -1],  [ 0, -1],
        [-1,  0],  [-1, +1],  [ 0, +1] 
    ];
    var d = neighbors[direction];
    return Hex(hex.q + d[0], hex.r + d[1]);
  };

  this.getRing = function(hex) {
    var R = 1;
    var H = getNeighbor(hex, 4); //direction(4).scale(R);
    var results = [];
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < R; j++) {
        results.push(H);
        H = getNeighbor(H, i);
      }
    }
    return results;
  };

  this.getRingData = function(hex) {
    var ringHexes = getRing(hex);
    var tileData = _.map(ringHexes, function(hex) {
      return me.getTile(hex);
    });
    return _.compact(tileData);
  };

  // In the worst case, the array is twice as wide as neccessary
  var qStart = -Math.floor(width / 2);
  var qEnd = Math.floor(width * 1.5);
  for(var r = 0; r < height; r++) {
    this.hexData[r] = new Array(width * 2);
    for(var q = qStart; q < qEnd; q++) {
      this.setMapData(Hex(q, r), { player: 0 /*(r < height / 2 ? 1 : 0)*/, tile: null });
    }
  }

  return this;
}
