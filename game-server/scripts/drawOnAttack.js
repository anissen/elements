
//print('game', game);
game.on('attack', function (attacker, defender) {
  print('attacks');
  print('-- attacker', attacker);
  print('-- defender', defender);
  // if attacker.id === this.id && defender.type === 'energy'
  if (defender.type === 'energy')
    drawCards(1);
});
