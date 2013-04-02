
var Game = require('./game'),
    GameActions = require('./gameactions'),
    _ = require('underscore'),
    util = require('util'),
    mongoose = require('mongoose');


// --------

var databaseConnectionString = process.env.ELEMENTS_MONGODB_CONNECTION_STRING || 'mongodb://localhost/elements';
mongoose.connect(databaseConnectionString);
console.log('Database string: ' + databaseConnectionString);

var gameSchema = mongoose.Schema({
  id: Number,
  actions: [{ action: String, data: mongoose.Schema.Types.Mixed }]
});

var GameModel = mongoose.model('games', gameSchema);

var storage = require('./storage')({
  Model: GameModel,
  underscore: _
});

// --------


module.exports = (function () {

  var module = {};

  module.performAction = function(eventData, callback) {
    storage.getEvents(function (events) {
      var state = Game.playEvents(events);

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

      storage.persistEvent(eventData);

      // HACK:
      if (eventData.action === 'endTurn') {
        var nextPlayer = state.players[(state.currentPlayer+1)%state.players.length];
        if (nextPlayer.type === 'ai')
          takeTurnByAI();
      }

      callback(result);
    });
  };

  function takeTurnByAI() {

    var generateAIActions = function (events) {
      var aiActions = [];

      while (true) {
        console.log('AI loop');
        var allEvents = events.concat(aiActions);
        var state = Game.playEvents(allEvents);
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
          action.value = getValueForAction(state, action) - initialStateValue;
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

      storage.persistEvents(aiActions);
    };

    storage.getEvents(generateAIActions);
  }

  function getValueForAction(state, action) {
    var tempState = Game.playEvents([action], state);
    var gameActions = new GameActions(tempState);
    var value = gameActions.getStateValue();
    return value;
  }

  module.getGameState = function(actionCount, callback) {
    var startTime = (new Date()).getTime();

    var events = storage.getEvents(function(events) {
      var state = Game.playEvents(events);

      var endTime = (new Date()).getTime();
      var timeDiff = endTime - startTime;
      var timePerEvent = (events.length === 0 ? '0' : (timeDiff / events.length).toFixed(2));
      console.log('[getGameState] Elapsed time: ' + timeDiff + ' ms. for ' + events.length + ' events (' + timePerEvent + ' ms./event)');
      callback(state);
    }, actionCount);
  };

  return module;

}());

