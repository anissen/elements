
damageUnit(target, 2);

var tiles = getAdjacentTiles(target, 1);
tiles.map(function(tile) {
  if (tile.type === "unit")
    damageUnit(tile, 1);
});
