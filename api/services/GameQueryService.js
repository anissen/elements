
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


exports.query = function(state) {

  var queryObj = {};

  queryObj.units = function() {
    return _.filter(state.board, function(tile) {
      return tile.entity && tile.entity.type === 'unit';
    });
  };

  queryObj.energy = function() {
    return _.filter(state.board, function(tile) {
      return tile.entity && tile.entity.type === 'energy';
    });
  };

  queryObj.ownedByPlayer = function(player) {
    return _.filter(state.board, function(tile) {
      return tile.entity && tile.entity.player === player;
    });
  };

  queryObj.getCurrentPlayer = function() {
    this.valueType = 'player';
    this.values = state.players[state.currentPlayer];
    return this;
  };

  queryObj.getNthPlayer = function(playerId) {
    this.valueType = 'player';
    this.values = state.players[playerId];
    return this;
  };

  queryObj.getCardInHand = function(cardId) {
    if (this.valueType !== 'player')
      throw 'valueType is expected to be "player", but was "' + this.valueType + '"';

    this.valueType = 'card';
    this.values = _.chain(this.values.hand)
      .filter(function(card) {
        return card.id === cardId;
      })
      .first()
      .value();

    return this;
  };

  queryObj.getEntity = function(cardId) {
    this.valueType = 'entity';
    this.values = _.chain(state.board)
      .filter(function(tile) {
        return tile.entity && tile.entity.id === cardId;
      })
      .first()
      .value()
      .entity;

    return this;
  };

  queryObj.value = function() {
    return this.values;
  }

  return queryObj;
};


//
// Generation of possible actions
//

/*
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
  value += getValueOfPlayersThings(game.currentPlayer);
  value -= getValueOfPlayersThings((game.currentPlayer + 1) % 2);
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
  var cardsOnHandValue = game.players[playerId].hand.length * valuePerCard;

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
    game.won = [];
  else if (player0Lost && player1Lost)
    game.won = [0, 1];
  else if (player0Lost)
    game.won = [1];
  else if (player1Lost)
    game.won = [0];
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
      return tile.type !== 'empty' && tile.player !== game.currentPlayer;
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

  console.log('availableEnergy', availableEnergy);

  return _.chain(getAllCardsInHand())
    .filter(function(card) {
      console.log('card ', card.name, 'cost', card.cost);
      return card.cost <= availableEnergy;
    })
    .map(getValidPlaysForCard)
    .flatten()
    .value();
}

function getCurrentPlayer() {
  return game.players[game.currentPlayer];
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
  return tile.player === game.currentPlayer && tile.type === 'energy';
}

function playerUnitTilesQuery(tile) {
  return tile.player === game.currentPlayer && tile.type === 'unit';
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
*/
