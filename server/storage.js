
module.exports = (function () {

  var module = {};
  var events = [];

  module.persistEvent = function(eventData) {
    events.push(eventData);
  };

  module.getEvents = function() {
    return events;
  };

  return module;

}());
