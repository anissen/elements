
var storage = require('./storage');
var Game = require('./game');
var GameActions = require('./gameactions');
var _ = require('underscore');
var util = require('util');

module.exports = (function () {

  var module = {};

  module.performAction = function(eventData, callback) {
    var events = storage.getEvents();
    var state = Game.playEvents(events);

    var gameActions = new GameActions(state);
    var possibleActions = gameActions.getPossibleActions();

    var actionLegal = _.some(possibleActions, function(action) {
      return _.isEqual(eventData, action);
    });
    //console.log("There is " + possibleActions.length + " legal actions. The action you selected is legal: " + actionLegal);

    var result = { success: actionLegal };
    if (actionLegal) {
      storage.persistEvent(eventData);
    } else {
      result.message = 'Invalid action: ' + JSON.stringify(eventData);
    }

    // HACK:
    if (eventData.action === 'endTurn' && actionLegal) {
      takeTurnByAI();
    }

    callback(result);
  };

  function takeTurnByAI() {
    //console.log('AI taking its turn!');
    while (true) {
      var events = storage.getEvents();
      var state = Game.playEvents(events);
      var gameActions = new GameActions(state);
      var initialStateValue = gameActions.getStateValue();
      var possibleActions = gameActions.getPossibleActionsWithoutEndTurn();
      var endTurnAction = { action: 'endTurn', data: {} };

      if (possibleActions.length === 0) {
        console.log('AI: No more possible actions');
        storage.persistEvent(endTurnAction);
        return;
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
      storage.persistEvent(action);
      if (action.action === 'endTurn')
        return;
    }
  }

  function getValueForAction(state, action) {
    var tempState = Game.playEvents([action], state);
    var gameActions = new GameActions(tempState);
    var value = gameActions.getStateValue();
    return value;
  }

  module.getGameState = function(actionCount, callback) {
    var startTime = (new Date()).getTime();

    var events = storage.getEvents(actionCount);
    var state = Game.playEvents(events);

    var endTime = (new Date()).getTime();
    var timeDiff = endTime - startTime;
    var timePerEvent = (events.length === 0 ? '0' : (timeDiff / events.length).toFixed(2));
    console.log('[getGameState] Elapsed time: ' + timeDiff + ' ms. for ' + events.length + ' events (' + timePerEvent + ' ms./event)');
    callback(state);
  };

  return module;

}());
