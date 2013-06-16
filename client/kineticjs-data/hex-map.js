
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
    //me.hexData[hex.toString()] = data;
    me.hexData[hex.r][Math.floor(hex.r / 2) + hex.q] = data;
  };

  this.getMapData = function(hex) {
    //return me.hexData[hex.toString()];
    if (hex.r < 0 || hex.r >= me.hexData.length)
      return null;
    var correctedQ = Math.floor(hex.r / 2) + hex.q;
    if (correctedQ < 0 || correctedQ >= me.hexData[hex.r].length)
      return null;
    console.log(hex.toString());
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
      return me.getMapData(hex);
    });
    return _.compact(tileData);
  };

  var arrayWidth = width * 1;
  for(var r = 0; r < height; r++) {
    this.hexData[r] = new Array(arrayWidth);
    for(var q = 0; q < arrayWidth; q++) {
      this.setMapData(Hex(q, r), { player: (r < height / 2 ? 1 : 0) });
    }
  }

  return this;
}