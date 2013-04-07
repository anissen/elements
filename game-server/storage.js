
module.exports = function (config) {
  var module = {};
  var GameModel = config.Model;
  var _ = config.underscore;

  module.persistEvent = function(eventData) {
    GameModel.findOneAndUpdate({id: 43}, { $push: { actions: eventData } }, function (err, game) {
      if (err) {
        console.log('persistEvent failed: ', err);
        return;
      }

      if (!game) {
        console.log('No game found in persistEvent');
        return;
      }
    });
  };

  module.persistEvents = function(eventsData) {
    GameModel.findOneAndUpdate({id: 43}, { $push: { actions: { $each: eventsData } } }, function (err, game) {
      if (err) {
        console.log('persistEvent failed: ', err);
        return;
      }

      if (!game) {
        console.log('No game found in persistEvent');
        return;
      }
    });
  };

  module.getEvents = function(callback, eventCount) {
    GameModel.findOne({id: 43}, function (err, game) {
      if (err) {
        console.log('getEvents failed: ', err);
        callback([]);
        return;
      }

      if (!game) {
        console.log('No game found in getEvents');
        callback([]);
        return;
      }

      callback(_.first(game.actions, eventCount || game.actions.length));
    });
  };

  return module;
};
