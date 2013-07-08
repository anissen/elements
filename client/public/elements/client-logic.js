
function gameCtrl($scope, $http) {
  $scope.state = {};
  $scope.selectedUnit = null;

  $scope.getState = function() {
    var nextActionCount = ($scope.state.actionCount || 0) + 1;
    $http.get('' + nextActionCount)
      .success(function(state) {
        //console.log(state);

        game.loadState(state);
        $scope.state = state;
      })
      .error(function() {
        console.error('Get state failed');
        $scope.state.lastAction = true;
      });
  };

  function playAllActions() {
    var interval = setInterval(function() {
      $scope.getState();

      if ($scope.state.lastAction)
        clearInterval(interval);
    }, 500);
  }

  playAllActions();
}
