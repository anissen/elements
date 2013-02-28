var prettyjson = require('prettyjson');
var GameActions = require('./gameactions');

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
        energy: 1,
        maxEnergy: 1,
        attack: 0,
        maxLife: 2,
        life: 2
      },
      'water': {
        type: 'energy',
        name: 'Pond',
        energy: 1,
        maxEnergy: 1,
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
      'meteor': {
        type: 'spell',
        name: 'Meteor',
        cost: 5,
        scriptFile: 'meteor.js'
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
        hand: ['small-unit', 'small-unit', 'fire', 'flame-lick', 'meteor']
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
    /*
    board: [
      [{type: 'empty', x: 0, y: 0}, {type: 'empty', x: 1, y: 0}, {type: 'empty', x: 2, y: 0}, {type: 'empty', x: 3, y: 0}],
      [{type: 'empty', x: 0, y: 1}, {type: 'empty', x: 1, y: 1}, {type: 'empty', x: 2, y: 1}, {type: 'empty', x: 3, y: 1}],
      [{type: 'empty', x: 0, y: 2}, {type: 'empty', x: 1, y: 2}, {type: 'empty', x: 2, y: 2}, {type: 'empty', x: 3, y: 2}],
      [{type: 'empty', x: 0, y: 3}, {type: 'empty', x: 1, y: 3}, {type: 'empty', x: 2, y: 3}, {type: 'empty', x: 3, y: 3}],
      [{type: 'empty', x: 0, y: 4}, {type: 'empty', x: 1, y: 4}, {type: 'empty', x: 2, y: 4}, {type: 'empty', x: 3, y: 4}]
    ]
    */
  };

  for (var y = 0; y < initialState.board.length; y++) {
    var row = initialState.board[y];
    for (var x = 0; x < row.length; x++) {
      var tile = row[x];
      var card = clone(initialState.cards[tile.card]);
      var newCard = clone(card);

      if (tile.player !== undefined)
        newCard.player = tile.player;
      newCard.x = x;
      newCard.y = y;
      row[x] = newCard;
    }
  }

  //var gameActions = new GameActions();

  module.playEvents = function(events) {
    var state = clone(initialState);
    var gameActions = new GameActions(state);
    for (var i in events) {
      var e = events[i];
      console.log('-------------- event --------------\n' + prettyjson.render(e));
      gameActions[e.action](e.data);
    }
    return state;
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return module;

}());
