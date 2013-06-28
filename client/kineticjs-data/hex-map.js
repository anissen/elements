
// TODO: Implement a clone constructor

function Hex(q, r) {
  var hex = {};
  hex.q = q;
  hex.r = r;
  hex.id = q + ',' + r;
  
  hex.scale = function(s) {
    return Hex(q * s, r * s);
  };

  hex.add = function(h) {
    return Hex(q + h.q, r + h.r);
  };

  hex.clone = function() {
    return Hex(q, r);
  }

  return hex;
};

function HexMap() {
  var me = this;
  this.map = {};

  this.set = function(hex, data) {
    this.map[hex.id] = data;
  };

  this.get = function(hex) {
    return this.map[hex.id];
  };

  this.swap = function(hex1, hex2) {
    var hex1Data = this.get(hex1);
    var hex2Data = this.get(hex2);
    this.set(hex1, hex2Data);
    this.set(hex2, hex1Data);
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
    visited[hex.id] = hex;
    var fringes = [[hex]];
    for (var k = 0; k < movement; k++) {
      fringes[k + 1] = [];
      fringes[k].forEach(function(H) {
        for (var dir = 0; dir < 6; dir++) {
          var neighbor = H.add(me.getDirection(dir));
          var neighborData = me.get(neighbor);
          if (!neighborData) {
            // Ensure that tiles outside the view are not considered again
            visited[neighbor.id] = neighbor;
          } else if (!visited[neighbor.id] && (passableFunc && passableFunc(neighborData))) {
            visited[neighbor.id] = neighbor;
            fringes[k + 1].push(neighbor);
          }
        }
      });
    }
    return _.values(visited);
  };
}
