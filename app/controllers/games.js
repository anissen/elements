
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    async = require('async'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User'),
    Card = mongoose.model('Card'),
    _ = require('underscore'),
    api = require('../../game-server/api');

/**
 * Find game by id
 */

exports.game = function(req, res, next, id) {
  Game.load(id, function (err, game) {
    if (err) return next(err);
    if (!game) return next(new Error('Failed to load game ' + id));
    req.game = game;
    next();
  });
};

/**
 * New game
 */

exports.new = function(req, res) {
  User
    .find({}, {'name': 1})
    .exec(function (err, users) {

      Card.list(function (err, cards) {

        res.render('games/new', {
          title: 'New Game',
          game: new Game({}),
          users: users,
          cards: cards
        });

      })
      
    });
};

/**
 * Create an game
 */

exports.create = function (req, res) {
  var cardArray = [].concat(req.body.cards);

  Card.loadList(cardArray, function (err, cards) {
    if (err) {
      console.log('error loading card list');
      return;
    }

    var player = {
      user: req.user._id,
      deck: cards,
      readyState: 'ready'
    };
    var invitedPlayers = _.map([].concat(req.body.invites), function (playerId) {
      return {
        user: playerId,
        deck: [],
        readyState: 'pending'
      };
    });

    var cardTemplates = {
      'empty': {
        type: 'empty'
      },
      'fire': {
        type: 'energy',
        name: 'Flame',
        cost: 0,
        data: {
          energy: 1,
          maxEnergy: 1,
          attack: 0,
          maxLife: 2,
          life: 2
        }
      },
      'water': {
        type: 'energy',
        name: 'Pond',
        cost: 0,
        data: {
          energy: 1,
          maxEnergy: 3,
          attack: 0,
          maxLife: 2,
          life: 2
        }
      }
    };

    var initialBoard = [
      [{card: 'empty'}, {card: 'empty'}, {card: 'fire', player: 1}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'empty'}, {card: 'water', player: 0}, {card: 'empty'}, {card: 'empty'}]
    ];

    for (var y = 0; y < initialBoard.length; y++) {
      var row = initialBoard[y];
      for (var x = 0; x < row.length; x++) {
        var tile = row[x];
        var card = clone(cardTemplates[tile.card]);

        if (tile.player !== undefined)
          card.player = tile.player;
        card.x = x;
        card.y = y;
        row[x] = card;
      }
    }

    var getPlayerData = function() {
      return _.map([player].concat(invitedPlayers), function (p) {
        return { user: p.user, library: p.deck, hand: p.deck };
      });
    };

    var game = new Game({
      players: [player].concat(invitedPlayers),
      owner: req.user._id,
      initialState: {
        players: getPlayerData(),
        board: initialBoard
      }
      //board: initialBoard
    });

    game.uploadAndSave(null, function (err) {
      if (err) {
        console.log('error!', err);
        res.render('games/new', {
          title: 'New Game',
          game: game,
          errors: err.errors
        });
      }

      res.redirect('/games/' + game._id);
    });
  });
};


function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Edit an game
 */

exports.edit = function (req, res) {
  User
    .find({}, {'name': 1})
    .exec(function (err, users) {

      res.render('games/edit', {
        title: 'Edit '+req.game.title,
        users: users,
        game: req.game
      });

    });
};

/**
 * Update game
 */

exports.update = function(req, res){
  var game = req.game;
  game = _.extend(game, req.body);
  game.uploadAndSave(null, function(err) {
    if (err) {
      res.render('games/edit', {
        title: 'Edit Game',
        game: game,
        errors: err.errors
      });
    }
    else {
      res.redirect('/games/' + game._id);
    }
  });
};

exports.acceptInvitation = function(req, res) {
  _.chain(req.game.players)
    .filter(function(player) {
      return player.readyState === 'pending' &&
        player.user._id.toString() === req.user._id.toString();
    })
    .each(function(player) {
      player.readyState = 'accepted';
    });

  req.game.save(function (err) {
    if (err)
      res.redirect('/games');
    res.render('games/show', {
      title: 'some game',
      game: req.game
    });
  });
};

/**
 * View an game
 */

exports.show = function(req, res){
  res.render('games/show', {
    title: req.game.title,
    game: req.game
  });
};

exports.play = function(req, res){
  res.render('games/play', {
    title: 'playing!',
    game: req.game
  });
};

exports.getState = function(req, res) {
  var actionCount = req.params['actionCount'];
  api.getGameState(req.game, actionCount, function(state) {
    // console.log(JSON.stringify(state.board, null, 2));
    res.send(state);
  });
};

exports.performAction = function(req, res) {
  var eventData = req.body;
  api.performAction(req.game, eventData, function(result) {
    res.send(result);
  });
};

/**
 * Delete an game
 */

exports.destroy = function(req, res){
  var game = req.game;
  game.remove(function(err) {
    if (err)
      req.flash('notice', 'Could not delete: ' + err);
    else
      req.flash('notice', 'Deleted successfully');

    res.redirect('/games');
  });
};

/**
 * List of Games
 */

exports.index = function(req, res){
  var page = req.param('page') > 0 ? req.param('page') : 0;
  var perPage = 15;
  var options = {
    perPage: perPage,
    page: page
  };

  Game.list(options, function(err, games) {
    if (err)
      return res.render('500');
    Game.count().exec(function (err, count) {
      res.render('games/index', {
        title: 'List of Games',
        games: games,
        page: page,
        pages: count / perPage
      });
    });
  });
};
