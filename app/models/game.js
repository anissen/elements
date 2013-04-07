
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
  //playable: Boolean,
  owner: {type: Schema.ObjectId, ref: 'User'},
  /*
  comments: [{
    body: { type: String, "default": '' },
    user: { type: Schema.ObjectId, ref: 'User' },
    createdAt: { type: Date, "default": Date.now }
  }],
  */
  createdAt : {type: Date, "default": Date.now}
});

/**
 * Validations
 */

/*
GameSchema.path('title').validate(function (title) {
  return title.length > 0;
}, 'Game title cannot be blank');

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

  /**
   * Save game and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api public
   */

  uploadAndSave: function (images, cb) {
    this.save(cb);
  }

}

/**
 * Statics
 */

GameSchema.statics = {

  /**
   * Find game by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api public
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('owner', 'name')
      .exec(cb);
  },

  /**
   * List games
   *
   * @param {Object} options
   * @param {Function} cb
   * @api public
   */

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      .populate('owner', 'name')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }

};

mongoose.model('Game', GameSchema);
