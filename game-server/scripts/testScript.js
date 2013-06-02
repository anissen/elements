
game.on('turn started', function () {
  if (getCurrentPlayerIndex() === entity.player) {
    // +2 to attack until end of turn
    
    /*
    untilEndOfTurn(function() {

    });
    */

    entity.data.attack += 2;
  } else {
    // +2 to life until end of turn
    entity.data.life += 2;
  }

  updateEntity(entity);
});
