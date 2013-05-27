var util = require('util'),
    _  = require('underscore'),
    events = require('events');

module.exports = (function () {
  var Entity = function(entityData) {
    events.EventEmitter.call(this);

    this.moveTo = function(pos) {
      entityData.x = pos.x;
      entityData.y = pos.y;
      this.emit('moved', pos);
    }
  };

  util.inherits(Entity, events.EventEmitter);

  return Entity;
}());
