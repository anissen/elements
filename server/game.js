var GameActions = require('./gameactions'),
    _ = require('underscore'),
    cardList = require('./cards');

module.exports = (function () {

  var module = {};

  var initialState = {
    cards: cardList,
    players: [
      {
        id: 'HumanPlayer',
        type: 'human',
        library: ['water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit'],
        hand: ['big-unit', 'small-unit', 'water', 'big-unit', 'flame-lick', 'regenerator', 'scout']
      },
      {
        id: 'ComputerPlayer',
        type: 'ai',
        //library: ['water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit', 'water', 'big-unit'],
        //hand: ['big-unit', 'small-unit', 'water', 'big-unit', 'flame-lick', 'regenerator', 'scout']
        library: ['small-unit', 'fire', 'small-unit', 'fire', 'small-unit', 'small-unit', 'fire', 'small-unit', 'fire', 'small-unit'],
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

  for (var playerId = 0; playerId < initialState.players.length; playerId++) {
    initialState.players[playerId].library = _.shuffle(initialState.players[playerId].library);
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
