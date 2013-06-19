
function Hex(q, r) {
  var hex = {};

  hex.q = q;
  hex.r = r;

  hex.toString = function() {
    return '(q: ' + q + ', r: ' + r + ')';
  };
  
  hex.scale = function(s) {
    return Hex(q * s, r * s);
  };

  hex.add = function(h) {
    return Hex(q + h.q, r + h.r);
  };

  return hex;
};

function HexMap() {
  var me = this;

  this.setMapData = function(hex, data) {
    this.hexData[hex.r][Math.floor(hex.r / 2) + hex.q] = data;
  };

  this.setTile = function(hex, tile) {
    var mapData = this.getMapData(hex);
    if (!mapData)
      return;
    mapData.tile = tile;
  };

  this.getTile = function(hex) {
    var mapData = this.getMapData(hex);
    if (!mapData)
      return null;
    return mapData.tile;
  };

  this.getMapData = function(hex) {
    if (hex.r < 0 || hex.r >= this.hexData.length)
      return null;
    var correctedQ = Math.floor(hex.r / 2) + hex.q;
    if (correctedQ < 0 || correctedQ >= this.hexData[hex.r].length)
      return null;
    return this.hexData[hex.r][correctedQ];
  };

  this.getDirection = function(direction) {
    var neighbors = [
        Hex(+1,  0), Hex(+1, -1), Hex( 0, -1),
        Hex(-1,  0), Hex(-1, +1), Hex( 0, +1)
    ];
    return neighbors[direction];
  };

  this.getNeighbor = function(hex, direction) {
    var directionHex = this.getDirection(direction);
    return hex.add(directionHex);
  };

  this.getRing = function(hex, R) {
    var H = hex.add(this.getDirection(4).scale(R));
    var results = [];
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < R; j++) {
        results.push(H);
        H = this.getNeighbor(H, i);
      }
    }
    return results;
  };

  this.getRange = function(hex, rStart, rEnd) {
    var results = [];
    for (var R = rStart; R <= rEnd; R++) {
      results.push(this.getRing(hex, R));
    }
    return _.flatten(results);
  };

  this.getReachableTiles = function(hex, movement, passableFunc) {
    var visited = {};
    visited[hex.toString()] = hex;
    var fringes = [[hex]];
    for (var k = 0; k < movement; k++) {
      fringes[k + 1] = [];
      fringes[k].forEach(function(H) {
        for (var dir = 0; dir < 6; dir++) {
          var neighbor = H.add(me.getDirection(dir));
          var neighborData = me.getMapData(neighbor);
          if (!neighborData) {
            // Ensure that tiles outside the view are not considered again
            visited[neighbor.toString()] = neighbor;
          } else if (!visited[neighbor.toString()] && passableFunc(neighborData)) {
            visited[neighbor.toString()] = neighbor;
            fringes[k + 1].push(neighbor);
          }
        }
      });
    }
    return _.values(visited);
  };

  this.initializeMap = function(width, height) {
    this.hexData = new Array(height);

    // In the worst case, the array is twice as wide as neccessary
    var qStart = -Math.floor(width / 2);
    var qEnd = Math.floor(width * 1.5);
    for(var r = 0; r < height; r++) {
      this.hexData[r] = new Array(width * 2);
      for(var q = qStart; q < qEnd; q++) {
        this.setMapData(Hex(q, r), { 
          player: 0, 
          passable: (Math.random() < 0.9), 
          tile: null
        });
      }
    }

    return this;
  }
}
