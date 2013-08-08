/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

function bootstrapCards() {
  console.log('Bootstrapping the cards database...');

  var cards = [
    {
      cardId: 'small-guy',
      type: 'unit',
      name: 'Cannon Fodder',
      cost: 1,
      attack: 1,
      maxLife: 1,
      life: 1,
      moves: 1,
      movesLeft: 1,
      attacks: 1,
      attacksLeft: 1
    }, {
      cardId: 'big-guy',
      type: 'unit',
      name: 'Big Guy',
      cost: 4,
      attack: 3,
      maxLife: 3,
      life: 3,
      moves: 1,
      movesLeft: 1,
      attacks: 1,
      attacksLeft: 1
    }, {
      cardId: 'regenerator',
      type: 'unit',
      name: 'Ever-flowing Stream',
      cost: 4,
      attack: 2,
      maxLife: 3,
      life: 3,
      moves: 1,
      movesLeft: 1,
      attacks: 1,
      attacksLeft: 1
    }, {
      cardId: 'scout',
      type: 'unit',
      name: 'Liquid Scout',
      cost: 2,
      attack: 1,
      maxLife: 2,
      life: 2,
      moves: 3,
      movesLeft: 3,
      attacks: 1,
      attacksLeft: 1
    }, {
      cardId: 'flame',
      type: 'energy',
      name: 'Flame',
      cost: 0,
      energy: 1,
      maxEnergy: 1,
      attack: 0,
      maxLife: 2,
      life: 2
    }
  ];

  Card.createEach(cards).done(function(err, cards) {
    if (err) return console.log(err);
  });
}

module.exports.bootstrap = function (cb) {
  Card.find({}, function(err, cards) {
    if (cards.length === 0)
      bootstrapCards();

    // It's very important to trigger this callack method when you are finished 
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
  });
};
