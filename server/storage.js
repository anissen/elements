var _ = require('underscore');

module.exports = (function () {

  var module = {};
  var events = [];

  module.persistEvent = function(eventData) {
    events.push(eventData);
  };

  module.getEvents = function(eventCount) {
    return _.first(events, eventCount || events.length);
  };

  return module;

}());
