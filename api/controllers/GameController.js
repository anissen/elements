/*---------------------
	:: Game 
	-> controller
---------------------*/
var GameController = {

  action: function(req, res) {
    var gameId = req.param('id');
    Game.findOne(gameId).done(function (err, gameData) {
      if (err) return res.send(err, 500);
      if (!gameData) return res.send("No game with that ID '" + gameId + "' exists!", 404);

      var action = {
        action: req.param('name'),
        data: {
          from: { x: 1, y: 1 },
          to: { x: 2, y: 2 }
        }
      };

      gameData.initialState = {
        players: [
          { name: 'Human' },
          { name: 'Computer' }
        ],
        currentPlayer: 0,
        board: []
      };

      var actionValid = ActionValidationService.validateAction(gameData.initialState, action);
      console.log('Action is ' + (actionValid ? 'VALID' : 'INVALID'));

      GameService.performAction(gameData, action, function(result) {
        res.json(result);
      });

      /*
      var action = {
        name: req.param('name'),
        cardId: req.param('cardid'),
        targetHex: req.param('hex')
      };
      var newActions = game.actions.concat(action);

      // Persist the change
      Game.update(gameId, { actions: newActions }, function (err, game) {
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
      */
    });
  },

  play: function(req, res) {
    res.view({
      gameId: req.param('id')
    });
  }

};
module.exports = GameController;
