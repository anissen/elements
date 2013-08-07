/**
 * Game
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

	attributes: {

		players: 'array',

    initialState: {
      type: 'json',
      defaultsTo: {
        currentPlayer: 0,
        board: {}
      }
    },

    actions: {
      type: 'array',
      defaultsTo: []
    }
		
	},

  // Class Method
  doSomething: function() {
    // do something here
  }

};
