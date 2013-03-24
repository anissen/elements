
var express = require('express'),
    app = express(),
    api = require('./api');


module.exports = (function() {

  var module = {};

  module.start = function(port) {
    app.use(express.compress());
    app.use(express.bodyParser());
    //app.use(express.basicAuth('test', 'test'));

    // for the client html page
    app.use(express.static('./client/public'));
    app.get('/', function(request, response) {
      response.sendfile('./client/client.html');
    });

    app.get('/test', function(request, response) {
      response.sendfile('./client/client-raphael.html');
    });

    var gameAuth = express.basicAuth(function(user, pass, callback) {
      var result = (user === 'test' && pass === 'test');
      callback(null /* error */, result);
    });

    app.post('/game/:id', gameAuth, function(request, response) {
      var eventData = request.body;
      api.performAction(eventData, function(result) {
        response.send(result);
      });
    });

    app.get('/game/:id/:actionCount', function(request, response) {
      var actionCount = request.params['actionCount'];
      api.getGameState(actionCount, function(state) {
        response.send(state);
      });
    });

    app.listen(port);
    console.log('Listening on port ' + port);
  };

  return module;

});
