
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema,
    Card = mongoose.model('Card');

/**
 * Game Schema
 */

var GameActionSchema = new Schema({
  action: String,
  data: Schema.Types.Mixed
});

var GameSchema = new Schema({
  players: [{
    user: { type: Schema.ObjectId, ref: 'User' },
    deck: { type: Schema.ObjectId, ref: 'Deck' },
    readyState: String
  }],
  owner: { type: Schema.ObjectId, ref: 'User' },
  createdAt: {type: Date, "default": Date.now},
  initialState: {
    players: [{
      user: { type: Schema.ObjectId, ref: 'User' },
      library: [{ type: Schema.ObjectId, ref: 'Card' }],
      hand: [{ type: Schema.ObjectId, ref: 'Card' }],
      deck: { type: Schema.ObjectId, ref: 'Deck' }
    }],
    currentPlayer: { type: Number, "default": 0 },
    won: [{ type: Number }],
    board: Schema.Types.Mixed
  },
  actions: [GameActionSchema]
});

/**
 * Validations
 */

// GameSchema.path('players').validate(function (players) {
//   return players && players.length > 1;
// }, 'You must invite somebody to play against');
/*
GameSchema.path('body').validate(function (body) {
  return body.length > 0;
}, 'Game body cannot be blank');
*/

/**
 * Pre-remove hook
 */

GameSchema.pre('remove', function (next) {
  // clean up
  next();
});

/**
 * Methods
 */

GameSchema.methods = {

  persistAction: function (action, callback) {
    this.actions.push(action);
    this.save(callback);
  }

};

/**
 * Statics
 */

GameSchema.statics = {

  load: function (id, cb) {
    this
      .findOne({ _id : id })
      //.lean()
      .populate('owner', 'name')
      .populate('players.user', 'name')
      .populate('players.deck', 'name')
      .populate('initialState.players.user', 'name')
      .populate('initialState.players.hand')
      .populate('initialState.players.deck')
      .exec(function (err, game) {
        Card.populate(game, {path: 'initialState.players.deck.cards'}, function (err, gameWithDeckCards) {
          cb(err, gameWithDeckCards);
        })
      });
  },

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this
      .find(criteria)
      .lean()
      .populate('owner', 'name')
      .populate('players.user', 'name')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }

  // persistAction: function (action, callback) {
  //   this.findOneAndUpdate({_id: gameId}, { $push: { actions: eventData } }, callback);
  // }

};

mongoose.model('Game', GameSchema);
