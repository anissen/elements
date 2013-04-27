
function stateCtrl($scope, $http) {
  $scope.state = {};
  $scope.selectedUnit = null;

  $scope.getState = function() {
    var nextActionCount = ($scope.state.actionCount || 0) + 1;
    $http.get('' + nextActionCount)
      .success(function(state) {
        $scope.state = state;
      })
      .error(function() {
        alert('get state failed');
      });
  };

  function playAllActions() {
    var actionsBefore = $scope.state.actionCount || 0;
    var interval = setInterval(function() {
      $scope.getState();

      if ($scope.state.actionCount === actionsBefore)
        clearInterval(interval);

      actionsBefore = $scope.state.actionCount;
    }, 500);
  }

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

  $scope.endTurn = function() {
    postAction('endTurn', {});
    playAllActions();

    deselectSelectedCard();
    deselectSelectedUnit();
  };

  $scope.selectCard = function(card) {
    deselectSelectedUnit();
    if (card === $scope.selectedCard) {
      deselectSelectedCard();
      return;
    }
    deselectSelectedCard();
    $scope.selectedCard = card;
    card.selected = true;
  };

  $scope.selectUnit = function(unit) {
    selectNonEmpty(unit);
  };

  $scope.selectEnergy = function(energy) {
    selectNonEmpty(energy);
  };

  $scope.selectEmpty = function(tile) {
    if (!$scope.selectedUnit && !$scope.selectedCard)
      return;

    if ($scope.selectedUnit) {
      var unit = $scope.selectedUnit;
      if (unit.x === tile.x && unit.y === tile.y)
        return;

      if (tile.type !== 'empty') {
        alert('cannot move to non-empty tile');
        return;
      }

      postAction('move', { "from": posJson(unit), "to": posJson(tile) });
    } else if ($scope.selectedCard) {
      postAction('play', { "cardId": $scope.selectedCard.cardId, "pos": posJson(tile) });
    }
  };

  function selectNonEmpty(tile) {
    //deselectSelectedCard();

    var ownUnitIsSelected = ($scope.selectedUnit);
    var enemyUnitSelected = (tile.player !== $scope.state.currentPlayer);
    if (!ownUnitIsSelected && enemyUnitSelected) { // selecting only an enemy unit
      if ($scope.selectedCard && $scope.selectedCard.type === 'spell') { // throw spell on enemy unit
        postAction('play', { "cardId": $scope.selectedCard.cardId, "pos": posJson(tile) });
      }
      //alert('not your unit');
    } else if (ownUnitIsSelected && enemyUnitSelected) { // selected own unit THEN an enemy unit
      postAction('attack', { "from": posJson($scope.selectedUnit), "to": posJson(tile) });
    } else { // Just selected own unit
      deselectSelectedUnit();
      $scope.selectedUnit = tile;
      tile.selected = true;
    }
  }

  function postAction(action, data) {
    $http.post('', { action: action, data: data })
    .success(function(msg) {
      if (!msg.success) {
        alert('Action "' + action + '" could not be performed.\n\nReason: ' + msg.message);
        return;
      }
      playAllActions();
    })
    .error(function(msg) {
      alert('Action posted with failure: ' + msg);
    });
  }

  function posJson(data) {
    return { "x": data.x, "y": data.y };
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

  playAllActions();
}
