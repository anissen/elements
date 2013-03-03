
var storage = require('./storage');
var Game = require('./game');
var GameActions = require('./gameactions');
var _ = require('underscore');

module.exports = (function () {

  var module = {};

  module.performAction = function(eventData) {
    var events = storage.getEvents();
    var state = Game.playEvents(events);

    var gameActions = new GameActions(state);
    var possibleActions = gameActions.getPossibleActions();

    var actionLegal = _.some(possibleActions, function(action) {
      return _.isEqual(eventData, action);
    });
    console.log("the action is legal: " + actionLegal);

    storage.persistEvent(eventData);
  };

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
