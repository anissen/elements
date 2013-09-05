
var _ = require("underscore");
var inquirer = require("inquirer");

module.exports.askQuestions = function(state, validActions) {

  var actionQuestion = {
    type: "list",
    name: "action",
    message: "Which action do you wish to take",
    choices: [
      { name: "Play card", value: "play" },
      { name: "Move unit", value: "move" },
      { name: "End turn", value: "endturn" }
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

  function cardAction(answer) {
    return _.chain(validActions)
      .filter(function(action) {
        return action.type === answer.action;
      })
      .countBy(function(action) {
        return action.card;
      })
      .map(function(count, card) {
        var description;
        if (answer.action === 'play') {
          description = cardToPlayTextFromId(card);
        } else if (answer.action === 'move') {
          description = cardToMoveTextFromId(card);
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
        return action.type === answer.action && action.card === answer.card;
      })
      .map(function(action) {
        return {
          name: answer.action + ' @ ' + action.target,
          value: action.target
        };
      })
      .value();
  }

  var cardQuestion = {
    type: "list",
    when: function(answer) { return answer.action === 'play' || answer.action === 'move'; },
    name: "card",
    message: "Choose card",
    choices: cardAction
  };

  var targetQuestion = {
    type: "list",
    when: function(answer) { return answer.action === 'play' || answer.action === 'move'; },
    name: "target",
    message: "Target",
    choices: target
  };

  inquirer.prompt([actionQuestion, cardQuestion, targetQuestion], function(answers) {
    console.log(answers);
    // console.log('json', json);
  });

};
