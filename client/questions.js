
var clc = require('cli-color');
var _ = require("underscore");

module.exports.getQuestions = function(state, validActions) {

  var actionQuestion = {
    type: "list",
    name: "type",
    message: "Which action do you wish to take",
    choices: [
      { name: "Play card " + clc.green(getActionsOfType('play').length + ' actions'), value: "play" },
      { name: "Move unit " + clc.green(getActionsOfType('move').length + ' actions'), value: "move" },
      { name: "Attack with unit " + clc.green(getActionsOfType('attack').length + ' actions'), value: "attack" },
      { name: "End turn " + clc.green(getActionsOfType('end-turn').length + ' action'), value: "endturn" }
    ]
  };

  function cardToPlayTextFromId(cardId) {
    var card = _.find(state.players[state.currentPlayer].hand, function(card) {
      return card.id === cardId;
    });
    return card.name + ' [' + card.attack + '/' + card.life + '] (' + card.cost + ' energy)';
  }

  function cardToMoveTextFromId(entityId) {
    var tile = _.find(_.values(state.board), function(tile) {
      return tile.entity && tile.entity.id === entityId;
    });
    return tile.entity.name + ' [' + tile.entity.attack + '/' + tile.entity.life + ']';
  }

  function getActionsOfType(type) {
    return _.filter(validActions, function(action) {
      return action.type === type;
    });
  }

  function cardAction(answer) {
    return _.chain(getActionsOfType(answer.type))
      .countBy(function(action) {
        return action.card;
      })
      .map(function(count, card) {
        var description;
        if (answer.type === 'play') {
          description = cardToPlayTextFromId(card);
        } else if (answer.type === 'move') {
          description = cardToMoveTextFromId(card);
        } else if (answer.type === 'attack') {
          description = 'attack: ' + cardToMoveTextFromId(card);
        }
        return {
          name: description + ' [' + count + ' targets]',
          value: card
        };
      })
      .value();
  }

  function target(answer) {
    return _.chain(validActions)
      .filter(function(action) {
        return action.type === answer.type && action.card === answer.card;
      })
      .map(function(action) {
        return {
          name: answer.type + ' @ ' + action.target,
          value: action.target
        };
      })
      .value();
  }

  var cardQuestion = {
    type: "list",
    when: function(answer) { return answer.type === 'play' || answer.type === 'move' || answer.type === 'attack'; },
    name: "card",
    message: "Choose card",
    choices: cardAction
  };

  var targetQuestion = {
    type: "list",
    when: function(answer) { return answer.type === 'play' || answer.type === 'move' || answer.type === 'attack'; },
    name: "target",
    message: "Target",
    choices: target
  };

  return [actionQuestion, cardQuestion, targetQuestion];
};
