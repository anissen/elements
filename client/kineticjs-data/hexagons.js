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

  function setup(images) {
    var stage = new Kinetic.Stage({
        container: 'container',
        width: 700,
        height: 700
    });
    var hexLayer = new Kinetic.Layer();

    var hexagons = [];
    var hexsize = 128;
    var margin = -1;
    var selectedHexagon = null;
    var backgroundImages = [images.water, images.fire, null];
    for(var i=0; i<5; i++){
        for(var j=0; j<6; j++){
            var index = i * 6 + j;
            hexagons[index] = new Kinetic.RegularPolygon({
              x: 70 + i * (hexsize + margin * 2) + (j % 2) * (hexsize + margin * 2) / 2,
              y: 70 + j * (hexsize - hexsize / 7.5 + margin),
              sides: 6,
              radius: (hexsize / 2 + hexsize / 15) * 0.8,
              fill: ((i+j) % 2 === 0 ? '#FF8000' : 'rgb(0, 200, 255)'),
              stroke: ((i+j) % 2 === 0 ? 'orangered' : '1C75BC'),
              strokeWidth: 3,
              opacity: 1.0
              /*
              fillPatternImage: backgroundImages[Math.floor(j / 2)],
              fillPatternOffset: [55, 45],
              fillPatternScale: [1.2, 1.2]
              */
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
                  //setRotation: 0,
                  setStrokeWidth: 3,
                  setSides: 6,
                  setRadius: (hexsize / 2 + hexsize / 15) * 0.8,
                  setFillPatternScaleX: 1.2,
                  setFillPatternScaleY: 1.2,
                  ease: Elastic.easeOut,
                  //setStroke: 'gold',
                  onUpdate: stage.draw, 
                  onUpdateScope:stage
                });
              }

              if (selectedHexagon === this) {
                selectedHexagon = null;
              } else {
                TweenLite.to(this, 1.0, {
                  //setRotation: Math.PI / 4,
                  setStrokeWidth: 8,
                  //setSides: 4,
                  setRadius: 70,
                  setFillPatternScaleX: 1.4,
                  setFillPatternScaleY: 1.4,
                  ease: Elastic.easeOut,
                  //setStroke: 'gold',
                  onUpdate: stage.draw, 
                  onUpdateScope:stage
                });
                //this.setStrokeWidth(8);
                this.setStroke('gold');
                this.moveToTop();
                selectedHexagon = this;
              }

              hexLayer.draw();
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
