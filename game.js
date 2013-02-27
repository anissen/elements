var prettyjson = require('prettyjson');
var GameActions = require('./gameactions');

module.exports = (function () {

  var module = {};

  var initialState = {
    cards: {
      'small-unit': {
        type: 'unit',
        name: 'Cannon Fodder',
        attack: 1,
        maxLife: 1,
        life: 1
      },
      'big-unit': {
        type: 'unit',
        name: 'Big Guy',
        attack: 3,
        maxLife: 3,
        life: 3
      },
      'fire': {
        type: 'energy-source',
        name: 'Flame',
        attack: 0,
        maxLife: 2,
        life: 2
      },
      'water': {
        type: 'energy-source',
        name: 'Pond',
        attack: 0,
        maxLife: 2,
        life: 2
      },
      'flame-lick': {
        type: 'spell',
        name: 'Flame Lick',
        scriptFile: 'flamelick.js'
      },
      'meteor': {
        type: 'spell',
        name: 'Meteor',
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
      [{type: 'empty', x: 0, y: 0}, {type: 'empty', x: 1, y: 0}, {type: 'empty', x: 2, y: 0}, {type: 'empty', x: 3, y: 0}],
      [{type: 'empty', x: 0, y: 1}, {type: 'empty', x: 1, y: 1}, {type: 'empty', x: 2, y: 1}, {type: 'empty', x: 3, y: 1}],
      [{type: 'empty', x: 0, y: 2}, {type: 'empty', x: 1, y: 2}, {type: 'empty', x: 2, y: 2}, {type: 'empty', x: 3, y: 2}],
      [{type: 'empty', x: 0, y: 3}, {type: 'empty', x: 1, y: 3}, {type: 'empty', x: 2, y: 3}, {type: 'empty', x: 3, y: 3}],
      [{type: 'empty', x: 0, y: 4}, {type: 'empty', x: 1, y: 4}, {type: 'empty', x: 2, y: 4}, {type: 'empty', x: 3, y: 4}]
    ]
  };

  //var gameActions = new GameActions();

  module.playEvents = function(events) {
    console.log(initialState.cards.meteor.spell);
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
