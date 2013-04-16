
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
};


/*
 *  User authorizations routing middleware
 */

exports.user = {
    hasAuthorization : function (req, res, next) {
      if (req.profile._id !== req.user._id) {
        return res.redirect('/users/' + req.profile._id);
      }
      next();
    }
};


/*
 *  Game authorizations routing middleware
 */

exports.game = {
    hasAuthorization : function (req, res, next) {
      if (req.game.owner._id.toString() !== req.user._id.toString())
        return res.redirect('/games/' + req.game._id);
      next();
    },
    isInvited : function (req, res, next) {
      //-- is user invited?
      next();
    }
};
