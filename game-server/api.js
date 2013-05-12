
var GameActions = require('./gameactions'),
    _ = require('underscore'),
    util = require('util'),
    mongoose = require('mongoose'),
    async = require('async');


module.exports = (function () {

  var module = {};

  module.performAction = function(game, eventData, callback) {
    playEventsOnState(game.initialState, game.actions, function (state) {
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
      if (eventData.action === 'endTurn') {
        var nextPlayer = state.players[(state.currentPlayer+1)%state.players.length];
        if (nextPlayer.type === 'ai')
          takeTurnByAI(game);
      }

      callback(result);
    });
  };

  function takeTurnByAI(game) {
    console.log('AI considering actions...');

    var aiActions = [];

    // while (true) {
      var events = [].concat(game.actions);
      var allEvents = events.concat(aiActions);
      playEventsOnState(game.initialState, allEvents, function (state) {

        var gameActions = new GameActions(state);
        var initialStateValue = gameActions.getStateValue();
        var possibleActions = gameActions.getPossibleActionsWithoutEndTurn();
        var endTurnAction = { action: 'endTurn', data: {} };

        if (possibleActions.length === 0) {
          console.log('AI: No more possible actions');
          aiActions.push(endTurnAction);
          return;
        }

        async.parallel(possibleActions, function(action, cb) {
          getValueForAction(state, action, function (value) {
            action.value = value  - initialStateValue;
            cb();
          });
        }, function (err) {
          if (err)
            console.log('Error getting values for possible actions');

          var action = _.max(possibleActions, function(action) {
            return action.value;
          });

          if (!action || action.value <= 0)
            action = endTurnAction;

          console.log('AI: Chose action: ' + action.action); //util.inspect(action));
          aiActions.push(action);
          if (action.action === 'endTurn')
            return;

          for (var i = 0; i < aiActions.length; i++) {
            game.persistAction(aiActions[i]);
          };
        });

      });
      
    // }    
  }

  function getValueForAction(state, action) {
    playEventsOnState(state, [action], function (tempState) {
      var gameActions = new GameActions(tempState);
      var value = gameActions.getStateValue();
      callback(value);
    });
  }

  function playEventsOnState(state, actions, callback) {
    var newState = clone(state);
    newState.actionList = [];
    newState.actionCount = 0;
    var gameActions = new GameActions(newState);

    var doAction = function(action, cb) {
      gameActions[action.action](action.data, function (err) {
        if (err) {
          cb(err);
          return;
        }

        gameActions.checkWinner();
        newState.actionList.push({"player": newState.players[newState.currentPlayer].name, "action": action.action});
        newState.actionCount++;
        cb();
      });
    };

    if (actions.length === 0) {
      callback(newState);
      return;
    }

    async.each(actions, doAction, function (err) {
      if (err)
        console.log("Error performing actions!");

      callback(newState);
    });
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  module.getGameState = function(game, actionCount, callback) {
    var startTime = (new Date()).getTime();
    var actions = _.first(game.actions, actionCount);

    playEventsOnState(game.initialState, actions, function (state) {
      var endTime = (new Date()).getTime();
      var timeDiff = endTime - startTime;
      var timePerEvent = (actions.length === 0 ? '0' : (timeDiff / actions.length).toFixed(2));
      console.log('[getGameState] Elapsed time: ' + timeDiff + ' ms. for ' + actions.length + ' actions (' + timePerEvent + ' ms./event)');
      callback(state);
    });
  };

  return module;

}());

