
damageUnit(target, 2);

var tiles = getAdjacentTiles(target, 1);
util.each(tiles, function(tile) {
  damageUnit(tile, 1);
});
