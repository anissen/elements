
var ElementsServer = require('./game-server/server');

var server = new ElementsServer();
server.start(process.env.PORT || 5000);
