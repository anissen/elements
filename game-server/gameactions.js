var util = require('util'),
    vm = require('vm'),
    fs = require('fs'),
    _  = require('underscore'),
    events = require('events');

module.exports = (function () {
  var GameActions = function(game) {

    events.EventEmitter.call(this);

    this.play = function(data) {
      var player = getCurrentPlayer();
      var card = createCardForCurrentPlayer(data.cardId);

      player.hand = _.reject(player.hand, function(cardInHand) {
        return cardInHand.id === data.cardId;
      });

      if (card.type === 'unit' || card.type === 'energy') {
        payCastingCost(card.cost, data.pos);
        placeNewUnit(card, data.pos);
      } else if (card.type === 'spell') {
        payCastingCost(card.cost);
        executeScript(card.data.scriptFile, data);
      }

      this.emit('playedCard', card);
    };

    this.move = function(data) {
      var unit = getTile(data.from);
      resetTile(data.from);
      unit.x = data.to.x;
      unit.y = data.to.y;
      unit.data.movesLeft -= 1;
      setTile(data.to, unit);
    };

    this.attack = function(data) {
      var attacker = getTile(data.from);
      var defender = getTile(data.to);
      defender.data.life -= attacker.data.attack;
      attacker.data.attacksLeft -= 1;
      if (defender.data.life <= 0)
        resetTile(data.to);
    };

    this.endTurn = function(data) {
      game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

      startTurn();
    };

    function startTurn() {
      // Replenish 1 energy for all energy sources
      _.chain(getTiles())
        .filter(playerEnergyTilesQuery)
        .each(function(source) {
          if (source.data.energy < source.data.maxEnergy)
            source.data.energy++;
        });

      // Restore unit attacks and moves
      _.chain(getTiles())
        .filter(playerUnitTilesQuery)
        .each(function(unit) {
          unit.data.movesLeft = unit.data.moves;
          unit.data.attacksLeft = unit.data.attacks;
        });

      // Execute onTurnStart for each unit
      _.chain(getTiles())
        .filter(playerUnitTilesQuery)
        .each(function(unit) {
          if (unit.onTurnStart) {
            var data = { pos: unit };
            executeScript(unit.data.onTurnStart, data);
          }
        });

      // draw a card for the next player
      drawCards(1);
    }

    function executeScript(scriptFile, data) {
      var script = fs.readFileSync('./game-server/scripts/' + scriptFile);
      vm.runInNewContext(script, getScriptContext(data), scriptFile);
    }

    function getTiles() {
      return _.flatten(game.board);
    }

    //
    // Generation of possible actions
    //

    this.getPossibleActions = function() {
      var turnActions = getPossibleTurnActions();
      return this.getPossibleActionsWithoutEndTurn().concat(turnActions);
    };

    this.getPossibleActionsWithoutEndTurn = function() {
      var moves = getPossibleMoves();
      var attacks = getPossibleAttacks();
      var plays = getPossiblePlays();
      return moves.concat(attacks).concat(plays);
    };

    this.getStateValue = function() {
      var value = 0;
      value += getValueOfPlayersThings(game.currentPlayer);
      value -= getValueOfPlayersThings((game.currentPlayer + 1) % 2);
      return value;
    };

    function getValueOfPlayersThings(playerId) {
      var valuePerUnit = 2;
      var unitValue = _.chain(getTiles())
        .filter(function(tile) {
          return tile.player === playerId && tile.type === 'unit';
        })
        .reduce(function(sum, unit) {
          return sum + valuePerUnit + unit.data.attack + unit.data.life;
        }, 0)
        .value();

      var valuePerCard = 2;
      var cardsOnHandValue = game.players[playerId].hand.length * valuePerCard;

      var energyLifeValue = 3;
      var energyValue = _.chain(getTiles())
        .filter(function(tile) {
          return tile.player === playerId && tile.type === 'energy';
        })
        .reduce(function(sum, energy) {
          return sum + energy.data.life * energyLifeValue + energy.data.energy;
        }, 0)
        .value();

        return unitValue + cardsOnHandValue + energyValue;
    }

    this.checkWinner = function() {
      var player0Lost = hasPlayerLost(0);
      var player1Lost = hasPlayerLost(1);
      if (!player0Lost && !player1Lost)
        game.won = [];
      else if (player0Lost && player1Lost)
        game.won = [0, 1];
      else if (player0Lost)
        game.won = [1];
      else if (player1Lost)
        game.won = [0];
    };

    function hasPlayerLost(playerId) {
      return !_.some(getTiles(), function(tile) {
        return tile.player === playerId && tile.type === 'energy';
      });
    }

    function getPossibleTurnActions() {
      return [{ action: "endTurn", data: {} }];
    }

    function getPossibleMoves() {
      return _.chain(getAllUnits())
        .filter(function(unit) { return unit.data.movesLeft > 0; })
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
        .filter(function(unit) { return unit.data.attacksLeft > 0; })
        .map(getValidAttacksForUnit)
        .flatten()
        .value();
    }

    function getValidAttacksForUnit(unit) {
      return _.chain(getAdjacentTiles(unit))
        .filter(function(tile) {
          return tile.type !== 'empty' && tile.player !== game.currentPlayer;
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

    function getPossiblePlays() {
      var availableEnergy = _.chain(getTiles())
        .filter(playerEnergyTilesQuery)
        .reduce(function(sum, energy) {
          return sum + energy.data.energy;
        }, 0)
        .value();

      return _.chain(getAllCardsInHand())
        .filter(function(card) {
          return card.cost <= availableEnergy;
        })
        .map(getValidPlaysForCard)
        .flatten()
        .value();
    }

    function getCurrentPlayer() {
      return game.players[game.currentPlayer];
    }

    function getAllCardsInHand() {
      return getCurrentPlayer().hand;
    }

    function getValidPlaysForCard(card) {
      return _.map(getValidTargetsForCard(card), function(target) {
        return {
          action: 'play',
          data: {
            cardId: card.id,
            pos: { x: target.x, y: target.y }
          }
        };
      });
    }

    function getValidTargetsForCard(card) {
      if (card.type === 'spell')
        return getTiles(); // TODO: Need more precise specification and handling of targets

      return _.filter(getTiles(), function(tile) {
        // TODO: Need check for placement near energy source and sufficiant energy
        return tile.type === 'empty' &&
          _.some(getAdjacentTiles(tile), playerEnergyTilesQuery) &&
          getAvailableEnergyAtTile(tile) >= card.cost;
      });
    }

    //
    // End of Generation of possible actions
    //

    function getAllUnits() {
      return _.filter(getTiles(), playerUnitTilesQuery);
    }

    function getTile(pos) {
      return game.board[pos.y][pos.x];
    }

    function setTile(pos, data) {
      game.board[pos.y][pos.x] = data;
    }

    function resetTile(pos) {
      game.board[pos.y][pos.x] = {type: 'empty', x: pos.x, y: pos.y};
    }

    function createCardForCurrentPlayer(cardId) {
      var player = getCurrentPlayer();
      var cardTemplate = _.find(player.deck.cards, function (card) {
        return card.id === cardId;
      });
      var newCard = clone(cardTemplate);
      newCard.player = game.currentPlayer;
      return newCard;
    }

    function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

    function drawCards(numberOfCards) {
      var player = getCurrentPlayer();
      var cards = player.library.splice(0, numberOfCards);
      player.hand = player.hand.concat(cards);
    }

    function placeNewUnit(card, pos) {
      // TODO: Select all adjacent energy groups

      // TODO: Drain energy from all adjacent energy groups
      var newCard = clone(card);
      newCard.player = game.currentPlayer;
      newCard.x = pos.x;
      newCard.y = pos.y;
      newCard.data.movesLeft = newCard.data.moves;
      newCard.data.attacksLeft = newCard.data.attacks;
      setTile(pos, newCard);
    }

    function playerEnergyTilesQuery(tile) {
      return tile.player === game.currentPlayer && tile.type === 'energy';
    }

    function playerUnitTilesQuery(tile) {
      return tile.player === game.currentPlayer && tile.type === 'unit';
    }

    function getEnergySourcesConnectedToTile(tile) {
      var closestSourcesFirstQuery = function(source) {
        return Math.abs(tile.x - source.x) + Math.abs(tile.y - source.y);
      };

      return _.chain(getTiles())
        .filter(playerEnergyTilesQuery)
        .sortBy(closestSourcesFirstQuery)
        .value();
    }

    function getAvailableEnergyAtTile(tile) {
      var energySources = getEnergySourcesConnectedToTile(tile);
      var availableEnergy = _.reduce(energySources, function(sum, tile){
        return sum + tile.data.energy;
      }, 0);
      return availableEnergy;
    }

    function payCastingCost(cost, pos) {
      var energySources;
      if (pos)
        energySources = getEnergySourcesConnectedToTile(pos);
      else
        energySources = _.filter(getTiles(), playerEnergyTilesQuery);

      var remaingingCost = cost;
      _.each(energySources, function(source) {
        if (remaingingCost <= 0)
          return;
        remaingingCost -= source.data.energy;
        source.data.energy = (remaingingCost < 0 ? -remaingingCost : 0);
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
          if (!unit.data.life)
            return;

          unit.data.life -= damage;
          if (unit.data.life <= 0)
            resetTile(unit);
        },
        heal: function(unit, amount) {
          if (!unit.data.life)
            return;

          if (unit.data.life < unit.data.maxLife)
            unit.data.life++;
        },
        getAdjacentTiles: getAdjacentTiles,
        print: function(str) { console.log('SCRIPT: ' + str ); },
        util: _
      };
    }

  };

  GameActions.prototype.__proto__ = events.EventEmitter.prototype;

  return GameActions;

}());
