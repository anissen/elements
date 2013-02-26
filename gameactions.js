
module.exports = (function () {
  return function() {

    this.play = function(data, state) {
      var player = state.players[state.currentPlayer];
      var cardIndex = player.hand.indexOf(data.cardId);
      if (cardIndex < 0)
        throw new Error('No card with id "' + data.cardId + '" on the following hand "' + player.hand + '"');
      player.hand.splice(cardIndex, 1);

      var card = state.cards[data.cardId];
      card.player = player.id;
      var newCard = clone(card);
      //newCard.id = data.cardId + '-' + Math.floor(Math.random() * 100);
      newCard.type = 'unit';
      newCard.x = data.x;
      newCard.y = data.y;
      state.board[data.y][data.x] = newCard;
    };

    this.move = function(data, state) {
      var unit = state.board[data.fromY][data.fromX];
      state.board[data.fromY][data.fromX] = {type: 'empty', x: data.fromX, y: data.fromY };
      unit.x = data.toX;
      unit.y = data.toY;
      state.board[data.toY][data.toX] = unit;
    };

    this.attack = function(data, state) {
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
    };

    this.endTurn = function(data, state) {
      state.currentPlayer = (state.currentPlayer + 1) % state.players.length;

      // draw a card for the next player
      var player = state.players[state.currentPlayer];
      var numberOfCards = 1;
      var cards = player.library.splice(0, numberOfCards);
      player.hand = player.hand.concat(cards);
    };

    function clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }

  };
}());
