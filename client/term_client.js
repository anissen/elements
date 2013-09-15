
var http = require("http");
var HexMap = require("../assets/js/game/hex-map.js").HexMap;
var questions = require("./questions.js");
var _ = require('underscore');
var inquirer = require('inquirer');
var clc = require('cli-color');

function print(text) {
  var info = clc.yellow;
  var keyword = clc.red.bold;

  var parts = _.map(text.split(/\*/g), function(part, i) {
    return i % 2 === 0 ? info(part) : keyword(part);
  });

  console.log(parts.join(''));
}

print('-------------------------');
print('|      Welcome to       |');
print('|                       |');
print('|    *Elements of War*    |');
print('|                       |');
print('|   (Terminal version)  |');
print('-------------------------');

function start(gameId, json) {
  var map = new HexMap(json.state.board);
  console.log(map.toString(function(tile) {
    if (!tile.entity) return ' ';
    var typeChar = tile.entity.type.charAt(0).toUpperCase();
    if (tile.entity.player === 0)
      return clc.blue(typeChar);
    else
      return clc.yellow(typeChar);
  }));

  http.get("http://localhost:1337/game/validactions/" + gameId, function(res){
    var data = '';

    res.on('data', function (chunk){
      data += chunk;
    });

    res.on('end',function(){
      var validActions = JSON.parse(data);

      print('You have *' + validActions.length + '* actions to choose from');
      var questionList = questions.getQuestions(json.state, validActions);
      inquirer.prompt(questionList, function(answers) {
        var url = "http://localhost:1337/game/action/" + gameId + "?";
        answers = _.extend(answers, { player: json.state.currentPlayer });
        var parameters = _.map(answers, function(value, key) {
          return key + '=' + value;
        }).join('&');
        http.get(url + parameters, function(res){
          console.log('Done');
          loop(gameId);
        }).on('error', function(e) {
          console.log("Got action error: " + e.message);
        });
      });
    });

  }).on('error', function(e) {
    console.log("Got validactions error: " + e.message);
  });
}

function loop(gameId) {
  http.get("http://localhost:1337/game/" + gameId, function(res){
    var data = '';

    res.on('data', function (chunk){
      data += chunk;
    });

    res.on('end',function(){
      start(gameId, JSON.parse(data));
    });

  }).on('error', function(e) {
    console.log("Got game error: " + e.message);
  });
}

var gameQuestion = {
  type: "input",
  name: "gameId",
  message: "Game ID",
  validate: function(value) {
    var pass = value.match(/^\d+$/i);
    return (pass ? true : "Please enter a valid game ID");
  }
};

inquirer.prompt(gameQuestion, function(answer) {
  loop(answer.gameId);
});
