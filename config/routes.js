
module.exports = function (app, passport, auth) {

  // user routes
  var users = require('../app/controllers/users');
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.'}), users.session);
  app.get('/users/:userId', users.show);
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'email', 'user_about_me'], failureRedirect: '/login' }), users.signin);
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), users.authCallback);
  app.get('/auth/github', passport.authenticate('github', { failureRedirect: '/login' }), users.signin);
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), users.authCallback);
  app.get('/auth/twitter', passport.authenticate('twitter', { failureRedirect: '/login' }), users.signin);
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), users.authCallback);
  app.get('/auth/google', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.signin);
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', scope: 'https://www.google.com/m8/feeds' }), users.authCallback);

  app.get('/users', users.index);
  app.param('userId', users.user);

  // game routes
  var games = require('../app/controllers/games');
  app.get('/games', games.index);
  app.get('/games/new', auth.requiresLogin, games.new);
  app.post('/games', auth.requiresLogin, games.create);
  app.get('/games/:gameId', games.show);
  app.get('/games/:gameId/edit', auth.requiresLogin, auth.game.hasAuthorization, games.edit);
  app.get('/games/:gameId/accept', auth.requiresLogin, auth.game.isInvited, games.acceptInvitation);
  app.get('/games/:gameId/play', auth.requiresLogin, auth.game.hasAuthorization, games.play);
  app.post('/games/:gameId/play', auth.requiresLogin, auth.game.hasAuthorization, games.performAction);
  app.get('/games/:gameId/play/:actionCount', auth.requiresLogin, auth.game.hasAuthorization, games.getState);
  app.put('/games/:gameId', auth.requiresLogin, auth.game.hasAuthorization, games.update);
  app.del('/games/:gameId', auth.requiresLogin, auth.game.hasAuthorization, games.destroy);

  app.param('gameId', games.game);

  var decks = require('../app/controllers/decks');
  app.get('/decks', decks.index);
  app.get('/decks/new', auth.requiresLogin, decks.new);
  app.post('/decks', auth.requiresLogin, decks.create);
  app.get('/decks/:deckId', decks.show);
  app.get('/decks/:deckId/edit', auth.requiresLogin, auth.user.hasAuthorization, decks.edit); // error
  app.put('/decks/:deckId', auth.requiresLogin, auth.user.hasAuthorization, decks.update);
  app.del('/decks/:deckId', auth.requiresLogin, auth.user.hasAuthorization, decks.destroy);

  app.param('deckId', decks.deck);

  // home route
  app.get('/', function (req, res) { res.render('index'); });
};
