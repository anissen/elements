
var GameActions = require('./../game/game'),
    _ = require('underscore');

exports.validateAction = function(gameState, action) {
  var gameActions = new GameActions(gameState);
  var validActions = gameActions.getPossibleActions();

  return _.some(validActions, function(validAction) {
    console.log(validAction);
    return _.isEqual(validAction, action);
  });
};
