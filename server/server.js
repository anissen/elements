
var express = require('express'),
    app = express(),
    prettyjson = require('prettyjson'),
    api = require('./api');


module.exports = (function() {

  var module = {};

  module.start = function(port) {
    app.use(express.bodyParser());

    // for the client html page
    app.use(express.static('./client/public'));
    app.get('/', function(request, response) {
      response.sendfile('./client/client.html');
    });

    app.post('/game/:id', function(request, response) {
      var eventData = request.body;
      api.performAction(eventData);
      response.send('ok (' + eventData.action + ')\n');
    });

    app.get('/game/:id/:colors', function(request, response) {
      var colors = request.params['colors'];
      console.log(request.params);
      api.getGameState(function(state) {
        if (colors !== 'false')
          state = prettyjson.render(state);
        response.send(state);
      });
    });

    app.listen(port);
    console.log('Listening on port ' + port);
  };

  return module;

});
