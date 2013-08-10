/*---------------------
	:: Game 
	-> controller
---------------------*/

var _  = require('underscore');
var GameInstance = require('./../game/game');
var Hex = require('./../../assets/js/game/hex-map').Hex;

function createCard(card, player) {
  var cardInstance = clone(card);
  cardInstance.id = _.uniqueId('card');
  cardInstance.player = player;
  return cardInstance;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var GameController = {

  start: function(req, res) {
    'use strict';

    /*
    var gameData = {
      players: req.param('players').split(',')
    };
    */

    Card.find().done(function(err, cards) {

      var board = {
        '0,0': { entity: createCard(cards[4], 1) },
        '0,1': { entity: null },
        '0,2': { entity: null },
        '0,3': { entity: null },
        '0,4': { entity: createCard(cards[4], 0) },
      };

      var gameData = {
        state: {
          players: [
            {
              name: 'Anders',
              library: [createCard(cards[0], 0), createCard(cards[1], 0)],
              hand: [createCard(cards[4], 0), createCard(cards[0], 0)],
              graveyard: []
            },
            {
              name: 'AI',
              library: [createCard(cards[0], 1), createCard(cards[1], 1)],
              hand: [createCard(cards[4], 1), createCard(cards[0], 1)],
              graveyard: []
            }
          ],
          board: board,
          currentPlayer: 0
        }
      };

      Game.create(gameData).done(function(err, game) {
        if (err) return res.send(err, 500);
        res.json(game);
      });

    });
  },

  test: function(req, res) {
    'use strict';

    var gameId = req.param('id');
    Game.findOne(gameId).done(function (err, gameData) {
      if (err) return res.send(err, 500);
      if (!gameData) return res.send('No game with that ID "' + gameId + '" exists!', 404);

      var results = GameQueryService.query(gameData.state)
        .energy()
        .result();

      var results2 = GameQueryService.query(gameData.state)
        .energy()
        .ownedByPlayer(0)
        .result();

      res.json({ all: results, mine: results2 });
    });
  },

  action: function(req, res) {
    'use strict';

    var gameId = req.param('id');
    Game.findOne(gameId).done(function (err, gameData) {
      if (err) return res.send(err, 500);
      if (!gameData) return res.send('No game with that ID "' + gameId + '" exists!', 404);

      /*
      var action = {
        action: req.param('name'),
        data: {
          from: { x: 1, y: 1 },
          to: { x: 2, y: 2 }
        }
      };
      */

      // Action data:
      
      // play:
      // player, card, location
      // 0,      2,    (1,3)

      // move:
      // player, card, location
      // 0,      2,    (1,3)
      
      // attack:
      // player, card, unit
      // 0,      2,    5

      // spell: (e.g. from spells, or activated/triggered ability of units and structures)
      // player, card (source), target (location, unit, player)
      // 0,      2,             (1,3), 5, 0

      // end-turn:
      // player
      // 0

      // General format: [player-id, action-id, card-id, target-id]

      // location format: (board-q,r), i.e. (board-1,3)
      // unit format: card-x, i.e card-2
      // player format: player-x, i.e. player-0

      /*
      GameService.performAction(gameData, action, function(result) {
        res.json(result);
      });
      */

      var action = {
        type:   req.param('type'),
        card:   req.param('card'),
        target: req.param('target')
      };

      /*
      var actionValid = ActionValidationService.validateAction(gameData.state, action);
      if (!actionValid)
        return res.send(500, { error: 'Action is invalid'});
      */

      var game = new GameInstance(gameData.state);
      game[action.type](action.card, Hex.fromString(action.target));
      //game.updateBoard();

      var updatedGameData = {
        actions: gameData.actions.concat(action),
        state: gameData.state
      };

      Game.update(gameId, updatedGameData, function (err, game) {
        if (err) return res.send(err, 500);

        //Game.subscribe(req, [{ id: gameId }]);
        //Game.introduce(gameId);

        Game.publish([{id: gameId}], {
          text: 'Action performed!',
          action: action
        });

        // Report back with the new state of the game
        res.json(game);
      });
    });
  },

  play: function(req, res) {
    res.view({
      gameId: req.param('id')
    });
  }

};
module.exports = GameController;
