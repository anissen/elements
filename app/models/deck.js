
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

var DeckSchema = new Schema({
  owner: { type: Schema.ObjectId, ref: 'User' },
  //versions: [{
    name: { type: String },
    cards: [{ type: Schema.ObjectId, ref: 'Card' }],
    createdAt: { type: Date, "default": Date.now }
  //}]
});

DeckSchema.statics = {

  load: function (id, callback) {
    this
      .findOne({ _id : id })
      .lean()
      .exec(callback);
  },

  loadWithCards: function (id, callback) {
    this
      .findOne({ _id : id })
      .lean()
      .populate('cards')
      .exec(callback);
  },

  listAll: function (options, cb) {
    var criteria = options.criteria || {};

    this
      .find(criteria)
      .lean()
      .exec(cb);
  },

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this
      .find(criteria)
      .lean()
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }

};

mongoose.model('Deck', DeckSchema);