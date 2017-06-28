(function() {
  
  var SCALE;
  
  
  
  
  /**
   *
   * Helper functions
   *
   */
  // Convert degree to radian
  function degToRad( deg ) {
    return deg * ( Math.PI / 180 );
  }
  // Convert radian to degree
  function radToDeg( rad ) {
    return rad * ( 180 / Math.PI );
  }
  // Find a side of a triangle via Pythagorean Theorem
  function pythagoras(a, b) {
    return Math.sqrt((a * a) + (b * b));
  }
  // CSS transform
  function transform( elem, cssRule ) {
    elem.style.transform = cssRule;
    elem.style['-webkit-transform'] = cssRule;
    elem.style['-moz-transform'] = cssRule;
    elem.style['-o-transform'] = cssRule;
    elem.style['-ms-transform'] = cssRule;
  }
  /**
   * Create multiple specific HTML elements
   * @param [array] of tag name
   * @return [array] of created elements
   */
  function createMultipleElements( tagName, amount, attributes ) {
    var arr = [],
        t = typeof tagName === 'string' ? [tagName] : tagName,
        attr = attributes.constructor.name !== 'Array' ? [attributes] : attributes;
    
    for ( var i = 0; i < amount; i++ ) {
      var tag = t[i] || t[t.length - 1],
          e = document.createElement(tag),
          a = attr[i] || attr[attr.lenght - 1];
      
      for ( var key in a ) {
        if ( a.hasOwnProperty(key) ) {
          var val = a[key];
          key = key === 'class' ? 'className' : key;
          e[key] = val;
        }
      }
      
      arr[i] = e;
    }
    
    return arr;
  }
  /**
   * Append multiple children
   * @param [DOM] parent -- DOM Element
   * @param [array] children -- DOM Elements array
   */
  function appendChildren( parent, children ) {
    children.forEach(function(index) {
      parent.appendChild(index);
    });
  }
  /**
   * Add multiple CSS Style to elements
   * @param [array|DOM] elements -- DOM Elements array
   * @param [object] css -- CSS Style in type object
   */
  function multiStyle( elements, css ) {
    var e = elements.constructor.name !== 'Array' ? [elements] : elements;
    
    e.forEach(function(index) {
      for ( var x in css ) {
        if ( css.hasOwnProperty(x) ) {
          index.style[x] = css[x];
        }
      }
    });
  }
  /**
   * Remove multiple classes on multiple elements
   * @param [DOM || DOM Array] elem
   * @className [string || array] className
   */
  function removeClass( elem, className ) {
    var cstrName = elem.constructor.name,
        elem = cstrName !== 'Array' && cstrName !== 'NodeList' ? [elem] : elem,
        c = typeof className === 'string' ? [className] : className;
    
    elem.forEach(function(e) {
      c.forEach(function(cname) {
        e.classList.remove(cname);
      });
    });
  }
  /**
   * Add multiple classes on multiple elements
   * @param [DOM || DOM Array] elem
   * @className [string || array] className
   */
  function addClass( elem, className ) {
    var elem = elem.constructor.name !== 'Array' ? [elem] : elem,
        c = typeof className === 'string' ? [className] : className;
    
    elem.forEach(function(e) {
      c.forEach(function(cname) {
        e.classList.add(cname);
      });
    });
  }
  /**
   * CSS Matrix object
   * @param [string] cssMatrix
   */
  function getCSSMatrixObject(cssMatrix) {
    //console.log(cssMatrix);
    if ( cssMatrix === 'none' ) { return false; }

    // Convert radian to degree
    function radToDeg( rad ) {
      return rad * ( 180 / Math.PI );
    }
    
    var matrixArray = cssMatrix.match(/([-+]?[\d\.]+)/g),
        transformObj = {};
    
    transformObj.translate = {
      x: matrixArray[4] + 'px',
      y: matrixArray[5] + 'px'
    }
    transformObj.scale = {
      x: matrixArray[0],
      y: matrixArray[3]
    }
    transformObj.skew = {
      x: matrixArray[1] + 'deg',
      y: matrixArray[2] + 'deg'
    }
    transformObj.rotate = radToDeg(Math.acos(matrixArray[0])) + 'deg';
    
    return transformObj;
  }
  /**
   * Get elements -- Use instead of querySelector/querySelectorAll
   */
  function getElem( selector, parent ) {
    parent = parent || document;
    var e = parent.querySelectorAll(selector),
        e = e.length > 1 ? e : e[0];
    
    return e;
  }
  /**
   * Bind querySelector constructor -- to use specific 'this' multiple times
   */
  function BindQuerySelector( parent ) {
    return function( selector ) {
      return getElem(selector, parent);
    }
  }



  /**
   *
   * ========== TurningGraphic object ==========
   *
   */
  function TurningGraphic() {
    this.graphicDOM = function() {
      var q = new BindQuerySelector(this.car());
      return {
        all: q('.line, .circle, .radius-text'),
        lines: {
          all: q('.line'),
          front: {
            left: q('.line.front.left'),
            right: q('.line.front.right'),
            outerLeft: q('.line.outer.left'),
            outerRight: q('.line.outer.right')
          },
          rear: {
            left: q('.line.rear.left'),
            right: q('.line.rear.right')
          }
        },
        circles: {
          all: q('.circle'),
          front: {
            left: q('.circle.front.left'),
            right: q('.circle.front.right')
          },
          rear: {
            left: q('.circle.rear.left'),
            right: q('.circle.rear.right')
          }
        },
        radiusText: {
          left: q('.radius-text.left'),
          right: q('.radius-text.right')
        }
      }
    };
    
    this.turningDegreeFilter = function( wheelDeg ) {
      var max = this.spec.maxTurningDegree,
          deg = wheelDeg;
      
      deg = deg ? deg: 0;
      if ( Math.abs(parseFloat(deg)) > max ) {
        deg = deg < 0 ? '-' + max : max;
      }
      return deg;
    };
    
    this.turningRadius = function( wheelDeg ) {
      var o = this.spec,
          wDeg = wheelDeg,
          wbase = o.wheelbase,
          outer = o.wheelShaftLength - o.wheelWidth,
          radian = degToRad(Math.abs(wDeg)),
          inRearRad = (Math.cos(radian) / Math.sin(radian)) * wbase,
          outRearRad = inRearRad + outer,
          inFrontRad = pythagoras(inRearRad, wbase),
          outFrontRad = pythagoras(outRearRad, wbase),
          Obj = {
            front: {
              inner: inFrontRad,
              outer: outFrontRad
            },
            rear: {
              inner: inRearRad,
              outer: outRearRad
            }
          };
          //radius = Math.round(radius * 100) / 100;
      
      /*
      var log = {
        wheelDeg: wheelDeg,
        wDeg: wDeg,
        wbase: wbase,
        outer: outer,
        radian: radian,
        inRearRad: inRearRad,
        outRearRad: outRearRad,
        inFrontRad: inFrontRad,
        outFrontRad: outFrontRad
      }
      console.log(log);
      */
      
      //console.log(Obj);
      return Obj;
    }
    
    this.wheelTurningDegree = function( radius ) {
      return radToDeg(Math.atan(this.spec.wheelbase / radius));
    }
    
    this.createTurningGraphic = function( wheelDOM ) {
      /**  
       *   f = front, r = rear
       *   l = left, r = right
       *   w = wheel
       */
      var w = wheelDOM, // this refers to Car, not TurningGraphic
          wfl = w.front.left,
          wfr = w.front.right,
          wrl = w.rear.left,
          wrr = w.rear.right,
          classList = [
            {class: 'line front left'},
            {class: 'line front right'},
            {class: 'line outer left'},
            {class: 'line outer right'},
            {class: 'line rear left'},
            {class: 'line rear right'},
            {class: 'circle front left'},
            {class: 'circle front right'},
            {class: 'circle rear left'},
            {class: 'circle rear right'}
          ],
          divs = createMultipleElements('div', 10, classList),
          spans = createMultipleElements('span', 2, [
            {class: 'radius-text rear left'},
            {class: 'radius-text rear right'}
          ]);
      
      appendChildren(wfl, [divs[0], divs[2], divs[6]]);
      appendChildren(wfr, [divs[1], divs[3], divs[7]]);
      appendChildren(wrl, [divs[4], divs[8], spans[0]]);
      appendChildren(wrr, [divs[5], divs[9], spans[1]]);
    };
    
    this.getLines = function( wheelDeg ) {
      var dom = this.graphicDOM().lines,
          all = dom.all,
          wDeg = wheelDeg,
          td = this.turningRadius(wDeg),
          rearRad = td.rear.inner,
          frontRad = td.front.inner,
          frontOuterRad = td.front.outer,
          front,
          rear,
          frontOuter;
      
      if ( wDeg > 0 ) {
        front = dom.front.right;
        rear = dom.rear.right;
        frontOuter = dom.front.outerLeft;
      } else if ( wDeg < 0 ) {
        front = dom.front.left;
        rear = dom.rear.left;
        frontOuter = dom.front.outerRight;
      } else {
        removeClass(all, '_active');
        return;
      }
      
      removeClass(all, '_active');
      
      rear.style.width = rearRad + 'px';
      front.style.width = frontRad + 'px';
      frontOuter.style.width = frontOuterRad + 'px';
      addClass([rear, front, frontOuter], '_active');
    }

    this.getCircles = function( wheelDeg ) {
      /**
       *   f = front, r = rear
       *   d = diameter
       *   i = in
       *   o = out
       */
      var dom = this.graphicDOM().circles,
          all = dom.all,
          wDeg = wheelDeg,
          td = this.turningRadius(wDeg),
          fi = td.front.inner * 2,
          fo = td.front.outer * 2,
          ri = td.rear.inner * 2,
          ro = td.rear.outer * 2,
          fld,
          frd,
          rld,
          rrd,
          diam,
          direction;
      
      if ( wDeg > 0 ) {
        direction = 'to-right';
        frd = fi;
        fld = fo;
        rld = ro;
        rrd = ri;
      } else if ( wDeg < 0 ) {
        direction = 'to-left';
        frd = fo;
        fld= fi;
        rld = ri;
        rrd = ro;
      } else {
        removeClass(all, '_active');
        return;
      }
      
      all.forEach(function(elem) {
        var a = elem,
            ac = a.classList,
            as = a.style,
            px = 'px';

        if ( a === dom.front.left ) {
          diam = fld;
        } else if ( a === dom.front.right ) {
          diam = frd;
        } else if ( a === dom.rear.left ) {
          diam = rld;
        } else if ( a === dom.rear.right ) {
          diam = rrd;
        }
        
        as.width = diam + px;
        as.height = diam + px;
        as.top = 'calc(50% - ' + (diam / 2) + px + ')';
        
        removeClass(a, ['to-left', 'to-right']);
        ac.add(direction);
        ac.add('_active');
      });
      console.log('get circles');
    }
  }
  
  
  
  
  
  /**
   *
   * ========== Controller object ==========
   *
   */
  function Controller() {
    this.ctrlDOM = function() {
      var c = this.ctrlPanel(),
          q = new BindQuerySelector(c);
      
      return {
        tab: getElem('#simulator .controller .nav ul li[data-id="' + this.id + '"]'),
        strWheel: q('input.ipStrWheelDeg'),
        wheel: q('input.ipWheelDeg'),
        gasPedal: q('input.ipGasPedal')
      }
    };
    this.buildController = function( carId ) {
      var o = this.spec,
          activatedPanel,
          activatedTab,
          ctrl = document.querySelector('#simulator .controller'),
          navUl = ctrl.querySelector('.nav ul'),
          attr = [
            {class: '_active'},
            {class: 'panel _active'}, 
            {
              class: 'ipStrWheelDeg',
              type: 'number',
              step: 1,
              min: '-' + o.maxStrWheelTurningDegree,
              max: o.maxStrWheelTurningDegree,
              placeholder: 'Steering wheel turn'
            },
            {
              class: 'ipWheelDeg',
              type: 'number',
              step: 1,
              min: '-' + o.maxTurningDegree,
              max: o.maxTurningDegree,
              placeholder: 'Wheel turn'
            }, 
            {
              class: 'ipRadius',
              type: 'number',
              step: 1,
              placeholder: 'Inner rear turning radius'
            },
            {
              class: 'ipGasPedal',
              type: 'number',
              step: 1,
              min: 0,
              max: 100,
              placeholder: 'Gas pedal'
            }
          ],
          elems = createMultipleElements([
            'li', 'div', 'input'
          ], 6, attr),
          tab = elems[0],
          panel = elems[1];
      
      // Deactivate activated panel
      if ( activatedPanel = ctrl.querySelector('.panel._active') ) {
        activatedPanel.classList.remove('_active');
      }
      if ( activatedTab = ctrl.querySelector('.nav ul li._active') ) {
        activatedTab.classList.remove('_active');
      }
      
      tab.textContent = carId;
      tab.dataset.id = carId;
      panel.dataset.id = carId;
      
      navUl.appendChild(tab);
      appendChildren(panel, [elems[2], elems[3], elems[4], elems[5]]);
          
      setTimeout(this.addListener.bind(this), 0);
      
      console.log('build control panel');
      return panel;
    }
    
    this.addListener = function() {
      var $this = this,
          dom = this.ctrlDOM(),
          strw = dom.strWheel,
          w = dom.wheel,
          gp = dom.gasPedal;
      
      strw.addEventListener('input', function() {
        $this.strWheelTurn(this.value);
      });
      w.addEventListener('input', function() {
        $this.wheelTurnHandler(this.value);
      });
      gp.addEventListener('input', function() {
        $this.pressPedal(this.value);
        if ( exec ) { return; }
        exec = true;
        var i = 0,
            int = setInterval(function() {
              i++;
              document.getElementById('timer').textContent = i;
            }, 1000);
      });
      console.log('add listener');
    }
  }





  /**
   *
   * ========== Car object ==========
   *
   */
  function Car( id, graphic = true ) {
    TurningGraphic.call(this);
    Controller.call(this);
    
    this.id = id;
    this.pressPedalInterval = [];
    this.car = function() {
      return getElem('.car[data-id="' + this.id + '"]');
    };
    this.ctrlPanel = function() {
      return getElem('.panel[data-id="' + this.id + '"]');
    };
    this.carDOM = function() {
      var car = this.car(),
          q = new BindQuerySelector(car);
      
      return {
        wheel: {
          front: {
            left: q('.wheel-front .wheel-left'),
            right: q('.wheel-front .wheel-right'),
          },
          rear: {
            left: q('.wheel-rear .wheel-left'),
            right: q('.wheel-rear .wheel-right')
          }
        },
        ground: car.previousElementSibling
      }
    };
    this.spec = {};
    this.turningGraphic = graphic;
    
    /**
     *   spec.width
     *   spec.length
     *   spec.weight (kg)
     *   spec.frontBumperToWheel
     *   spec.rearBumperToWheel
     *   spec.wheelbase
     *   spec.wheelWidth
     *   spec.wheelDiameter
     *   spec.wheelShaftLength
     *   spec.steeringRatio
     *   spec.maxTurningDegree
     *   spec.maxSpeed -- in kilometers
     */
    this.setSpec = function( spec ) {
      var o = spec,
          a = this.spec,
          ratioArr = o.steeringRatio.split(':'),
          strRatio = parseFloat(ratioArr[0]) / parseFloat(ratioArr[1]);
      
      a.width = o.width * SCALE;
      a.length = o.length * SCALE;
      a.frontBumperToWheel = o.frontBumperToWheel * SCALE;
      a.rearBumperToWheel = o.rearBumperToWheel * SCALE;
      a.wheelbase = o.wheelbase * SCALE;
      a.wheelWidth = o.wheelWidth * SCALE;
      a.wheelDiameter = o.wheelDiameter * SCALE;
      a.wheelShaftLength = o.wheelShaftLength * SCALE;
      a.steeringRatio = strRatio;
      a.weight = o.weight;
      a.maxTurningDegree = o.maxTurningDegree;
      a.maxStrWheelTurningDegree = o.maxTurningDegree * strRatio;
      a.maxSpeed = o.maxSpeed;
      a.gasPedalRatio = o.maxSpeed / 100;
      
    }
    
    /**
     * Buid a car
     */
    this.build = function() {
      var o = this.spec,
          simulator = document.getElementById('simulator'),
          canvas = simulator.querySelector('.canvas'),
          ctrl = simulator.querySelector('.controller'),
          car = buildCar(this.id),
          ctrlPanel = this.buildController(this.id);
      
      //console.log(o);
      
      canvas.appendChild(car);
      ctrl.appendChild(ctrlPanel);

      console.log(this.carDOM());
      
      if ( this.turningGraphic ) {
        this.createTurningGraphic(this.carDOM().wheel);
      }
            
      console.log('build success');
      
      function buildCar( id ) {
        var activatedCar,
            activatedSheet,
            classList = [
              {class: 'car _active'},
              {class: 'body'},
              {class: 'sheet _active'},
              {class: 'ground'}
            ],
            divs = createMultipleElements('div', 4, classList),
            car = divs[0],
            body = divs[1],
            sheet = divs[2],
            ground = divs[3],
            wheel = buildWheel(),
            px = 'px';
        
        // Deactivate activated car and sheet
        if ( activatedCar = canvas.querySelector('.car._active') ) {
          activatedCar.classList.remove('_active');
        }
        if ( activatedSheet = canvas.querySelector('.sheet._active') ) {
          activatedSheet.classList.remove('_active');
        }
      
        // Add car id
        car.dataset.id = id;
        sheet.dataset.id = id;
      
        // Car styling
        multiStyle([body, car], {
          width: o.width + px,
          height: o.length + px
        });
        multiStyle(car, {
          top: 'calc(50% - ' + (o.length / 2) + 'px)',
          left: 'calc(50% - ' + (o.width / 2) + 'px)'
        });
        
        // Ground styling
        multiStyle(ground, {
          // one line = 1 meters
          'background-size': '100% ' + (200 * SCALE) + 'px'
        });
      
        body.appendChild(wheel);
        car.appendChild(body);
        appendChildren(sheet, [ground, car]);
            
        console.log('build car');
        return sheet;
      }
      
      function buildWheel() {
        // Create elements
        var shaftLength = o.wheelShaftLength,
            whWidth = o.wheelWidth,
            whDiam = o.wheelDiameter,
            frontSpace = o.frontBumperToWheel - (whDiam / 2),
            rearSpace = o.rearBumperToWheel - (whDiam / 2),
            cShaft = 'wheel-shaft',
            cLeft = 'wheel-left',
            cRight = 'wheel-right',
            classList = [
              {class: 'wheel'},
              {class: 'wheel-front'},
              {class: 'wheel-rear'},
              {class: cShaft}, {class: cLeft}, {class: cRight},
              {class: cShaft}, {class: cLeft}, {class: cRight}
            ],
            divs = createMultipleElements('div', 9, classList),
            px = 'px';
        
        // Set front/rear bumper to wheel distance
        multiStyle(divs[1], {
          top: frontSpace + px,
          height: whDiam + px
        });
        multiStyle(divs[2], {
          bottom: rearSpace + px,
          height: whDiam + px
        });
        
        // set shaft length
        multiStyle([divs[3], divs[6]], {
          width: shaftLength + px,
          left: 'calc(50% - ' + (shaftLength / 2) + 'px)'
        });
        
        // set wheel width and diameter
        multiStyle([divs[4], divs[5], divs[7], divs[8]], {
          width: whWidth + px,
          height: whDiam + px
        });
        
        // adjust wheel position to end of wheel shaft
        multiStyle([divs[5], divs[8]], {
          right: (((shaftLength - o.width) / 2) * -1) + px
        });
        multiStyle([divs[4], divs[7]], {
          left: (((shaftLength - o.width) / 2) * -1) + px
        });
        
        appendChildren(divs[1], [divs[3], divs[4], divs[5]]);
        appendChildren(divs[2], [divs[6], divs[7], divs[8]]);
        appendChildren(divs[0], [divs[1], divs[2]]);
            
        console.log('build wheel');
        return divs[0]; // Wheel
      }
    }
    
    this.wheelTurn = function( wheelDeg ) {
      var wbase = this.spec.wheelbase,
          cdom = this.carDOM(),
          inDeg = wheelDeg,
          outDeg = this.wheelTurningDegree(this.turningRadius(inDeg).rear.outer),
          lDeg,
          rDeg;
      
      if ( wheelDeg > 0 ) {
        lDeg = outDeg;
        rDeg = inDeg;
      } else if ( wheelDeg < 0 ) {
        lDeg = inDeg;
        rDeg = '-' + outDeg;
      } else {
        lDeg = rDeg = 0;
      }
      
      transform(cdom.wheel.front.left, 'rotate(' + lDeg + 'deg)');
      transform(cdom.wheel.front.right, 'rotate(' + rDeg + 'deg)');
      console.log('wheel move!');
    }
    
    this.strWheelTurn = function( strWheelDeg ) {
      var wheelDeg = strWheelDeg / this.spec.steeringRatio;
      console.log('steering wheel move!');
      this.wheelTurnHandler(wheelDeg);
    }
    
    this.wheelTurnHandler = function( wheelDeg ) {
      var wDeg = this.turningDegreeFilter(wheelDeg);
      this.wheelTurn(wDeg);
      this.getLines(wDeg);
      this.getCircles(wDeg);
    }
    
    this.gasPedalValueFilter = function( value ) {
      if ( value === '' ) {
        value = 0;
      } else if ( value > 100 ) {
        value = 100;
      }
      return value;
    }
    
    this.pressPedal = function( pedalValue, wheelDeg ) {
      // 50kmph = 5,000,000cm/3600sec
      // 833.33cm/min = 13.89cm/sec
      // km -> m = km * 1000
      // km -> cm = km * 100000
      // ((km / 3600) / fps) * 100000

      // Find car speed from gas pedal depression
      var pedalValue = this.gasPedalValueFilter(pedalValue),
          pedalRatio = this.spec.gasPedalRatio,
          speed = pedalValue * pedalRatio;

      if ( speed === 0 ) {
        clearInterval(this.pressPedalInterval[0]);
        this.pressPedalInterval = [];
        return;
      }

      // Define animation frame rate and interval repeater
      var fps = 30,
          repeater = 1000 / fps; // Milliseconds divided by frame rate

      // Speed per frame in centimeters (pixel)
      var spf = ((speed / 3600) / fps) * 100000,
          wheelDeg = wheelDeg || this.ctrlDOM().wheel.value || 0,
          ground = this.carDOM().ground,
          movement;

      // If the car don't go straight
      if ( wheelDeg !== 0 ) {
        // Find '.ground' rotation degree per frame
        var radius = this.turningRadius(wheelDeg).front.inner,
            circumference = 2 * Math.PI * radius,
            rpf = 360 / (circumference / spf),
            prefix = wheelDeg > 0 ? '-' : '',

            rotation = function() {
              // Get '.ground' current transform matrix value 
              var groundMatrix = getCSSMatrixObject(getComputedStyle(ground).transform),
                  // Current rotation degree
                  currentDegree = groundMatrix ? parseFloat(groundMatrix.rotate) : 0,
                  rotate = currentDegree + rpf;

              transform(ground, 'rotate(' + prefix + rotate + 'deg)');
  
              console.log(
                getComputedStyle(ground).transform, 
                'currentDegree: ' + currentDegree, 
                'rotate: ' + rotate,
                '-------------------'
              );
            };

        //ground.style.transformOrigin = 'calc(50% + ' + ((this.spec.width / 2) + radius) + 'px)';

        movement = rotation.bind(this);
      } else {
        // If the car goes straight forward
        // Get current translateY value of the '.ground' element
        var currentTranslateY = groundMatrix ? parseFloat(groundMatrix.translate.y) : 0;
      }

      // Clear now-running animation
      // before running new animation
      // every time that the gas pedal value has changed
      clearInterval(this.pressPedalInterval[0]);
      this.pressPedalInterval.splice(0, 1);

      // Animate!
      var animation = setInterval.bind(null, movement, repeater);
      
      // Run animation and store it in array
      // for stopping later
      this.pressPedalInterval.push(animation());

      /*
      setTimeout((function() {
        
        if ( this.pressPedalInterval.length > 0 ) {
          clearInterval(this.pressPedalInterval[0]);
          this.pressPedalInterval.splice(0, 1);
        }
        
        var int = setInterval.bind(null, (function() {

              if ( rotateDeg >= 360 * 0.25 
                   && rotateDeg <= 360 * 0.75) {
                console.log('OK');
                translateY -= distance;
              } else {
                console.log('NO OK');
                translateY += distance;
              }

              g.style.transformOrigin = 'calc(50% + ' + ((this.spec.width / 2) + radius) + 'px)';
              rotateDeg += rotateAdd;
              translate = 'translateY(' + prefix + translateY + 'px)';
              rotate = 'rotate(-' + rotateDeg + 'deg)';
              //transform(g, translate + ' ' + rotate);
              transform(g, rotate);

            }).bind(this), repeat);
        
        this.pressPedalInterval.push(int());
      }).bind(this), start);
      */
      
      
      var log = {
        pedalValue: pedalValue,
        speed: speed,
        wheelDeg: wheelDeg,
        //start: start,
        frameRate: fps,
        speedPerFrame: spf,
        repeater: repeater,
        translation: {
          currentTranslateY: currentTranslateY,
        },
        rotation: {
          radius: radius,
          circumference: circumference,
          rotatePerFrame: rpf
        },
        movement: movement.name
      }
      console.log(log);
      
    }
  }


  /**
   * Create simulator
   * @param [DOM] wrapperElement
   * @param [number] area -- area of a parking lot in square meters
   */
  function init( wrapperElement, area = 2000 ) {
    var wrp = wrapperElement,
        //area = area * 10000, // to sqaure centimeters (sqr.px.)
        attr = [
          {id:'simulator'},
          {class:'canvas'},
          {class:'controller'},
          {class:'nav'}
        ],
        divs = createMultipleElements('div', 4, attr),
        ul = document.createElement('ul'),
        simulator = divs[0],
        canvas = divs[1],
        ctrl = divs[2],
        nav = divs[3],
        cRect,
        cArea;
    
    nav.appendChild(ul);
    ctrl.appendChild(nav);
    appendChildren(simulator, [canvas, ctrl])
    wrp.appendChild(simulator);
    
    cRect = canvas.getBoundingClientRect();
    cArea = cRect.width * cRect.height; // sqr.px.
    SCALE = cRect.width / area; //cArea  / area;
    console.log('INIT!');
    
    /*
    var log = {
      canvasRect: cRect,
      canvasArea: cArea,
      userArea: area,
      SCALE: SCALE
    }
    console.log('LOG_init', log);
    */
  }
  
  
  
  Simulator = {
    init: init,
    build: function( id, options ) {
      var car = new Car(id);
      car.setSpec(options);
      car.build();
    }
  }
})();










/**
 *
 * ========== RUN THE SCRIPT ==========
 *
 */

/**
 * Car init
 *   spec.width
 *   spec.length
 *   spec.weight (kg)
 *   spec.frontBumperToWheel
 *   spec.rearBumperToWheel
 *   spec.wheelbase
 *   spec.wheelWidth
 *   spec.wheelDiameter
 *   spec.wheelShaftLength
 *   spec.steeringRatio
 *   spec.maxTurningDegree
 *   spec.maxSpeed
 */
var wrapper = document.getElementById('wrapper'),
    opt1 = {
      width: 160,
      length: 490,
      weight: 1500,
      frontBumperToWheel: 88,
      rearBumperToWheel: 113,
      wheelbase: 289,
      wheelWidth: 25,
      wheelDiameter: 66,
      wheelShaftLength: 160,
      steeringRatio: '12:1',
      maxTurningDegree: 50,
      maxSpeed: 200
    },
    opt2 = {
      width: 150,
      length: 390,
      weight: 1000,
      frontBumperToWheel: 88,
      rearBumperToWheel: 88,
      wheelbase: 214,
      wheelWidth: 25,
      wheelDiameter: 60,
      wheelShaftLength: 150,
      steeringRatio: '12:1',
      maxTurningDegree: 20,
      maxSpeed: 140
    };

Simulator.init(wrapper);
Simulator.build('myCar', opt1);
Simulator.build('sedan', opt2);




/**
 * Addition
 */
var exec = false;



