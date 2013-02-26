var prettyjson = require('prettyjson');
var GameActions = require('./gameactions');

module.exports = (function () {

  var module = {};

  var initialState = {
    cards: {
      'small-unit': {
        name: 'Cannon Fodder',
        attack: 1,
        maxLife: 1,
        life: 1
      },
      'big-unit': {
        name: 'Big Guy',
        attack: 3,
        maxLife: 3,
        life: 3
      }
    },
    players: [
      {
        id: 'player1',
        library: ['big-unit', 'big-unit', 'big-unit', 'big-unit'],
        hand: ['big-unit', 'small-unit', 'big-unit', 'big-unit']
      },
      {
        id: 'player2',
        library: ['small-unit', 'small-unit', 'small-unit', 'small-unit'],
        hand: ['small-unit', 'small-unit', 'small-unit', 'small-unit']
      }
    ],
    currentPlayer: 0,
    board: [
      [{type: 'empty', x: 0, y: 0}, {type: 'empty', x: 1, y: 0}, {type: 'empty', x: 2, y: 0}],
      [{type: 'empty', x: 0, y: 1}, {type: 'empty', x: 1, y: 1}, {type: 'empty', x: 2, y: 1}],
      [{type: 'empty', x: 0, y: 2}, {type: 'empty', x: 1, y: 2}, {type: 'empty', x: 2, y: 2}]
    ]
  };

  var gameActions = new GameActions();

  module.playEvents = function(events) {
    var state = clone(initialState);
    for (var i in events) {
      var e = events[i];
      console.log('-------------- event --------------\n' + prettyjson.render(e));
      gameActions[e.action](e.data, state);
    }
    return state;
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return module;

}());
