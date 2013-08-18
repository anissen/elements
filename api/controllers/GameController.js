/*---------------------
	:: Game 
	-> controller
---------------------*/

var _  = require('underscore');
var GameInstance = require('./../game/game');

function createCard(card, player, pos) {
  var cardInstance = clone(card);
  cardInstance.id = _.uniqueId('card');
  cardInstance.player = player;
  if (pos)
    cardInstance.pos = pos;
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
      if (err) return res.send(err, 500);
      if (!cards) return res.send('No cards found');

      var board = {
        '0,0': { entity: null },
        '1,0': { entity: createCard(cards[4], 1, '1,0') },
        '2,0': { entity: null },
        '0,1': { entity: null },
        '1,1': { entity: null },
        '-1,2': { entity: null },
        '0,2': { entity: createCard(cards[4], 0, '0,2') },
        '1,2': { entity: null },
      };

      var state = {
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
      };

      var gameData = {
        initialState: state,
        state: clone(state)
      };

      Game.create(gameData).done(function(err, game) {
        if (err) return res.send(err, 500);
        if (!game) return res.send('Game not created');

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
      game[action.type](action.card, action.target);

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
