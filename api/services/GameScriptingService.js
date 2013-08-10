
var GameActions = require('./../game/game'),
    _ = require('underscore');

function getScriptContext(card, data) {
  return {
    entity: card,
    game: me,
    target: getTile(data.pos),
    damageUnit: function(unit, damage) {
      if (!unit.life)
        return;

      unit.life -= damage;
      if (unit.life <= 0)
        resetTile(unit);
    },
    heal: function(unit, amount) {
      if (!unit.life)
        return;

      if (unit.life < unit.maxLife)
        unit.life++;
    },
    drawCards: drawCards,
    getAdjacentTiles: getAdjacentTiles,
    print: console.log,
    getCurrentPlayerIndex: function() { 
      return game.currentPlayer;
    },
    updateEntity: function(entity) {
      setTile(data.pos, entity); // HACK HACK HACK HACK
    },
    getCurrentPlayer: getCurrentPlayer,
    // notify: function (data) { 
    //   me.emit('notify', data); 
    // },
    util: _
  };
}

};

exports.something = function(data) {
  
};

