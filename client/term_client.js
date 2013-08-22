
var http = require("http");
var HexMap = require("../assets/js/game/hex-map.js").HexMap;
var questions = require("./questions.js");

http.get("http://localhost:1337/game/3", function(res){
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

function start(json) {
  console.log('-----------------------');
  console.log('      Welcome to       ');
  console.log('                       ');
  console.log('    Elements of War    ');
  console.log('                       ');
  console.log('   (Terminal version)  ');
  console.log('-----------------------');

  var map = new HexMap(json.state.board);
  console.log(map.toString(function(tile) {
    return tile.entity ? tile.entity.player : ' ';
  }));

  questions.askQuestions();
}
