
var GameActions = require('./gameactions'),
    _ = require('underscore'),
    util = require('util'),
    mongoose = require('mongoose');


// --------

// var databaseConnectionString = process.env.ELEMENTS_MONGODB_CONNECTION_STRING || 'mongodb://localhost/elements';
// mongoose.connect(databaseConnectionString);
// console.log('Database string: ' + databaseConnectionString);

var gameSchema = mongoose.Schema({
  actions: [{ action: String, data: mongoose.Schema.Types.Mixed }]
});

var GameModel = mongoose.model('games', gameSchema);


// --------

module.exports = (function () {

  var module = {};

  module.performAction = function(game, eventData, callback) {
    var state = playEventsOnState(game, game.actions);

    var gameActions = new GameActions(state);
    var possibleActions = gameActions.getPossibleActions();

    var actionLegal = _.some(possibleActions, function(action) {
      return _.isEqual(eventData, action);
    });

    var result = { success: actionLegal };
    if (!actionLegal) {
      result.message = 'Invalid action: ' + JSON.stringify(eventData);
      callback(result);
      return;
    }

    game.persistAction(eventData);

    // HACK:
    if (eventData.action === 'endTurn') {
      var nextPlayer = state.players[(state.currentPlayer+1)%state.players.length];
      if (nextPlayer.type === 'ai')
        takeTurnByAI(game);
    }

    callback(result);
  };

  function takeTurnByAI(game) {
    console.log('AI considering actions...');

    var aiActions = [];

    while (true) {
      var events = [].concat(game.actions);
      var allEvents = events.concat(aiActions);
      var state = playEventsOnState(game, allEvents);
      var gameActions = new GameActions(state);
      var initialStateValue = gameActions.getStateValue();
      var possibleActions = gameActions.getPossibleActionsWithoutEndTurn();
      var endTurnAction = { action: 'endTurn', data: {} };

      if (possibleActions.length === 0) {
        console.log('AI: No more possible actions');
        aiActions.push(endTurnAction);
        break;
      }

      _.each(possibleActions, function(action) {
        action.value = getValueForAction(game, action) - initialStateValue;
      });

      var action = _.max(possibleActions, function(action) {
        return action.value;
      });

      if (!action || action.value <= 0)
        action = endTurnAction;

      console.log('AI: Chose action: ' + action.action); //util.inspect(action));
      aiActions.push(action);
      if (action.action === 'endTurn')
        break;
    }

    for (var i = 0; i < aiActions.length; i++) {
      game.persistAction(aiActions[i]);
    };
  }

  function getValueForAction(game, action) {
    var tempState = playEventsOnState(game, [action]);
    var gameActions = new GameActions(tempState);
    var value = gameActions.getStateValue();
    return value;
  }

  function playEventsOnState(state, actions) {
    var newState = clone(state);
    var gameActions = new GameActions(newState);
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      gameActions[a.action](a.data);
      gameActions.checkWinner();
      newState.actions.push({"player": newState.players[newState.currentPlayer].id, "action": a.action});
      newState.actionCount++;
    }
    return newState;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  module.getGameState = function(game, actionCount, callback) {
    var startTime = (new Date()).getTime();
    var actions = _.first(game.actions, actionCount);
    var state = playEventsOnState(game, actions);

    var endTime = (new Date()).getTime();
    var timeDiff = endTime - startTime;
    var timePerEvent = (actions.length === 0 ? '0' : (timeDiff / actions.length).toFixed(2));
    console.log('[getGameState] Elapsed time: ' + timeDiff + ' ms. for ' + actions.length + ' actions (' + timePerEvent + ' ms./event)');
    callback(state);
  };

  return module;

}());

