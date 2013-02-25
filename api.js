
var storage = require('./storage');
var game = require('./game');

module.exports = (function () {

  var module = {};

  module.performAction = function(eventData) {
    storage.persistEvent(eventData);
  };

  module.getGameState = function(callback) {
    var startTime = (new Date()).getTime();

    var events = storage.getEvents();
    var state = game.playEvents(events);

    var endTime = (new Date()).getTime();
    var timeDiff = endTime - startTime;
    console.log('Elapsed time (getGameState): ' + timeDiff + ' ms. for ' + events.length + ' events (' + timeDiff / events.length + ' ms./event)');
    callback(state);
  };

  return module;

}());
