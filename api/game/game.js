var util = require('util'),
    vm = require('vm'),
    fs = require('fs'),
    _  = require('underscore'),
    events = require('events'),
    Map = require('./../../assets/js/game/hex-map');

module.exports = (function () {
  var GameActions = function(game) {

    var me = this;

    var map = new Map.HexMap();
    map.map = game.board;

    events.EventEmitter.call(this);

    function getTile(pos) {
      return map.get(Map.Hex(pos.x, pos.y));
    }

    function setTile(pos, data) {
      map.get(pos).entity = data;
    }

    function resetTile(pos) {
      setTile(pos, { entity: null });
    }

    function getTiles() {
      return map.getValues();
    }

    function getAdjacentTiles(pos) {
      return map.getRing(Map.Hex(pos.x, pos.y));
    }

    this.updateBoard = function() {
      game.board = map.map;
    }

    this.play = function(cardId, target) {
      var player = getCurrentPlayer();
      
      // Find card in hand
      var card = _.find(player.hand, function(cardInHand) {
        return (cardInHand.id === cardId);
      });

      // Remove card from hand
      player.hand = _.reject(player.hand, function(cardInHand) {
        return (cardInHand.id === cardId);
      });

      placeNewUnit(card, target);

      /*
      if (card.type === 'unit' || card.type === 'energy') {
        payCastingCost(card.cost, data.pos);
        placeNewUnit(card, data.pos);
        if (card.scriptFile)
          executeScript(card.scriptFile, card, data);
      } else if (card.type === 'spell') {
        payCastingCost(card.cost);
        executeScript(card.scriptFile, card, data);
      }
      */

      this.emit('playedCard', card);
    };

    this.move = function(data) {
      var unit = getTile(data.from);
      resetTile(data.from);
      unit.x = data.to.x;
      unit.y = data.to.y;
      unit.movesLeft -= 1;
      setTile(data.to, unit);
    };

    this.attack = function(data) {
      var attacker = getTile(data.from);
      var defender = getTile(data.to);
      defender.life -= attacker.attack;
      attacker.attacksLeft -= 1;
      if (defender.life <= 0)
        resetTile(data.to);

      this.emit('attack', attacker, defender);
    };

    this.endTurn = function(data) {
      this.emit('turn ended');

      game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

      startTurn();
    };

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

    function executeScript(scriptFile, card, data) {
      var script = fs.readFileSync('./game-server/scripts/' + scriptFile);
      vm.runInNewContext(script, getScriptContext(card, data), scriptFile);
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

    function placeNewUnit(card, pos) {
      // TODO: Select all adjacent energy groups

      // TODO: Drain energy from all adjacent energy groups
      // var newCard = clone(card);
      // newCard.player = game.currentPlayer;
      card.pos = pos.id;
      // card.movesLeft = 1;
      // card.attacksLeft = 1;
      setTile(pos, card);
    }

    /*
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

    

  util.inherits(GameActions, events.EventEmitter);

  return GameActions;

}());
