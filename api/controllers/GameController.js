/*---------------------
	:: Game 
	-> controller
---------------------*/
var GameController = {

  start: function(req, res) {
    'use strict';

    /*
    var gameData = {
      players: req.param('players').split(',')
    };
    */

    var gameData = {
      state: {
        players: [
          {
            name: 'Anders',
            library: ['small-guy', 'big-guy'],
            hand: ['flame', 'small-guy'],
            graveyard: []
          },
          {
            name: 'AI',
            library: ['small-guy', 'big-guy'],
            hand: ['flame', 'small-guy'],
            graveyard: []
          }
        ],
        board: {},
        currentPlayer: 0
      }
    };

    Game.create(gameData).done(function(err, game) {
      if (err) return res.send(err, 500);
      res.json(game);
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
        type:   req.param('action'),
        card:   req.param('card'),
        target: req.param('target')
      };

      var actionValid = ActionValidationService.validateAction(gameData.state, action);
      if (!actionValid)
        return res.send(500, { error: 'Action is invalid'});

      var actions = gameData.actions.concat(action);

      Game.update(gameId, { actions: actions }, function (err, game) {
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
