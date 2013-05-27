var util = require('util'),
    _  = require('underscore'),
    events = require('events');

module.exports = (function () {
  var Map = function(mapData) {

    events.EventEmitter.call(this);

    this.getTiles = function () {
      return _.flatten(mapData);
    }

    this.getTile = function (pos) {
      return mapData[pos.y][pos.x];
    }

    this.setTile = function (pos, data) {
      mapData[pos.y][pos.x] = data;
      // this.emit('tileSet', data, pos);
    }

    this.resetTile = function (pos) {
      this.setTile(pos, {type: 'empty', x: pos.x, y: pos.y});
    }

    this.getAdjacentTiles = function (pos) {
      return this.getTilesWithinRange(pos, 1);
    }

    this.getTilesWithinRange = function (pos, range) {
      return _.filter(this.getTiles(), function(tile) {
        return (Math.abs(tile.x - pos.x) <= range) && (Math.abs(tile.y - pos.y) <= range);
      });
    }
  };

  util.inherits(Map, events.EventEmitter);

  return Map;
}());
