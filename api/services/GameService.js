
var GameActions = require('./../game/game'),
    _ = require('underscore');

exports.performAction = function(game, eventData, callback) {
  console.log('game', game);
  var state = playEventsOnState(game.initialState, game.actions);

  var gameActions = new GameActions(state);
  var possibleActions = gameActions.getPossibleActions();

  var actionLegal = _.some(possibleActions, function(action) {
    return _.isEqual(eventData, action);
  });

  var result = { success: actionLegal };
  if (!actionLegal) {
    result.message = 'Invalid action: ' + JSON.stringify(eventData);
    callback(result);
    return;
  }

  game.persistAction(eventData);

  // HACK:
  // TODO: This should be handled via an event, e.g. this.emit('next player', nextPlayer)
  if (eventData.action === 'endTurn') {
    var nextPlayer = state.players[(state.currentPlayer+1)%state.players.length];
    if (nextPlayer.user.playerType === 'ai')
      takeTurnByAI(game);
  }

  callback(result);
};

function takeTurnByAI(game) {
  console.log('AI considering actions...');

  var aiActions = [];

  while (true) {
    var events = [].concat(game.actions);
    var allEvents = events.concat(aiActions);
    var state = playEventsOnState(game.initialState, allEvents);
    var gameActions = new GameActions(state);
    var initialStateValue = gameActions.getStateValue();
    var possibleActions = gameActions.getPossibleActionsWithoutEndTurn();
    var endTurnAction = { action: 'endTurn', data: {} };

    if (possibleActions.length === 0) {
      console.log('AI: No more possible actions');
      aiActions.push(endTurnAction);
      break;
    }

    _.each(possibleActions, function(action) {
      action.value = getValueForAction(state, action) - initialStateValue;
    });

    var action = _.max(_.shuffle(possibleActions), function(action) {
      return action.value;
    });

    if (!action || action.value <= 0)
      action = endTurnAction;

    console.log('AI: Chose action: ' + action.action);
    aiActions.push(action);
    if (action.action === 'endTurn')
      break;
  }

  for (var i = 0; i < aiActions.length; i++) {
    game.persistAction(aiActions[i]);
  };
}

function getValueForAction(state, action) {
  var tempState = playEventsOnState(state, [action]);
  var gameActions = new GameActions(tempState);
  var value = gameActions.getStateValue();
  return value;
}

function playEventsOnState(state, actions) {
  var newState = clone(state);
  newState.actionList = [];
  newState.actionCount = 0;
  var gameActions = new GameActions(newState);
  //gameActions.on('playedCard', function (card) {
    //console.log('EVENT: playedCard', card);
  //});

  for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    gameActions[action.action](action.data);
    gameActions.checkWinner();
    newState.actionList.push({
      player: newState.players[newState.currentPlayer].user.name, 
      action: action.action
    });
    newState.actionCount++;
  };

  gameActions.updateBoard(); // TODO: This is ugly, fix it (gameActions.getBoard() from map)

  return newState;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

exports.getGameState = function(game, actionCount, callback) {
  var startTime = (new Date()).getTime();
  var actions = _.first(game.actions, actionCount);

  var state = playEventsOnState(game.initialState, actions);
  state.lastAction = (actionCount >= game.actions.length);

  var endTime = (new Date()).getTime();
  var timeDiff = endTime - startTime;
  var timePerEvent = (actions.length === 0 ? '0' : (timeDiff / actions.length).toFixed(2));
  console.log('[getGameState] Elapsed time: ' + timeDiff + ' ms. for ' + actions.length + ' actions (' + timePerEvent + ' ms./event)');
  //console.log(state.board);
  callback(state);
};
