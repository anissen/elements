var express = require('express');
var app = express();
var prettyjson = require('prettyjson');

var api = require('./api');

app.use(express.bodyParser());


// for the client html page
app.use(express.static(__dirname + '/public'));
app.get('/', function(request, response) {
  response.sendfile('client.html');
});


// POST game action
app.post('/game/:id', function(request, response) {
  //var id = request.params['id'];
  var eventData = request.body;
  api.performAction(eventData);
  response.send('ok (' + eventData.action + ')\n');
});

// GET game state
app.get('/game/:id/:colors', function(request, response) {
  var colors = request.params['colors'];
  console.log(request.params);
  api.getGameState(function(state) {
    if (colors !== 'false')
      state = prettyjson.render(state);
    response.send(state);
  });
});

var port = process.env.PORT || 5000;
app.listen(port);
console.log('Listening on port ' + port);
