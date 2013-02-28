
damageUnit(target, 2);

var tiles = getAdjacentTiles(target, 1);
tiles.map(function(tile) {
  damageUnit(tile, 1);
});
