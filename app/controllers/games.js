
/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    async = require('async'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User'),
    _ = require('underscore');

/**
 * Find game by id
 */

exports.game = function(req, res, next, id) {
  console.trace('track');
  console.log('finding game with id ' + id);

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
      // console.log(users);
      res.render('games/new', {
        title: 'New Game',
        game: new Game({}),
        users: users
      });
    });
};

/**
 * Create an game
 */

exports.create = function (req, res) {
  var player = {
    user: req.user._id,
    cards: req.body.cards,
    readyState: 'ready'
  };
  var invitedPlayers = _.map([].concat(req.body.invites), function (playerId) {
    return {
      user: playerId,
      cards: [],
      readyState: 'pending'
    };
  });

  var game = new Game({
    players: [player].concat(invitedPlayers),
    owner: req.user._id
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
};

/**
 * Edit an game
 */

exports.edit = function (req, res) {
  res.render('games/edit', {
    title: 'Edit '+req.game.title,
    game: req.game
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
  for (var i = 0; i < req.game.players.length; i++) {
    var player = req.game.players[i];
    if (player.user === req.user._id) {
      console.log('asf');
    }
  }
  res.render('games/show', {
    title: 'some game',
    game: req.game
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

    console.log('redirecting to /games');
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
