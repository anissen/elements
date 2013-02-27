var util = require('util'),
    vm = require('vm'),
    fs = require('fs');


module.exports = (function () {
  return function(state) {

    this.play = function(data) {
      var player = state.players[state.currentPlayer];
      var cardIndex = player.hand.indexOf(data.cardId);
      if (cardIndex < 0)
        throw new Error('No card with id "' + data.cardId + '" on the following hand "' + player.hand + '"');
      player.hand.splice(cardIndex, 1);

      var card = state.cards[data.cardId];
      card.player = player.id;

      if (card.type === 'unit' || card.type === 'energy-source') {
        var newCard = clone(card);
        newCard.x = data.pos.x;
        newCard.y = data.pos.y;
        setTile(data.pos, newCard);
      } else if (card.type === 'spell') {
        //console.log('Evaluating the spells on-activate script: ');
        var script = fs.readFileSync('./scripts/' + card.scriptFile);
        vm.runInNewContext(script, getScriptContext(data), card.scriptFile);
      }
    };

    this.move = function(data) {
      var unit = getTile(data.from);
      resetTile(data.from);
      unit.x = data.to.x;
      unit.y = data.to.y;
      setTile(data.to, unit);
    };

    this.attack = function(data) {
      var attackingUnit = getTile(data.from);
      var defendingUnit = getTile(data.to);
      defendingUnit.life -= attackingUnit.attack;
      attackingUnit.life -= defendingUnit.attack;
      if (defendingUnit.life <= 0)
        resetTile(data.to);
      if (attackingUnit.life <= 0)
        resetTile(data.from);
    };

    this.endTurn = function(data) {
      state.currentPlayer = (state.currentPlayer + 1) % state.players.length;

      // draw a card for the next player
      var player = state.players[state.currentPlayer];
      var numberOfCards = 1;
      var cards = player.library.splice(0, numberOfCards);
      player.hand = player.hand.concat(cards);
    };

    function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

    function getTile(pos) {
      return state.board[pos.y][pos.x];
    }

    function setTile(pos, data) {
      return state.board[pos.y][pos.x] = data;
    }

    function resetTile(pos) {
      state.board[pos.y][pos.x] = {type: 'empty', x: pos.x, y: pos.y};
    }

    function getScriptContext(data) {
      return {
        target: getTile(data.pos),
        damageUnit: function(unit, damage) {
          unit.life -= damage;
        },
        getAdjacentTiles: function(pos, range) {
          var tiles = [];
          for (var y = pos.y - range; y <= pos.y + range; y++) {
            for (var x = pos.x - range; x <= pos.x + range; x++) {
              if (!(x === pos.x && y === pos.y))
                tiles.push(getTile({x: x, y: y}));
            }
          }
          return tiles;
        },
        print: function(str) { console.log('SCRIPT: ' + str ); }
      };
    }

  };
}());
