
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

/**
 * Game Schema
 */

var GameSchema = new Schema({
  players: [{
    user: { type: Schema.ObjectId, ref: 'User' },
    cards: [String]
  }],
  invites: [{ type: Schema.ObjectId, ref: 'User' }],
  owner: {type: Schema.ObjectId, ref: 'User'},
  createdAt : {type: Date, "default": Date.now}
});

/**
 * Validations
 */

GameSchema.path('invites').validate(function (invites) {
  return invites && invites.length > 0;
}, 'You must invite somebody to play against');
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

  uploadAndSave: function (images, cb) {
    this.save(cb);
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
      .exec(cb);
  },

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this
      .find(criteria)
      .lean()
      .populate('owner', 'name')
      .populate('invites', 'name')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }

};

mongoose.model('Game', GameSchema);
