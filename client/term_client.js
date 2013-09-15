
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

function start(json) {
  var map = new HexMap(json.state.board);
  console.log(map.toString(function(tile) {
    if (!tile.entity) return ' ';
    var typeChar = tile.entity.type.charAt(0).toUpperCase();
    if (tile.entity.player === 0)
      return clc.blue(typeChar);
    else
      return clc.yellow(typeChar);
  }));

  http.get("http://localhost:1337/game/validactions/10", function(res){
    var data = '';

    res.on('data', function (chunk){
      data += chunk;
    });

    res.on('end',function(){
      var validActions = JSON.parse(data);

      print('You have *' + validActions.length + '* actions to choose from');
      var questionList = questions.getQuestions(json.state, validActions);

      inquirer.prompt(questionList, function(answers) {
        var url = "http://localhost:1337/game/action/10?";
        answers = _.extend(answers, { player: json.state.currentPlayer });
        var parameters = _.map(answers, function(value, key) {
          return key + '=' + value;
        }).join('&');
        http.get(url + parameters, function(res){
          console.log('Done');
          loop();
        }).on('error', function(e) {
          console.log("Got error: " + e.message);
        });
      });
    });

  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

function loop() {
  http.get("http://localhost:1337/game/10", function(res){
    var data = '';

    res.on('data', function (chunk){
      data += chunk;
    });

    res.on('end',function(){
      start(JSON.parse(data));
    });

  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
}

loop();
