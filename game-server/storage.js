
module.exports = function (config) {
  var module = {};
  var GameModel = config.Model;
  var _ = config.underscore;

  module.persistEvent = function(gameId, eventData) {
    GameModel.findOneAndUpdate({_id: gameId}, { $push: { actions: eventData } }, function (err, game) {
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

  module.persistEvents = function(gameId, eventsData) {
    GameModel.findOneAndUpdate({_id: gameId}, { $push: { actions: { $each: eventsData } } }, function (err, game) {
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

  module.getEvents = function(gameId, callback, eventCount) {
    GameModel.findOne({_id: gameId}, function (err, game) {
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
