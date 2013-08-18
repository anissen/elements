var util = require('util'),
    vm = require('vm'),
    fs = require('fs'),
    _  = require('underscore'),
    events = require('events'),
    Map = require('./../../assets/js/game/hex-map');

module.exports = (function () {

  var GameActions = function(game) {

    var me = this;

    var map = new Map.HexMap(game.board);

    events.EventEmitter.call(this);

    function getTile(pos) {
      return map.get(pos);
    }

    function setTile(pos, data) {
      getTile(pos).entity = data;
    }

    function resetTile(pos) {
      setTile(pos, null);
    }

    function getTiles() {
      return map.getValues();
    }

    function getAdjacentTiles(pos) {
      return map.getRing(pos);
    }

    function query() {
      return GameQueryService.query(game);
    }

    this.updateBoard = function() {
      game.board = map.map;
    }

    this.play = function(cardId, target) {
      var player = game.players[game.currentPlayer];

      // Find card in hand
      // TODO: Move this to GameQueryService
      var card = query()
        .getCurrentPlayer()
        .getCardInHand(cardId)
        .value();
      /*
      var card = _.find(player.hand, function(cardInHand) {
        return (cardInHand.id === cardId);
      });
      */

      // Remove card from hand
      player.hand = _.reject(player.hand, function(cardInHand) {
        return (cardInHand.id === cardId);
      });

      card.pos = target;
      setTile(target, card);

      this.emit('playedCard', card);
    };

    this.move = function(cardId, target) {
      // TODO: Move this to GameQueryService
      var unit = _.find(game.board, function(tile) {
        return (tile.entity && tile.entity.id === cardId);
      }).entity;

      //var unit = getTile(data.from);
      resetTile(unit.pos);
      unit.pos = target;
      // unit.movesLeft -= 1;
      setTile(target, unit);
    };

    this.attack = function(cardId, targetId) {
      var attacker = _.find(game.board, function(tile) {
        return (tile.entity && tile.entity.id === cardId);
      }).entity; // TODO: Move this to GameQueryService
      var defender = _.find(game.board, function(tile) {
        return (tile.entity && tile.entity.id === targetId);
      }).entity; // TODO: Move this to GameQueryService
      defender.life -= attacker.attack;
      // attacker.attacksLeft -= 1;
      if (defender.life <= 0)
        resetTile(defender.pos);

      this.emit('attack', attacker, defender);
    };

    this.endturn = function() {
      this.emit('turn ended');

      game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

      // startTurn();
    };

    /*
    function startTurn() {
      // Replenish 1 energy for all energy sources
      GameQueryService.query()
        .energy()
        .ownedByPlayer(game.currentPlayer)
        .exec(function(energy) {
          if (source.energy < source.maxEnergy)
            source.energy++;
        });

      _.chain(getTiles())
        .filter(playerEnergyTilesQuery)
        .each(function(source) {
          if (source.energy < source.maxEnergy)
            source.energy++;
        });

      // Restore unit attacks and moves
      _.chain(getTiles())
        .filter(playerUnitTilesQuery)
        .each(function(unit) {
          unit.movesLeft = unit.moves;
          unit.attacksLeft = unit.attacks;
        });

      // Execute onTurnStart for each unit
      _.chain(getTiles())
        .filter(playerUnitTilesQuery)
        .each(function(unit) {
          if (unit.onTurnStart) {
            var data = { pos: unit };
            executeScript(unit.onTurnStart, data);
          }
        });

      me.emit('turn started');

      // draw a card for the next player
      drawCards(1);
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

      me.emit('drew cards', cards);
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
        remaingingCost -= source.energy;
        source.energy = (remaingingCost < 0 ? -remaingingCost : 0);
      });
    }
    */

  };

  util.inherits(GameActions, events.EventEmitter);

  return GameActions;

}());
