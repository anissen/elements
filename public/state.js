
function stateCtrl($scope, $http) {
  $scope.state = {};
  $scope.selectedUnit = null;

  $scope.getState = function() {
    $http.get('game/42/false')
      .success(function(state) {
        $scope.state = state;
      })
      .error(function() {
        alert('get state failed');
      });
  };

  $scope.getCardsInOwnHand = function() {
    return getCardsInHand($scope.state.currentPlayer);
  };

  $scope.getCardsInEnemyHand = function() {
    if ($scope.state.currentPlayer === undefined)
      return [];
    return getCardsInHand(($scope.state.currentPlayer+1)%2);
  };

  function getCardsInHand(playerId) {
    var state = $scope.state;
    if (playerId === undefined)
      return [];

    var hand = state.players[playerId].hand;
    var cards = [];
    for (var i = 0; i < hand.length; i++) {
      var cardId = hand[i];
      var card = state.cards[cardId];
      card.cardId = cardId;
      cards.push(card);
    }
    return cards;
  }

  $scope.playCard = function() {
    postAction('play', { cardId: prompt('card id', 'big-unit'), x: prompt('x', 2), y: prompt('y', 2) });
  };

  $scope.endTurn = function() {
    postAction('endTurn', {});

    deselectSelectedCard();
    deselectSelectedUnit();
  };

  $scope.selectCard = function(card) {
    deselectSelectedUnit();
    deselectSelectedCard();
    $scope.selectedCard = card;
    card.selected = true;
  };

  $scope.selectUnit = function(unit) {
    deselectSelectedCard();

    var ownUnitIsSelected = ($scope.selectedUnit);
    var enemyUnitSelected = (unit.player !== $scope.state.players[$scope.state.currentPlayer].id);
    if (!ownUnitIsSelected && enemyUnitSelected) { // selecting only an enemy unit
      alert('not your unit');
    } else if (ownUnitIsSelected && enemyUnitSelected) { // selected own unit THEN an enemy unit
      postAction('attack', { "fromX": $scope.selectedUnit.x, "fromY": $scope.selectedUnit.y, "toX": unit.x, "toY": unit.y});
    } else { // Just selected own unit
      deselectSelectedUnit();
      $scope.selectedUnit = unit;
      unit.selected = true;
    }
  };

  $scope.selectTile = function(tile) {
    if (!$scope.selectedUnit && !$scope.selectedCard)
      return;

    if ($scope.selectedUnit) {
      var unit = $scope.selectedUnit;
      if (unit.x === tile.x && unit.y === tile.y)
        return;

      if (tile.type !== 'empty') {
        //alert('cannot move to non-empty tile');
        return;
      }

      postAction('move', { "fromX": unit.x, "fromY": unit.y, "toX": tile.x, "toY": tile.y });
    } else if ($scope.selectedCard) {
      postAction('play', { "cardId": $scope.selectedCard.cardId, "x": tile.x, "y": tile.y });
    }
  };

  function postAction(action, data) {
    $http.post('game/42', { action: action, data: data })
    .success(function(msg) {
      $scope.getState();
      console.log('Action posted with success: ' + msg);
    })
    .error(function(msg) {
      alert('Action posted with failure: ' + msg);
    });
  }

  function deselectSelectedUnit() {
    var oldSelected = $scope.selectedUnit;
    if (oldSelected)
      oldSelected.selected = false;
    $scope.selectedUnit = null;
  }

  function deselectSelectedCard() {
    var oldSelected = $scope.selectedCard;
    if (oldSelected)
      oldSelected.selected = false;
    $scope.selectedCard = null;
  }

  $scope.getState();
}
