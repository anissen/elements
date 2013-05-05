
var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'development',
    config = require('../../config/config')[env],
    Schema = mongoose.Schema;

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

  loadList: function (ids, callback) {
    this
      .find({ id: { $in: ids } })
      .lean()
      .exec(callback);
  }

};

mongoose.model('Card', CardSchema);
