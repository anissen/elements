
window.onload=function(){

  function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for(var src in sources) {
      numImages++;
    }
    for(var src in sources) {
      images[src] = new Image();
      images[src].onload = function() {
        if(++loadedImages >= numImages) {
          callback(images);
        }
      };
      images[src].src = sources[src];
    }
  }

  function introAnimation(stage, hexagons) {
    var tl = new TimelineLite({ paused:false, onUpdate: stage.draw, onUpdateScope:stage });
    var staggerFromData = { 
      setY: -80, 
      ease: Bounce.easeOut, 
      setRotation: Math.PI / 2 
    };
    var staggerToData = { 
      setScaleX: 1.2, 
      setScaleY: 1.2, 
      ease: Elastic.easeOut 
    };

    tl
      .staggerFrom(_.shuffle(hexagons), 0.7, staggerFromData, 0.01)
      .staggerTo(hexagons, 0.5, staggerToData, 0.01);
  }


  function createHexMapData(height, width) {
    var me = this;
    this.hexData = new Array(height);

    this.setMapData = function(q, r, data) {
      me.hexData[r][Math.floor(r / 2) + q] = data;
    }

    this.getMapData = function(q, r) {
      return me.hexData[r][Math.floor(r / 2) + q];
    }

    for(var r = 0; r < height; r++) {
      this.hexData[r] = new Array(width);
      for(var q = 0; q < width; q++) {
        this.setMapData(q, r, { player: (r < height / 2 ? 1 : 0) });
      }
    }

    return this;
  }

  function setup(images) {
    var stage = new Kinetic.Stage({
        container: 'container',
        width: 700,
        height: 700
    });
    var hexLayer = new Kinetic.Layer();

    var hexData = createHexMapData(6, 5);

    var hexagons = [];
    var hexHeight = 96;
    var hexRadius = hexHeight / 2;
    var hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    var marginLeft = 70;
    var marginTop = 70;
    var hexMargin = 10;
    var selectedHexagon = null;
    var backgroundImages = [images.water, images.fire, null];
    for(var i = 0; i < 5; i++){
        for(var j = 0; j < 6; j++){
            var index = i * 6 + j;
            hexagons[index] = new Kinetic.RegularPolygon({
              x: marginLeft + i * (hexHeight + hexMargin) + (j % 2) * (hexHeight + hexMargin) / 2,
              y: marginTop + j * (hexWidth + hexMargin),
              sides: 6,
              radius: hexRadius, //(hexsize / 2 + hexsize / 15) * 0.8,
              fill: (hexData.getMapData(i,j).player === 0 ? '#FF8000' : 'rgb(0, 200, 255)'),
              stroke: (hexData.getMapData(i,j).player === 0 ? 'orangered' : '1C75BC'),
              strokeWidth: 3,
              opacity: 1.0
            });
            
            hexagons[index].on('mouseover touchstart', function() {
              if (this === selectedHexagon) return;

              this.setStroke('darkred');
              hexLayer.draw();
            });

            hexagons[index].on('mouseout touchend', function() {
              if (this === selectedHexagon) return;
              
              this.setStroke('orangered');
              hexLayer.draw();
            });

            hexagons[index].on('click', function() {
              if (selectedHexagon) {
                selectedHexagon.setStrokeWidth(3);
                selectedHexagon.setStroke('darkred');
                
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
                  setRadius: 70,
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

  var sources = {
    water: 'kineticjs-data/big-wave.png',
    fire: 'kineticjs-data/fire-wave.png'
  };

  loadImages(sources, function(images) {
    setup(images);
  });
}
