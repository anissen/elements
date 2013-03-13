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
        life: 1,
        moves: 1,
        movesLeft: 1,
        attacks: 1,
        attacksLeft: 1
      },
      'big-unit': {
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
      },
      'regenerator': {
        type: 'unit',
        name: 'Ever-flowing Stream',
        cost: 4,
        attack: 2,
        maxLife: 3,
        life: 3,
        moves: 1,
        movesLeft: 1,
        attacks: 1,
        attacksLeft: 1,
        onTurnStart: 'heal-self.js'
      },
      'scout': {
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
      },
      'fire': {
        type: 'energy',
        name: 'Flame',
        cost: 0,
        energy: 1,
        maxEnergy: 1,
        attack: 0,
        maxLife: 2,
        life: 2
      },
      'water': {
        type: 'energy',
        name: 'Pond',
        cost: 0,
        energy: 1,
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
      'fireball': {
        type: 'spell',
        name: 'Fireball',
        cost: 5,
        scriptFile: 'fireball.js'
      }
    },
    players: [
      {
        id: 'HumanPlayer',
        type: 'human',
        library: ['water', 'big-unit', 'big-unit', 'big-unit'],
        hand: ['big-unit', 'small-unit', 'water', 'big-unit', 'regenerator', 'scout']
      },
      {
        id: 'ComputerPlayer',
        type: 'ai',
        library: ['small-unit', 'fire', 'small-unit', 'small-unit'],
        hand: ['small-unit', 'small-unit', 'fire', 'flame-lick', 'fireball']
      }
    ],
    currentPlayer: 0,
    actionCount: 0,
    actions: [],
    won: null,
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
      var card = clone(initialState.cards[tile.card]);

      if (tile.player !== undefined)
        card.player = tile.player;
      card.x = x;
      card.y = y;
      row[x] = card;
    }
  }

  for (var cardId in initialState.cards) {
    initialState.cards[cardId].id = cardId;
  }

  module.playEvents = function(events, currentState) {
    var state = (currentState ? clone(currentState) : clone(initialState));
    var gameActions = new GameActions(state);
    for (var i in events) {
      var e = events[i];
      gameActions[e.action](e.data);
      gameActions.checkWinner();
      state.actions.push({"player": state.players[state.currentPlayer].id, "action": e.action});
      state.actionCount++;
    }
    return state;
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return module;

}());
