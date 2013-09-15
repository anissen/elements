
var _ = _ || require('underscore');

(function(exports, _){

var Hex = function(q, r) {
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
  };

  return hex;
};

Hex.fromString = function(str) {
  var parts = str.split(',');
  return Hex(parseInt(parts[0]), parseInt(parts[1]));
};

function HexMap(data) {
  var me = this;
  this.map = data || {};

  this.set = function(key, data) {
    this.map[key] = data;
  };

  this.get = function(key) {
    return this.map[key];
  };

  this.getKeys = function() {
    return _.keys(this.map);
  };

  this.getValues = function() {
    return _.values(this.map);
  };

  this.getValuesWithKeys = function(keyName) {
    keyName = keyName || 'key';
    return _.map(this.map, function(value, key) {
      return _.extend(value, {'key': key});
    });
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
          var neighborData = me.get(neighbor.id);
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

  this.toString = function(tileRepresentationFunc) {
    var coords = _.chain(this.getKeys())
      .map(function(key) {
        var parts = key.split(',');
        return { x: parseInt(parts[0]), y: parseInt(parts[1]) };
      })
      .value();

    var xs = _.pluck(coords, 'x');
    var ys = _.pluck(coords, 'y');
    var minX = _.min(xs);
    var maxX = _.max(xs);
    var minY = _.min(ys);
    var maxY = _.max(ys);

    var mapStr = '\n';
    for (var y = minY - 1; y < minY; y++) {
      for (var x = minX; x <= maxX; x++) {
        mapStr += (x === minX || minY < 0 ? '  ' : '') + ' ' + (x < 0 ? x : ' ' + x);
      }
      mapStr += '\n';
    }

    for (var y = minY; y <= maxY; y++) {
      mapStr += (y < 0 ? y : ' ' + y) + ' ';
      for (var x = minX; x <= maxX; x++) {
        var tile = this.get(x + ',' + y);
        mapStr += (!tile ? '   ' : '[' + tileRepresentationFunc(tile) + ']');
      }
      mapStr += '\n';
    }

    return mapStr;
  };
}

exports.Hex = Hex;
exports.HexMap = HexMap;

})(
  (typeof exports === 'undefined' ? (this['HexMap'] = {}) : exports),
  _
);
