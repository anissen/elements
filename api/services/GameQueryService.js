
var GameInstance = require('./../game/game'),
    _ = require('underscore');

// proposed API:
/*

GameQueryService.query(state)
  .units()
  .where(function(unit) { 
    return unit.life <= 2;
  });

GameQueryService.query(state)
  .tiles()
  .ownedByPlayer(0)
  .withinRangeOf(2, '2,2');

*/


exports.query = function(state) {

  var queryObj = {};

  queryObj.units = function () {
    this.values = _.filter(state.board, function (tile) {
      return tile.entity && tile.entity.type === 'unit';
    });

    return this;
  };

  queryObj.energy = function () {
    this.values = _.filter(state.board, function (tile) {
      return tile.entity && tile.entity.type === 'energy';
    });

    return this;
  };

  queryObj.ownedByPlayer = function (player) {
    this.values = _.filter(this.values, function (tile) {
      return tile.entity && tile.entity.player === player;
    });
    
    return this;
  };

  queryObj.result = function () {
    return this.values;
  };

  return queryObj;
};
