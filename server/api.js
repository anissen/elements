
var storage = require('./storage');
var Game = require('./game');
var GameActions = require('./gameactions');
var _ = require('underscore');

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
    console.log("There is " + possibleActions.length + " legal actions. The action you selected is legal: " + actionLegal);

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
    console.log('AI taking its turn!');
    var possibleActions;
    do {
      var events = storage.getEvents();
      var state = Game.playEvents(events);
      var gameActions = new GameActions(state);
      possibleActions = gameActions.getPossibleActions();

      if (possibleActions.length > 0) {
        var randomIndex = _.random(possibleActions.length - 1);
        var randomAction = possibleActions[randomIndex];
        console.log('AI choosing action: ' + randomAction.action);
        storage.persistEvent(randomAction);
        if (randomAction.action === 'endTurn')
          return;
      }
    } while (possibleActions.length > 0);
  }

  module.getGameState = function(callback) {
    var startTime = (new Date()).getTime();

    var events = storage.getEvents();
    var state = Game.playEvents(events);

    var endTime = (new Date()).getTime();
    var timeDiff = endTime - startTime;
    var timePerEvent = (events.length === 0 ? '0' : (timeDiff / events.length).toFixed(2));
    console.log('[getGameState] Elapsed time: ' + timeDiff + ' ms. for ' + events.length + ' events (' + timePerEvent + ' ms./event)');
    callback(state);
  };

  return module;

}());
