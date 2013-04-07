{
  "id": "small-unit",
  "type": "unit",
  "name": "Cannon Fodder",
  "cost": 1,
  "attack": 1,
  "maxLife": 1,
  "life": 1,
  "moves": 1,
  "movesLeft": 1,
  "attacks": 1,
  "attacksLeft": 1
}
{
  "id": "big-unit",
  "type": "unit",
  "name": "Big Guy",
  "cost": 4,
  "attack": 3,
  "maxLife": 3,
  "life": 3,
  "moves": 1,
  "movesLeft": 1,
  "attacks": 1,
  "attacksLeft": 1
}
{
  "id": "regenerator",
  "type": "unit",
  "name": "Ever-flowing Stream",
  "cost": 4,
  "attack": 2,
  "maxLife": 3,
  "life": 3,
  "moves": 1,
  "movesLeft": 1,
  "attacks": 1,
  "attacksLeft": 1,
  "onTurnStart": "heal-self.js"
}
{
  "id": "scout",
  "type": "unit",
  "name": "Liquid Scout",
  "cost": 2,
  "attack": 1,
  "maxLife": 2,
  "life": 2,
  "moves": 3,
  "movesLeft": 3,
  "attacks": 1,
  "attacksLeft": 1
}
{
  "id": "fire",
  "type": "energy",
  "name": "Flame",
  "cost": 0,
  "energy": 1,
  "maxEnergy": 1,
  "attack": 0,
  "maxLife": 2,
  "life": 2
}
{
  "id": "water",
  "type": "energy",
  "name": "Pond",
  "cost": 0,
  "energy": 1,
  "maxEnergy": 3,
  "attack": 0,
  "maxLife": 2,
  "life": 2
}
{
  "id": "flame-lick",
  "type": "spell",
  "name": "Flame Lick",
  "cost": 1,
  "scriptFile": "flamelick.js"
}
{
  "id": "fireball",
  "type": "spell",
  "name": "Fireball",
  "cost": 5,
  "scriptFile": "fireball.js"
}
