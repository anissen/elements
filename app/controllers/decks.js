var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User'),
    Card = mongoose.model('Card'),
    Deck = mongoose.model('Deck'),
    _ = require('underscore');

/**
 * Find deck by id
 */

exports.deck = function(req, res, next, id) {
  Deck.load(id, function (err, deck) {
    if (err) return next(err);
    if (!deck) return next(new Error('Failed to load deck ' + id));
    req.deck = deck;
    next();
  });
};

/**
 * New deck
 */

exports.new = function(req, res) {
  User
    .find({}, {'name': 1})
    .exec(function (err, users) {

      Card.list(function (err, cards) {

        res.render('decks/new', {
          title: 'New deck',
          deck: new Deck({}),
          users: users,
          cards: cards
        });

      })
      
    });
};

/**
 * Create an deck
 */

exports.create = function (req, res) {
  var cardArray = [].concat(req.body.cards);

  Card.loadList(cardArray, function (err, cards) {
    if (err) {
      console.log('error loading card list');
      return;
    }

    var deck = new Deck({
      owner: req.user._id,
      name: 'Deck of the Dummies',
      cards: cards
    });

    deck.save(function (err) {
      if (err) {
        console.log('error!', err);
        res.render('decks/new', {
          title: 'New Deck',
          deck: deck,
          errors: err.errors
        });
      }

      res.redirect('/decks/' + deck._id);
    });
  });
};


/**
 * Edit an deck
 */

exports.edit = function (req, res) {
  res.render('decks/edit', {
    //title: 'Edit ' + req.deck.title,
    //users: users,
    //deck: req.deck
  });
};

/**
 * Update deck
 */

exports.update = function(req, res){
  var deck = req.deck;
  deck = _.extend(deck, req.body);
  deck.save(function(err) {
    if (err) {
      res.render('decks/edit', {
        title: 'Edit Deck',
        deck: deck,
        errors: err.errors
      });
    }
    else {
      res.redirect('/decks/' + deck._id);
    }
  });
};

/**
 * View an deck
 */

exports.show = function(req, res){
  Deck
    .findOne({ _id: req.deck })
    .lean()
    .populate('cards', 'name')
    .exec(function (err, deck) {

      res.render('decks/show', {
        deck: deck
      });

    });
};

/**
 * Delete a deck
 */

exports.destroy = function(req, res){
  var deck = req.deck;
  deck.remove(function(err) {
    if (err)
      req.flash('notice', 'Could not delete: ' + err);
    else
      req.flash('notice', 'Deleted successfully');

    res.redirect('/decks');
  });
};

/**
 * List of Decks
 */

exports.index = function(req, res){
  var page = req.param('page') > 0 ? req.param('page') : 0;
  var perPage = 15;
  var options = {
    perPage: perPage,
    page: page
  };

  Deck.list(options, function(err, decks) {
    if (err)
      return res.render('500');
    Deck.count().exec(function (err, count) {
      res.render('decks/index', {
        title: 'List of Decks',
        decks: decks,
        page: page,
        pages: count / perPage
      });
    });
  });
};
