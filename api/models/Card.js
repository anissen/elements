/**
 * Card
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  attributes: {
  	
	  type: 'string',
    name: 'string',
    castingCost: { type: 'integer', defaultsTo: 0 },
    cardSet: { type: 'string', defaultsTo: 'alpha' },
    rarity: { type: 'string', defaultsTo: 'common' },
    data: 'json'
    
  }

};
