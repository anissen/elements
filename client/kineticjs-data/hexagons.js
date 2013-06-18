
window.onload=function(){

  function introAnimation(stage, hexagons) {
    var tl = new TimelineLite({ paused:false, onUpdate: stage.draw, onUpdateScope:stage });
    var staggerFromData = { 
      setY: -80, 
      ease: Bounce.easeOut, 
      setRotation: Math.PI / 2 
    };
    var staggerToData = { 
      setScaleX: 1.0, 
      setScaleY: 1.0, 
      ease: Elastic.easeOut 
    };

    tl
      .staggerFrom(_.shuffle(hexagons), 0.7, staggerFromData, 0.01)
      .staggerTo(hexagons, 0.5, staggerToData, 0.01);
  }

  var stage = new Kinetic.Stage({
      container: 'container',
      width: 700,
      height: 700
  });

  var hexLayer = new Kinetic.Layer();

  var hexData = new HexMap().initializeMap(5, 6);
  // hexData.on('setTile', function(hex) {
  //   console.log(hex);
  // });

  var hexagons = [];
  var hexHeight = 128;
  var hexRadius = hexHeight / 2;
  var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
  var hexMargin = 5;
  var marginLeft = ((hexWidth + hexMargin) / 2) + 30;
  var marginTop  = ((hexHeight + hexMargin) / 2) + 20;
  var selectedHexagon = null;
  var neighborHexagons = [];
  for(var i = 0; i < 5; i++){
    for(var j = 0; j < 6; j++){
      var index = i * 6 + j;
      var hex = Hex(-Math.floor(j/2) + i, j);
      var tileData = (hexData.getMapData(hex));
      hexagons[index] = new Kinetic.RegularPolygon({
        x: marginLeft + i * (hexWidth + hexMargin) + (j % 2) * (hexWidth + hexMargin) / 2,
        y: marginTop + j * (hexHeight - (hexHeight / 4) + hexMargin),
        sides: 6,
        radius: hexRadius,
        fill: (tileData.player === 0 ? 'rgb(0, 200, 255)' : '#FF8000'),
        stroke: (tileData.player === 0 ? '1C75BC' : 'orangered'),
        strokeWidth: 3,
        opacity: (tileData.passable ? 1.0 : 0.15),
        scaleX: 0.8,
        scaleY: 0.8,
        hex: hex
      });

      hexData.setTile(hexagons[index].attrs.hex, hexagons[index]);

      hexagons[index].on('mouseover touchstart', function() {
        if (this === selectedHexagon) return;

        this.setStroke('blue');
        hexLayer.draw();
      });

      hexagons[index].on('mouseout touchend', function() {
        if (this === selectedHexagon) return;
        
        this.setStroke('1C75BC');
        hexLayer.draw();
      });

      hexagons[index].on('click', function() {
        // var tiles = hexData.getRingData(this.attrs.hex);
        // var tiles = hexData.getRangeData(this.attrs.hex);
        var tiles = hexData.getReachableTilesData(this.attrs.hex);
        _.each(tiles, function(tile) {
          tile.setScaleX(1);
          tile.moveToTop();
        })
        var timeline = new TimelineLite({ paused:false, onUpdate: stage.draw, onUpdateScope:stage });
        timeline
          .staggerTo(neighborHexagons, 0.2, { setScaleX: 1, setFillG: 200, setFillR: 0, ease: Bounce.easeOut }, 0.02)
          .staggerTo(tiles, 0.4, { setScaleX: -1, setFillG: 100, setFillR: 200, ease: Bounce.easeOut }, 0.04);
        neighborHexagons = tiles;

        if (selectedHexagon) {
          selectedHexagon.setStrokeWidth(3);
          selectedHexagon.setStroke('blue');
          
          TweenLite.to(selectedHexagon, 0.4, {
            setStrokeWidth: 3,
            // setRotation: 0,
            // setSides: 6,
            setRadius: hexRadius, //(hexsize / 2 + hexsize / 15) * 0.8,
            setFillPatternScaleX: 1.2,
            setFillPatternScaleY: 1.2,
            ease: Elastic.easeOut,
            onUpdate: stage.draw, 
            onUpdateScope:stage
          });
        }

        if (selectedHexagon === this) {
          selectedHexagon = null;
        } else {
          TweenLite.to(this, 1.0, {
            // setRotation: Math.PI / 4,
            setStrokeWidth: 8,
            // setSides: 4,
            //setRadius: this.getRadius() * 1.2,
            setFillPatternScaleX: 1.4,
            setFillPatternScaleY: 1.4,
            ease: Elastic.easeOut,
            onUpdate: stage.draw, 
            onUpdateScope:stage
          });
          //this.setStrokeWidth(8);
          this.setStroke('gold');
          this.moveToTop();
          selectedHexagon = this;
        }
      });
      
      hexLayer.add(hexagons[index]);
    }
  }

  stage.add(hexLayer);

  introAnimation(stage, hexagons);
}
