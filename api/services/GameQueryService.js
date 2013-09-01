
var GameInstance = require('./../game/game'),
    _ = require('underscore');

// proposed API:
/*

GameQueryService.query(state)
  .units()
  .where(function(unit) { 
    return unit.life <= 2;
  });

GameQueryService.query(state)
  .tiles()
  .ownedByPlayer(0)
  .withinRangeOf(2, '2,2');

*/


/*
exports.query = function(state) {

  var selectionQueryObj = { values: [] };
  var filterQueryObj = {};

  selectionQueryObj.from = function() {
    return this;
  };

  selectionQueryObj.board = function() {
    this.values = this.values.concat(_.values(state.board));
    return this;
  };

  selectionQueryObj.hands = function() {
    var allHands = _.map(state.players, function(player) {
      return _.map(player.hand, function(card) {
        return { entity: card };
      });
    });
    this.values = _.flatten(this.values.concat(allHands));
    return this;
  };

  selectionQueryObj.filter = function() {
    filterQueryObj.values = _.chain(this.values);
    return filterQueryObj;
  };

  filterQueryObj.byEmpty = function() {
    return this.values.filter(function(tile) {
      return tile.entity === null;
    });
  };

  filterQueryObj.byUnits = function() {
    this.values = this.values.filter(function(tile) {
      return tile.type === 'unit' || (tile.entity && tile.entity.type === 'unit');
    });
    return this;
  };

  filterQueryObj.byEnergy = function() {
    this.values = this.values.filter(function(tile) {
      return tile.entity && tile.entity.type === 'energy';
    });
    return this;
  };

  filterQueryObj.byPlayerId = function(player) {
    this.values = this.values.filter(function(tile) {
      return tile.entity && tile.entity.player === player;
    });
    return this;
  };

  filterQueryObj.byCurrentPlayer = function() {
    this.values = this.values.filter(function(tile) {
      return tile.entity && tile.entity.player === state.currentPlayer;
    });
    return this;
  };

  filterQueryObj.byId = function(cardId) {
    this.values = this.values.filter(function(tile) {
      return tile.entity && tile.entity.id === cardId;
    });
    return this;
  };

  filterQueryObj.results = function() {
    return this.values.value();
  };

  return selectionQueryObj;
};
*/

var state;
var map;

exports.setState = function(s) {
  state = s;
};

exports.setMap = function(m) {
  map = m;
};

function getValidPlaysForCard(card) {
  return _.map(getValidTargetsForCard(card), function(target) {
    return {
      type: 'play',
      card: card.id,
      target: Hex(target.x, target.y).id
    };
  });
}

function getValidTargetsForCard(card) {
  //if (card.type === 'spell')
  //  return getTiles(); // TODO: Need more precise specification and handling of targets

  return _.filter(state.board, function(tile) {
    // TODO: Need check for placement near energy source and sufficiant energy
    return tile.type === 'empty' &&
      _.some(getAdjacentTiles(tile), playerEnergyTilesQuery) &&
      getAvailableEnergyAtTile(tile) >= card.cost;
  });
}

function getTiles() {
  console.log(map.getValuesWithKeys('pos'));
  return map.getValuesWithKeys();
}

function getTileData(hexes) {
  return _.chain(hexes)
    .map(getTile)
    .compact()
    .value();
}

function getTile(hex) {
  var data = this.map.get(hex);
  if (!data)
    return null;
  return data.tile;
}

function getReachableTilesForCard(card) {
  var hexes = this.map.getReachableTiles(HexMap.Hex.fromString(hex), movement || 2, function(tile) {
    return tile.entity === null; //passable;
  });
  var hexIds = _.pluck(hexes, 'id');
  var hexesWithoutStart = _.reject(hexIds, function(H) {
    return H === hex;
  });
  return this.getTileData(hexesWithoutStart);
}

/*
filterQueryObj.getValidActions = function(cardId) {
  this.valueType = 'actions';

  var availableEnergy = _.chain(state.board)
    .filter(function(tile) {
      return tile.entity && 
        tile.entity.player === state.currentPlayer && 
        tile.entity.type === 'energy'
    })
    .reduce(function(sum, energy) {
      return sum + energy.energy;
    }, 0)
    .value();

  var cardsInHand = state.players[state.currentPlayer].hand;
  this.values = _.chain(cardsInHand)
    .filter(function(card) {
      return card.cost <= availableEnergy;
    })
    .map(getValidPlaysForCard)
    .flatten()
    .value()

  return this;
};
*/


//
// Generation of possible actions
//

this.getPossibleActions = function() {
  var turnActions = getPossibleTurnActions();
  return this.getPossibleActionsWithoutEndTurn().concat(turnActions);
};

this.getPossibleActionsWithoutEndTurn = function() {
  var moves = getPossibleMoves();
  var attacks = getPossibleAttacks();
  var plays = getPossiblePlays();
  return moves.concat(attacks).concat(plays);
};

this.getStateValue = function() {
  var value = 0;
  value += getValueOfPlayersThings(state.currentPlayer);
  value -= getValueOfPlayersThings((state.currentPlayer + 1) % 2);
  return value;
};

function getValueOfPlayersThings(playerId) {
  var valuePerUnit = 2;
  var unitValue = _.chain(getTiles())
    .filter(function(tile) {
      return tile.player === playerId && tile.type === 'unit';
    })
    .reduce(function(sum, unit) {
      return sum + valuePerUnit + unit.attack + unit.life;
    }, 0)
    .value();

  var valuePerCard = 2;
  var cardsOnHandValue = state.players[playerId].hand.length * valuePerCard;

  var energyLifeValue = 3;
  var energyValue = _.chain(getTiles())
    .filter(function(tile) {
      return tile.player === playerId && tile.type === 'energy';
    })
    .reduce(function(sum, energy) {
      return sum + energy.life * energyLifeValue + energy.energy;
    }, 0)
    .value();

    return unitValue + cardsOnHandValue + energyValue;
}

this.checkWinner = function() {
  var player0Lost = hasPlayerLost(0);
  var player1Lost = hasPlayerLost(1);
  if (!player0Lost && !player1Lost)
    state.won = [];
  else if (player0Lost && player1Lost)
    state.won = [0, 1];
  else if (player0Lost)
    state.won = [1];
  else if (player1Lost)
    state.won = [0];
};

function hasPlayerLost(playerId) {
  return !_.some(getTiles(), function(tile) {
    return tile.player === playerId && tile.type === 'energy';
  });
}

function getPossibleTurnActions() {
  return [{ type: 'end-turn', card: null, target: null }];
}

function getPossibleMoves() {
  return _.chain(getAllUnits())
    .filter(function(unit) { return unit.movesLeft > 0; })
    .map(getValidMovesForUnit)
    .flatten()
    .value();
}

function getValidMovesForUnit(unit) {
  return _.chain(getAdjacentTiles(unit))
    .filter(function(tile) {
      return tile.type === 'empty';
    })
    .map(function(move) {
      return {
        type: 'move',
        card: unit.id,
        target: Hex(move.x, move.y).id
      };
    })
    .value();
}

function getPossibleAttacks() {
  return _.chain(getAllUnits())
    .filter(function(unit) { return unit.attacksLeft > 0; })
    .map(getValidAttacksForUnit)
    .flatten()
    .value();
}

function getValidAttacksForUnit(unit) {
  return _.chain(getAdjacentTiles(unit))
    .filter(function(tile) {
      return tile.type !== 'empty' && tile.player !== state.currentPlayer;
    })
    .map(function(attack) {
      return {
        type: 'attack',
        card: unit.id,
        target: attack.id
      };
    })
    .value();
}

function getPossiblePlays() {
  var availableEnergy = _.chain(getTiles())
    .filter(playerEnergyTilesQuery)
    .reduce(function(sum, energy) {
      return sum + energy.energy;
    }, 0)
    .value();

  return _.chain(getAllCardsInHand())
    .filter(function(card) {
      return card.cost <= availableEnergy;
    })
    .map(getValidPlaysForCard)
    .flatten()
    .value();
}

function getCurrentPlayer() {
  return state.players[state.currentPlayer];
}

function getAllCardsInHand() {
  return getCurrentPlayer().hand;
}

function getValidPlaysForCard(card) {
  return _.map(getValidTargetsForCard(card), function(target) {
    return {
      type: 'play',
      card: card.id,
      target: Hex(target.x, target.y).id
    };
  });
}

function getValidTargetsForCard(card) {
  if (card.type === 'spell')
    return getTiles(); // TODO: Need more precise specification and handling of targets

  return _.filter(getTiles(), function(tile) {
    // TODO: Need check for placement near energy source and sufficiant energy
    return tile.type === 'empty' &&
      _.some(getAdjacentTiles(tile), playerEnergyTilesQuery) &&
      getAvailableEnergyAtTile(tile) >= card.cost;
  });
}

//
// End of Generation of possible actions
//

function getAllUnits() {
  return _.filter(getTiles(), playerUnitTilesQuery);
}

function playerEnergyTilesQuery(tile) {
  return tile.player === state.currentPlayer && tile.type === 'energy';
}

function playerUnitTilesQuery(tile) {
  return tile.player === state.currentPlayer && tile.type === 'unit';
}

function getEnergySourcesConnectedToTile(tile) {
  var closestSourcesFirstQuery = function(source) {
    return Math.abs(tile.x - source.x) + Math.abs(tile.y - source.y);
  };

  return _.chain(getTiles())
    .filter(playerEnergyTilesQuery)
    .sortBy(closestSourcesFirstQuery)
    .value();
}

function getAvailableEnergyAtTile(tile) {
  var energySources = getEnergySourcesConnectedToTile(tile);
  var availableEnergy = _.reduce(energySources, function(sum, tile){
    return sum + tile.energy;
  }, 0);
  return availableEnergy;
}
