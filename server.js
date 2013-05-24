/* Main application entry file. Please note, the order of loading is important.
 * Configuration loading and booting of controllers and custom error handlers */

var express = require('express'),
    fs = require('fs'),
    passport = require('passport');

// Load configurations
var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    auth = require('./config/middlewares/authorization'),
    mongoose = require('mongoose');

// Bootstrap db connection
mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (file.charAt(0) !== '.')
    require(models_path + '/' + file);
});

// bootstrap passport config
require('./config/passport')(passport, config);

var app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { text: 'hello world' });
  socket.on('ping', function (data) {
    socket.emit('pong', 'in response to ' + data)
  })
});

// TODO: Move this to a configuration file (e.g. express.js)
io.configure('development', function(){
  io.set('log level', 2);
});

// express settings
require('./config/express')(app, config, passport);

// Bootstrap routes
require('./config/routes')(app, passport, auth);

// Start the app by listening on <port>
var port = process.env.PORT || 3000;
server.listen(port);
console.log('Express app started on port '+port);
