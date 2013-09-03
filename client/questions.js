
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
    // console.log(_.values(state.board));
    var tile = _.find(_.values(state.board), function(tile) {
      return tile.entity && tile.entity.id === entityId;
    });
    return tile.entity.name + ' [' + tile.entity.attack + '/' + tile.entity.life + ']';
  }

  function cardsToPlay() {
    return _.chain(validActions)
      .filter(function(action) {
        return action.type === 'play';
      })
      .map(function(action) {
        return {
          name: cardToPlayTextFromId(action.card) + '\n  >> Play at ' + action.target,
          value: action.card
        };
      })
      .value();
  }

  function cardsToMove() {
    return _.chain(validActions)
      .filter(function(action) {
        return action.type === 'move';
      })
      .map(function(action) {
        return {
          name: cardToMoveTextFromId(action.card) + '\n  >> Move to ' + action.target,
          value: action.card
        };
      })
      .value();
  }

  var playQuestion = {
    type: "list",
    when: function(answer) { return answer.action === 'play'; },
    name: "card",
    message: "Which card do you wish to play",
    choices: cardsToPlay
  };

  var moveQuestion = {
    type: "list",
    when: function(answer) { return answer.action === 'move'; },
    name: "card",
    message: "Which unit do you wish to move",
    choices: cardsToMove
  };

  inquirer.prompt([actionQuestion, playQuestion, moveQuestion], function(answers) {
    console.log(answers);
    // console.log('json', json);
  });

};
