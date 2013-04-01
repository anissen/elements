var _ = require('underscore'),
    mongoose = require('mongoose');

module.exports.memory = (function () {

  var module = {};
  var events = [];

  module.persistEvent = function(eventData) {
    events.push(eventData);
  };

  module.persistEvents = function(eventsData) {
    events.concat(eventsData);
  };

  module.getEvents = function(callback, eventCount) {
    callback(_.first(events, eventCount || events.length));
  };

  return module;

}());

module.exports.mongodb = (function () {

  var module = {};
  var events = [];

  var databaseConnectionString = process.env.ELEMENTS_MONGODB_CONNECTION_STRING || 'mongodb://localhost/elements';
  mongoose.connect(databaseConnectionString);
  console.log('Database string: ' + databaseConnectionString);

  var gameSchema = mongoose.Schema({
    id: Number,
    actions: [{ action: String, data: mongoose.Schema.Types.Mixed }]
  });

  var Game = mongoose.model('games', gameSchema);

  module.persistEvent = function(eventData) {
    Game.findOneAndUpdate({id: 42}, { $push: { actions: eventData } }, function (err, game) {
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
    Game.findOneAndUpdate({id: 42}, { $push: { actions: { $each: eventsData } } }, function (err, game) {
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
    Game.findOne(function (err, game) {
      if (err) {
        console.log('getEvents failed: ', err);
        callback([]);
        return;
      }

      if (!game) {
        callback([]);
        return;
      }

      callback(_.first(game.actions, eventCount || game.actions.length));
    });
  };

  return module;

}());
