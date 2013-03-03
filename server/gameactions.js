var util = require('util'),
    vm = require('vm'),
    fs = require('fs'),
    _  = require('underscore');


module.exports = (function () {
  return function(state) {

    this.play = function(data) {
      var player = state.players[state.currentPlayer];
      var cardIndex = player.hand.indexOf(data.cardId);
      if (cardIndex < 0)
        throw new Error('No card with id "' + data.cardId + '" on the following hand "' + player.hand + '"');
      player.hand.splice(cardIndex, 1);

      var card = state.cards[data.cardId];

      if (card.type === 'unit' || card.type === 'energy') {
        payCastingCost(card.cost, data.pos);
        placeNewUnit(card, data.pos);
      } else if (card.type === 'spell') {
        var script = fs.readFileSync('./server/scripts/' + card.scriptFile);
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
      drawCards(1);
    };

    function getTiles() {
      return _.flatten(state.board);
    }



    //
    // Generation of possible actions
    //

    this.getPossibleActions = function() {
      var turnActions = getPossibleTurnActions();
      var moves = getPossibleMoves();
      var attacks = getPossibleAttacks();
      return turnActions.concat(moves).concat(attacks);
    };

    function getPossibleTurnActions() {
      return [{ action: "endTurn", data: {} }];
    }

    function getPossibleMoves() {
      return _.chain(getAllUnits())
        .map(getValidMovesForUnit)
        .flatten()
        .value();
    }

    function getValidMovesForUnit(unit) {
      return _.chain(getAdjacentTiles(unit))
        .filter(function(tile) {
          return tile.type === 'empty';
        })
        .map(function(move) {
          return {
            action: 'move',
            data: {
              from: { x: unit.x, y: unit.y },
              to: { x: move.x, y: move.y }
            }
          };
        })
        .value();
    }

    function getPossibleAttacks() {
      return _.chain(getAllUnits())
        .map(getValidAttacksForUnit)
        .flatten()
        .value();
    }

    function getValidAttacksForUnit(unit) {
      return _.chain(getAdjacentTiles(unit))
        .filter(function(tile) {
          return tile.type !== 'empty' && tile.player !== state.currentPlayer;
        })
        .map(function(attack) {
          return {
            action: 'attack',
            data: {
              from: { x: unit.x, y: unit.y },
              to: { x: attack.x, y: attack.y }
            }
          };
        })
        .value();
    }

    //
    // End of Generation of possible actions
    //


    function getAllUnits() {
      return _.filter(getTiles(), playerUnitTilesQuery);
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

    function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

    function drawCards(numberOfCards) {
      var player = state.players[state.currentPlayer];
      var cards = player.library.splice(0, numberOfCards);
      player.hand = player.hand.concat(cards);
    }

    function placeNewUnit(card, pos) {
      if (getTile(pos).type !== 'empty')
        throw new Error('Cannot place unit on non-empty tile');

      // TODO: Generate the list of all posibile actions and guard against invalid actions

      // TODO: Guard that the unit is placed next to (at least) one energy tile
      if (!_.some(getAdjacentTiles(pos), playerEnergyTilesQuery))
        throw new Error("sdafasf");

      // TODO: Select all adjacent energy groups

      // TODO: Drain energy from all adjacent energy groups

      var newCard = clone(card);
      newCard.player = state.currentPlayer;
      newCard.x = pos.x;
      newCard.y = pos.y;
      setTile(pos, newCard);
    }

    function playerEnergyTilesQuery(tile) {
      return tile.player === state.currentPlayer && tile.type === 'energy';
    }

    function playerUnitTilesQuery(tile) {
      return tile.player === state.currentPlayer && tile.type === 'unit';
    }

    function payCastingCost(cost, pos) {
      var closestSourcesFirstQuery = function(tile) {
        return Math.abs(tile.x - pos.x) + Math.abs(tile.y - pos.y);
      };

      var energySources = _.chain(getTiles())
        .filter(playerEnergyTilesQuery)
        .sortBy(closestSourcesFirstQuery)
        .value();

      var availableEnergy = _.reduce(energySources, function(sum, tile){
        return sum + tile.energy;
      }, 0);

      if (cost > availableEnergy)
        throw new Error("Not enough energy. " + cost + " requested and " + availableEnergy + " available");

      var remaingingCost = cost;
      _.each(energySources, function(source) {
        if (remaingingCost <= 0)
          return;
        remaingingCost -= source.energy;
        source.energy = (remaingingCost < 0 ? -remaingingCost : 0);
      });
    }

    function getAdjacentTiles(pos) {
      return getTilesWithinRange(pos, 1);
    }

    function getTilesWithinRange(pos, range) {
      return _.filter(getTiles(), function(tile) {
        return (Math.abs(tile.x - pos.x) <= range) && (Math.abs(tile.y - pos.y) <= range);
      });
    }

    function getScriptContext(data) {
      return {
        target: getTile(data.pos),
        damageUnit: function(unit, damage) {
          if (!unit.life)
            return;

          unit.life -= damage;
          if (unit.life <= 0)
            resetTile(unit);
        },
        getAdjacentTiles: getAdjacentTiles,
        print: function(str) { console.log('SCRIPT: ' + str ); },
        util: _
      };
    }

  };
}());
