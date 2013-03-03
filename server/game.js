var prettyjson = require('prettyjson');
var GameActions = require('./gameactions');
var _ = require('underscore');

module.exports = (function () {

  var module = {};

  var initialState = {
    cards: {
      'empty': {
        type: 'empty'
      },
      'small-unit': {
        type: 'unit',
        name: 'Cannon Fodder',
        cost: 1,
        attack: 1,
        maxLife: 1,
        life: 1
      },
      'big-unit': {
        type: 'unit',
        name: 'Big Guy',
        cost: 4,
        attack: 3,
        maxLife: 3,
        life: 3
      },
      'fire': {
        type: 'energy',
        name: 'Flame',
        cost: 0,
        energy: 3,
        maxEnergy: 1,
        attack: 0,
        maxLife: 2,
        life: 2
      },
      'water': {
        type: 'energy',
        name: 'Pond',
        cost: 0,
        energy: 3,
        maxEnergy: 3,
        attack: 0,
        maxLife: 2,
        life: 2
      },
      'flame-lick': {
        type: 'spell',
        name: 'Flame Lick',
        cost: 1,
        scriptFile: 'flamelick.js'
      },
      'Fireball': {
        type: 'spell',
        name: 'Fireball',
        cost: 5,
        scriptFile: 'fireball.js'
      }
    },
    players: [
      {
        id: 'player1',
        library: ['water', 'big-unit', 'big-unit', 'big-unit'],
        hand: ['big-unit', 'small-unit', 'water', 'big-unit']
      },
      {
        id: 'player2',
        library: ['small-unit', 'fire', 'small-unit', 'small-unit'],
        hand: ['small-unit', 'small-unit', 'fire', 'flame-lick', 'Fireball']
      }
    ],
    currentPlayer: 0,
    board: [
      [{card: 'empty'}, {card: 'fire', player: 1}, {card: 'fire', player: 1}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'small-unit', player: 0}, {card: 'empty'}, {card: 'empty'}, {card: 'empty'}],
      [{card: 'empty'}, {card: 'water', player: 0}, {card: 'water', player: 0}, {card: 'empty'}, {card: 'empty'}]
    ]
  };

  for (var y = 0; y < initialState.board.length; y++) {
    var row = initialState.board[y];
    for (var x = 0; x < row.length; x++) {
      var tile = row[x];
      var card = _.clone(initialState.cards[tile.card]);

      if (tile.player !== undefined)
        card.player = tile.player;
      card.x = x;
      card.y = y;
      row[x] = card;
    }
  }

  module.playEvents = function(events) {
    var state = clone(initialState);
    var gameActions = new GameActions(state);
    try {
      for (var i in events) {
        eventIndex = i;
        var e = events[i];
        // console.log('-------------- event --------------\n' + prettyjson.render(e));
        gameActions[e.action](e.data);
      }
    } catch (err) {
      console.log('error', err);
    }
    return state;
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return module;

}());
