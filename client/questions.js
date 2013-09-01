
var _ = require("underscore");
var inquirer = require("inquirer");

module.exports.askQuestions = function(json) {

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

  function cardsToPlay() {
    return _.map(json.state.players[1 /*json.state.currentPlayer*/].hand, function(card) {
      return { name: card.name + '\n   [' + card.attack + '/' + card.life + '] (' + card.cost + ' energy)', value: card.id };
    });
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
    choices: [
      { name: "Some unit", value: "play" },
      { name: "Some unit", value: "move" },
      { name: "Some unit", value: "endturn" }
    ]
  };

  inquirer.prompt([actionQuestion, playQuestion, moveQuestion], function(answers) {
    console.log(answers);
    // console.log('json', json);
  });

};
