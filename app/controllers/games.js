
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

exports.game = function(req, res, next, id){
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
    })
};

/**
 * Create an game
 */

exports.create = function (req, res) {
  //["small-unit", "small-unit", "small-unit", "small-unit", "big-unit", "big-unit", "water", "water", "water", "water", "water", "water", "fireball"]
  var invites = [].concat(req.body.invites);
  console.log('owner', req.user);

  var game = new Game({
    players: [{
      user: req.user._id,
      cards: req.body.cards
    }],
    invites: invites,
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
    else {
      console.log('invites', invites);
      for (var key in invites) {
        var invitee = invites[key];
        User.findByIdAndUpdate(invitee, {
          $addToSet: {
            invites: {
              game: game._id,
              invitedBy: game.owner
            }
          }
        }, function (err, user) {
          if (err)
            console.log('Error adding game ' + game._id + ' invite to user' + user._id);
        });
      }

      res.redirect('/games/'+game._id);
    }
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
  game.remove(function(err){
    // req.flash('notice', 'Deleted successfully')
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
