var prettyjson = require('prettyjson');

module.exports = (function () {

  var module = {};

  var cards = {
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
  };

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
    /*
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ],
    */
    board: [
      [{type: 'empty', x: 0, y: 0}, {type: 'empty', x: 1, y: 0}, {type: 'empty', x: 2, y: 0}],
      [{type: 'empty', x: 0, y: 1}, {type: 'empty', x: 1, y: 1}, {type: 'empty', x: 2, y: 1}],
      [{type: 'empty', x: 0, y: 2}, {type: 'empty', x: 1, y: 2}, {type: 'empty', x: 2, y: 2}]
    ]
  };

  // TODO: Make this object literal into its own module
  var GameFunctions = {
    /*
    draw: function(data, state) {
      var player = state.players[state.currentPlayer];
      var cards = player.library.splice(0, data.cards);
      player.hand = player.hand.concat(cards);
    },*/
    play: function(data, state) {
      var player = state.players[state.currentPlayer];
      var cardIndex = player.hand.indexOf(data.cardId);
      if (cardIndex < 0)
        throw new Error('No card with id "' + data.cardId + '" on the following hand "' + player.hand + '"');
      player.hand.splice(cardIndex, 1);

      var card = cards[data.cardId];
      card.player = player.id;
      var newCard = clone(card);
      newCard.id = data.cardId + '-' + Math.floor(Math.random() * 100);
      newCard.type = 'unit';
      newCard.x = data.x;
      newCard.y = data.y;
      state.board[data.y][data.x] = newCard;
    },
    move: function(data, state) {
      var unit = state.board[data.fromY][data.fromX];
      state.board[data.fromY][data.fromX] = {type: 'empty', x: data.fromX, y: data.fromY };
      unit.x = data.toX;
      unit.y = data.toY;
      state.board[data.toY][data.toX] = unit;
    },
    attack: function(data, state) {
      var attackingUnit = state.board[data.fromY][data.fromX];
      var defendingUnit = state.board[data.toY][data.toX];
      defendingUnit.life -= attackingUnit.attack;
      attackingUnit.life -= defendingUnit.attack;
      if (defendingUnit.life <= 0) {
        // reset the defending units tile
        state.board[data.toY][data.toX] = {type: 'empty', x: data.toX, y: data.toY};
      }
      if (attackingUnit.life <= 0) {
        // reset the attacking units tile
        state.board[data.fromY][data.fromX] = {type: 'empty', x: data.fromX, y: data.fromY};
      }
    },
    endTurn: function(data, state) {
      state.currentPlayer = (state.currentPlayer + 1) % state.players.length;

      // draw a card for the next player
      var player = state.players[state.currentPlayer];
      var numberOfCards = 1;
      var cards = player.library.splice(0, numberOfCards);
      player.hand = player.hand.concat(cards);
    }
  };

  module.playEvents = function(events) {
    var state = clone(initialState);
    for (var i in events) {
      var e = events[i];
      console.log('-------------- event --------------\n' + prettyjson.render(e));
      GameFunctions[e.action](e.data, state);
    }
    return state;
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return module;

}());
