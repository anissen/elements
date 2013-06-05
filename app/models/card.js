
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema,
    async = require('async');

var CardSchema = new Schema({
  type: { type: String },
  name: { type: String },
  castingCost: { type: Number, "default": 0 },
  cardSet: { type: String, "default": "alpha" },
  rarity: { type: String, "default": "common" },
  data: Schema.Types.Mixed
});

CardSchema.statics = {

  load: function (id, callback) {
    this
      .findOne({ _id : id })
      .lean()
      .exec(callback);
  },

  loadByCardId: function (cardId, callback) {
    this
      .findOne({ id : cardId })
      .lean()
      .exec(callback);
  },

  loadListWithDublicates: function (ids, callback) {
    async.map(ids, this.load.bind(this), callback);
  },

  loadList: function (ids, callback) {
    this
      .find({ _id: { $in: ids } })
      .lean()
      .exec(callback);
  },

  list: function (callback) {
    this
      .find()
      .lean()
      .exec(callback);
  }

};

mongoose.model('Card', CardSchema);
