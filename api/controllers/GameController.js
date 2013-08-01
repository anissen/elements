/*---------------------
	:: Game 
	-> controller
---------------------*/
var GameController = {

  action: function(req, res) {
    var gameId = req.param('id');
    console.log('gameId', gameId);
    Game.findOne(gameId).done(function (err, game) {
      console.log('game', game);

      if (err) return res.send(err, 500);
      if (!game) return res.send("No game with that id exists!", 404);
  

      var action = {
        name: req.param('name'),
        cardId: req.param('cardid'),
        targetHex: req.param('hex')
      }
      var newActions = game.actions.concat(action);

      // Persist the change
      Game.update(gameId, { actions: newActions }, function (err, game) {
        console.log('err', err);
        console.log('update game', game);

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
