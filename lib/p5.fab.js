let _fab;

/*****
 * Prototype functions make library method calls more like p5
 */

p5.prototype.createFab = function() {
  _fab = new Fab();
  return _fab;
};

p5.prototype.getSerial = function() {
  return _fab.serial;
};

p5.prototype.printOnOpen = function() {
  _fab.serial.on('open', () => _fab.print() );
};

/*
call fabDraw once, immediately after setup and before first draw()
pre is called before every draw, so we wrap predraw in a closure to run only once
*/

p5.prototype.predraw = (function(b) {
  console.log('registered');
    var once = false;
    return function() {
      if (!once) {
        once = true;
        if (typeof fabDraw === "function") {
          fabDraw();
          _fab.parseGcode();
        }
      }
    };
})();

p5.prototype.registerMethod('pre', p5.prototype.predraw);


/*****
 * Fab 
 * currenlty defaults to Ender values
 * could load in from config file if/when extending to other printers
 */
class Fab {
  constructor({baudRate = 115200, nozzleRadius = 0.4 / 2, filamentRadius = 1.75 / 2, maxX = 220, maxY = 220, maxZ = 250, autoConnect=true}={}) {
    // set up all the Serial Things
    this.serial = new p5.WebSerial();
    this.serial.setLineEnding('\n');
    this.baudRate = baudRate; 
    this.serialResp = "";
    this.callbacks = {};
    
    this.serial.on("portavailable", function () {
      _fab.serial.open({ baudRate: _fab.baudRate });
    });

    this.serial.on("requesterror", function () {
      console.log("error!");
    });
  
    this.serial.on("data", this.onData);

    this.serial.on('open', function () {
      console.log('port open');
    });

    if (autoConnect) {
      this.serial.getPorts(); 
    }

    this.on("ok", this.serial_ok);
  

    // Printer info
    this.gcode = "";
    this.commands = [];
    this.printer = "Ender3";
    this.x = 0;
    this.y = 0;
    this.v = 0;
    this.e = 0;
    this.speed = 0;
    this.nozzleT = 0;
    this.nozzleR = nozzleRadius //mm
    this.filamentR = filamentRadius;
    this.maxX = maxX;
    this.maxY = maxY
    this.maxZ = maxZ;
    this.reportedPos = "N/A";

    // rendering info
    this.vertices = [];
    this.model = '';

    this.isPrinting = false;
  }

  add(cmd) {
    this.commands.push(cmd);
  }

  print() {
      this.isPrinting = true;

      if (this.commands.length > 0) {
        this.serial.write(this.commands[0] + "\n");
        console.log("I am sending: " + this.commands[0]);
        this.commands.shift();
      } else {
        console.log("no commands to execute!");
      }
  }

    
  on(event, cb) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(cb);
  }

  emit(event, data) {
    let cbs = this.callbacks[event];
    if (cbs) {
      cbs.forEach((cb) => cb(data));
    }
  }

  serial_ok(g) {
    g.print(); //run any further commands, now that we've got an ok
  }

  onData() {
    if (_fab.isPrinting) {
      _fab.serialResp += _fab.serial.readString();
    
      if (_fab.serialResp.slice(-1) == '\n') {
        console.log(_fab.serialResp);
        if (_fab.serialResp.search('ok') > -1) {
          _fab.emit("ok", _fab);
        }
    
        if (_fab.serialResp.search(" Count ") > -1) { //this is the keyword hosts like e.g. pronterface search for M114 respos (https://github.com/kliment/Printrun/issues/1103)
          _fab.reportedPos = _fab.serialResp.split(' Count ')[0].trim();
        }
        _fab.serialResp = '';
      }
  }
  }

  parseGcode() {
    this.vertices = [];
    _fab.commands.forEach((cmd) => {
      let fullcommand = cmd;
      cmd = cmd.trim().split(" ");
      var code = cmd[0].substring(0, 2);
      if (code !== "G0" && code !== "G1") {
        //G0&1 are move commands. add G2&3 later.
        return;
      }
      var newV = new p5.Vector();
      let vertexData = { 
        command:code, 
        vertex:newV,
        full:fullcommand
      };

      /****
       *  parse gcode
       *  Ender coordinate system                                               
              7 +Z
             /
            /
            +-----------> +X
            |
            |
            |
            V +Y     

          p5 WEBGL coordinate system                            
              7 +Y                                                                                               
             /                                                                                                     
            /                                                                                                        
            +-----------> +X                                                                                     
            |                                                                                                           
            |                                                                                             
            |                                                                                                            
            V -Z                                                                                                         
           
       */
      cmd.forEach((c) => {
        let val = c.substring(1);
        switch (c.charAt(0)) {
          case "X":
            newV.x = val;
            break;
          case "Y":
            newV.z = val; // switch z-y
            break;
          case "Z":
            newV.y = -1 * val; // switch z-y
            break;
          case "E":
            if (val < 0) {
              newV = null;
              return;
            }
          case ";":
            if (val=='prime' || val=='intro' || val=='present'){
              newV = null;
              return;
            }

        }
      })

      if (newV) {
        this.vertices.push(vertexData);
      }
      
    });
    // finalize the geometry
    // const [detailX, detailY] = this.calculateDetails(this.vertices.length);
    // this.model = new p5.Geometry(600, 5);
    // this.model.vertices = this.vertices;
    // this.model.computeFaces();
    // this.model.computeNormals();
  }
    
  render() {
    // draw print bed
    translate(-this.maxX/2, 0, -this.maxY/2);
    rotateY(PI);
    scale(-1,1);
    push();
      translate(this.maxX/2, 0, this.maxY/2);
      rotateY(PI/12);
      rotateX(PI/12);
      fill(254, 249, 152);
      push();
      translate(0, 2.5, 0);
      box(this.maxX + 1, 5, this.maxY + 1); // build plate
      pop();

      push();
      noFill();
      translate(0, -this.maxZ/2 + 1, 0);
      stroke(220, 50, 32); 
      box(this.maxX, this.maxZ, this.maxY); // work envolope
      pop();

      noFill();
      stroke(0);
      translate(-this.maxX/2, 0, -this.maxY/2);
      beginShape(LINES);
      for (let v in this.vertices) {
        v = parseInt(v);
        if (v < this.vertices.length - 1) {
          if (this.vertices[v].command == "G0" && this.vertices[v+1].command !== "G1") {
            continue; // we don't extrude on G0, so don't draw
          }
        }
        else if (v == this.vertices.length - 1) { // if the last command isn't an extrude command, don't draw it (e.g. presentPart())
          if (this.vertices[v].command !== "G1") {
            continue;
          }
        }
        
        vertex(this.vertices[v].vertex.x, this.vertices[v].vertex.y, this.vertices[v].vertex.z);

        if ( this.vertices[v].command == "G1" && this.vertices[v+1].command == "G1") { // using LINES mode, so add vertex twice if it's continuously extruded
          vertex(this.vertices[v].vertex.x, this.vertices[v].vertex.y, this.vertices[v].vertex.z);
        }
      }
      endShape();
    pop();
  }

   calculateDetails(input) {
     // find detailX & detailY values for rendering
    let test = Math.floor(sqrt(input));
    while (input % test != 0) {
      test--;
    }
    return [test, input / test];
  }

  /*****
  * G-Code Commands
  */
  autoHome() {
    var cmd = "G28";
    this.add(cmd);
    this.add("G92 E0");

    return cmd;
  }

  setTemps(tNozzle, tBed) {
    var cmd = `M104 S${tNozzle}`; // set nozzle temp without waiting
    this.add(cmd);

    cmd = `M140 S${tBed}`; // set bed temp without waiting
    this.add(cmd);

    // now wait for both
    cmd = `M109 S${tNozzle}`;
    this.add(cmd);
    cmd = `M190 S${tBed}`
    this.add(cmd);

    return cmd;
  }

  setNozzleTemp(t) {
    var cmd = `M109 S${t}`; // wait for temp
    this.add(cmd);
    return cmd;
  }

  setBedTemp(t) {
    var cmd = `M190 S${t}`;
    this.add(cmd);
    return cmd;
  }

  setAbsolutePosition() {
    var cmd = "G90";
    this.add(cmd);
  }

  setRelativePosition() {
    var cmd = "G91";
    this.add(cmd);
  }

  setERelative() {
    var cmd = "M83";
    this.add(cmd);
  }

  fanOn() {
    var cmd = "M106";
    this.add(cmd);
  }

  fanOff() {
    var cmd = "M107";
    this.add(cmd);
  }

  pausePrint(t = null) {
    var cmd = t ? `M1 S${t}` : "M1 S10 this is a pause";
    this.commands.unshift(cmd);
  }

  stopPrint() {
    this.commands = []; // clear commands
    this.isPrinting = false;
    // this.serial.close();
    // this.serial.getPorts();

    fabDraw();
  }

  restartPrinter() {
    var cmd = "M999";
    this.add(cmd);
    this.print();
  }

  introLine(z = 0.3) {
    this.move(0.1, 20, z, 85);
    this.moveExtrude(0.1, 200, z, 25);
    this.addComment('intro');
    this.move(0.4, 200.0, z, 85);
    this.moveExtrude(0.4, 20.0, z, 25);
    this.addComment('intro');
    // adding header from cura intro
    this.add("G92 E0");
    this.add("G0 Z2.0 F3000"); 
    this.add("G0 X5 Y20 Z0.3 F5000.0");
    this.add("G92 E0");
  }

  presentPart() {
    var retractCmd = "G1 E-10.0 F6000";
    this.add(retractCmd);
    var cmd = "G0 X0 Y180 F9000";
    this.add(cmd);
  }

  waitCommand() {
    var cmd = "M400";
    this.add(cmd);
  }

  getPos() {
    var cmd = "M114_DETAIL";
    var cmd = "M114 D";
    this.add(cmd);
  }

  setPos() {
    var cmd = `G92 X${this.x} Y${this.y} Z${this.z} E${this.e}`

  }

  autoReportPos(t = 10) {
    // currently not working
    this.add("AUTO_REPORT_POSITION");
    t = parseInt(t);
    var cmd = `M154 S${t}`;
    this.add(cmd);
  }

  /*****
  * G-Code Path Commands
  */
  move(x, y, z, v) {
    this.x = parseFloat(x).toFixed(2);
    this.y = parseFloat(y).toFixed(2);
    this.z = parseFloat(z).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 X${this.x} Y${this.y} Z${this.z} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveX(x, v = 25) {
    this.x = parseFloat(x).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 X${this.x} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveY(y, v = 25) {
    this.y = parseFloat(y).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 Y${this.y} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveZ(z, v = 25) {
    this.z = parseFloat(z).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 Z${this.z} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  up(z, v = 50) {
    this.z = parseFloat(z).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 Z${this.z} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveExtrude(x, y, z, v = 25, e = this.makeE(x, y, z)) {
    this.x = parseFloat(x).toFixed(2);
    this.y = parseFloat(y).toFixed(2);
    this.z = parseFloat(z).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);
    this.e = e;
    var cmd = `G1 X${this.x} Y${this.y} Z${this.z} F${this.v} E${this.e}`;
    this.add(cmd);

    return cmd;
  }

  moveRetract(x, y, z, v = 25, e = 8) {
    // first retract a bit
    let minusE = -1 * e;
    var retractCmd = `G1 E${minusE} F4500`;
    this.add(retractCmd);

    //pop the nozzle up
    var popUpCmd = "G0 Z0.2";
    this.setRelativePosition();
    this.add(popUpCmd);
    this.setAbsolutePosition();
    this.setERelative();

    // now move to the positiom
    this.x = parseFloat(x).toFixed(2);
    this.y = parseFloat(y).toFixed(2);
    this.z = parseFloat(z).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);
    this.e = e;
    var cmd = `G0 X${this.x} Y${this.y} Z${this.z} F${this.v}`;
    this.add(cmd);

    // prime the nozzle
    var primeCmd = `G1 E${e} F4500 ;prime`;
    this.add(primeCmd);

    return cmd;
  }

  setMaxAcceleration(x, y, z) {
    var cmd = `M201 X${x} Y${y} Z${z};`;
    this.add(cmd);
  }
  setStartAcceleration(a) {
    var cmd = `M204 P${a};`;
    this.add(cmd);
  }

  makeE(x, y, z) {
    return (
      dist(this.x, this.y, x, y) *
      (this.nozzleR / this.filamentR) ** 2
    ).toFixed(2);
  }

  mm_sec_to_mm_min(v) {
    return v*60.0; // convert from mm/sec to mm/min
  }

  addComment(c) {
    _fab.commands[_fab.commands.length - 1] +=` ;${c}`
  }
}

function keyPressed() {
  if (key === 's') {
    console.log('s press');
    _fab.serial.requestPort();
  } 
}
