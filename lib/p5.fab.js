let _fab;
let _once = false;
let _recoverCameraPosition = false;
let _syncVizStream = true;

/*****
 * Prototype functions make library method calls more like p5
 *****/

p5.prototype.createFab = function () {
  _fab = new Fab();
  return _fab;
};

p5.prototype.getSerial = function () {
  return _fab.serial;
};

p5.prototype.printOnOpen = function () {
  _fab.serial.on("open", () => _fab.print());
};

// save shape as Geometry from immediate mode
// this may become easier in future p5 releases
// source: https://github.com/processing/p5.js/issues/5393#issuecomment-910100074
p5.RendererGL.prototype.saveShape = function () {
  if (this.immediateMode.shapeMode !== 0x0000)
    // POINTS
    this._processVertices(...arguments);
  this.isBezier = false;
  this.isQuadratic = false;
  this.isCurve = false;
  this.immediateMode._bezierVertex.length = 0;
  this.immediateMode._quadraticVertex.length = 0;
  this.immediateMode._curveVertex.length = 0;

  // patch and return geometry
  let g = this.immediateMode.geometry;

  this._savedShapesCount = this._savedShapesCount + 1 || 0;
  g.gid = "saved|" + this._savedShapesCount; // assign gid to cache buffer
  g._makeTriangleEdges = function () {
    return this;
  }; // shadow this function to avoid loosing edges when `model(...)` is called

  // assign a new geometry to immediateMode to avoid pointer aliasing
  this.immediateMode.geometry = new p5.Geometry();

  return g;
};

p5.prototype.saveShape = function () {
  if (this._renderer.isP3D) {
    return this._renderer.saveShape(...arguments);
  } else {
    console.warn("Don't use saveShape in 2D mode.");
  }
};

/*
call fabDraw once, immediately after setup and before first draw()
pre is called before every draw, so we wrap predraw in a closure to run only once
*/
p5.prototype.predraw = (function (b) {
  console.log("registered");

  return function () {
    if (!_once) {
      _once = true;
      if (typeof fabDraw === "function") {
        _fab.model = ""; // clear last model
        _fab.commands = []; // clear the gcode commands -- commandStream is preserved
        fabDraw();
        _fab.parseGcode();
        _syncVizStream = true; // new model needs to be synced after current print job
      }
    }
  };
})();

p5.prototype.registerMethod("pre", p5.prototype.predraw);

const defaultPrinterSettings = {
  baudRate: 115200,
  nozzleDiameter: 0.4,
  filamentDiameter: 1.75,
  maxX: 220,
  maxY: 220,
  maxZ: 250,
  autoConnect: true,
  name: "ender3",
};

/*****
 * Fab
 * without config defaults to Ender values
 */
class Fab {
  constructor(config = defaultPrinterSettings) {
    this.configure(config);

    // set up all the Serial Things
    this.serial = new p5.WebSerial();
    this.serial.setLineEnding("\n");
    this.serialResp = "";
    this.callbacks = {};

    this.serial.on("portavailable", function () {
      _fab.serial.open({ baudRate: _fab.baudRate });
    });

    this.serial.on("requesterror", function () {
      console.log("error!");
    });

    this.serial.on("data", this.onData);

    this.serial.on("open", function () {
      console.log("port open");
    });

    if (config.autoConnect) {
      this.serial.getPorts();
    }

    this.on("ok", this.serial_ok);
    // Printer info
    this.gcode = "";
    this.commands = [];
    this.commandStream = []; // for streaming to the printer
    this.printer = config.name;
    this.x = 0;
    this.y = 0;
    this.v = 0;
    this.e = 0;
    this.speed = 0;
    this.nozzleT = 0;
    this.reportedPos = "N/A";

    // rendering info
    this.vertices = [];
    this.model = "";
    this.isPrinting = false;

    // camera
    this.camera = createCamera();
    this.cameraPosition = new p5.Vector(
      this.camera.eyeX,
      this.camera.eyeY,
      this.camera.eyeZ
    );
    this.cameraOrientation = new p5.Vector(
      this.camera.centerX,
      this.camera.centerY,
      this.camera.centerZ
    );
  }

  add(cmd) {
    this.commands.push(cmd);
  }

  print() {
    if (this.isPrinting) {
      console.log("print in progress, cant start a new print");
      return;
    }
    if (!this.isPrinting && _syncVizStream) {
      this.commandStream = this.commands;
      _syncVizStream = false;
    }

    // send first commands
    if (this.commandStream.length > 0) {
      this.isPrinting = true;
      this.serial.write(this.commandStream[0] + "\n");
      console.log("starting print");
      this.commandStream.shift();
    } else {
      console.log("print finished!");
      this.isPrinting = false;
    }
  }

  printStream() {
    if (this.commandStream.length > 0) {
      this.isPrinting = true;
      this.serial.write(this.commandStream[0] + "\n");
      this.commandStream.shift();
    } else {
      console.log("print finished!");
      this.isPrinting = false;
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
    g.printStream(); // stream next command, now that we've got an ok
  }

  onData() {
    if (_fab.isPrinting) {
      _fab.serialResp += _fab.serial.readString();

      if (_fab.serialResp.slice(-1) == "\n") {
        if (_fab.serialResp.search("ok") > -1) {
          _fab.emit("ok", _fab);
        }

        if (_fab.serialResp.search(" Count ") > -1) {
          //this is the keyword hosts like e.g. pronterface search for M114 respos (https://github.com/kliment/Printrun/issues/1103)
          _fab.reportedPos = _fab.serialResp.split(" Count ")[0].trim();
        }
        _fab.serialResp = "";
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
        command: code,
        vertex: newV,
        full: fullcommand,
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
            if (val == "prime" || val == "present") {
              // || val == 'intro' to remove intro line
              newV = null;
              return;
            }
        }
      });

      if (newV) {
        this.vertices.push(vertexData);
      }
    });
  }

  render() {
    if (this.coordinateSystem == "delta") {
      this.drawDeltaPrinter();
    } else {
      this.drawCartesianPrinter();
    }

    if (!this.model) {
      //tracks current toolpath position
      var toolpathPos = new p5.Vector(0, 0, 0); // assume you're homed to start
      beginShape(LINES);
      for (let v in this.vertices) {
        v = parseInt(v);
        var vertexData = this.vertices[v];
        if (vertexData.command == "G0") {
          //move toolpath position
          toolpathPos = toolpathPos.set([
            vertexData.vertex.x,
            vertexData.vertex.y,
            vertexData.vertex.z,
          ]);
          continue; // no extrusions on G0
        } else if (vertexData.command == "G1") {
          // draw a line between current toolpath position and next toolpath position,
          // sent toolpath position
          vertex(toolpathPos.x, toolpathPos.y, toolpathPos.z);
          vertex(vertexData.vertex.x, vertexData.vertex.y, vertexData.vertex.z);
          toolpathPos = toolpathPos.set([
            vertexData.vertex.x,
            vertexData.vertex.y,
            vertexData.vertex.z,
          ]);
        }
      }
      endShape();
      this.model = saveShape();
    } else {
      model(this.model);
    }
    pop();

    // update camera position & orientation
    if (_recoverCameraPosition) {
      this.camera.setPosition(
        this.cameraPosition.x,
        this.cameraPosition.y,
        this.cameraPosition.z
      );
      _recoverCameraPosition = false;
      this.camera.lookAt(
        this.cameraOrientation.x,
        this.cameraOrientation.y,
        this.cameraOrientation.z
      );
    }

    this.cameraPosition.x = this.camera.eyeX;
    this.cameraPosition.y = this.camera.eyeY;
    this.cameraPosition.z = this.camera.eyeZ;
    this.cameraOrientation.x = this.camera.centerX;
    this.cameraOrientation.y = this.camera.centerY;
    this.cameraOrientation.z = this.camera.centerZ;
  }

  drawCartesianPrinter() {
    orbitControl(2, 2, 0.1);

    // draw print bed
    translate(-this.maxX / 2, 0, -this.maxY / 2);
    rotateY(PI);
    scale(-1, 1);
    push();
    translate(this.maxX / 2, 0, this.maxY / 2);
    rotateY(PI / 12);
    rotateX(PI / 12);
    fill(254, 249, 152);
    push();
    translate(0, 2.5, 0);
    box(this.maxX + 1, 5, this.maxY + 1); // build plate
    pop();

    push();
    noFill();
    translate(0, -this.maxZ / 2 + 1, 0);
    stroke(220, 50, 32);
    box(this.maxX, this.maxZ, this.maxY); // work envolope
    pop();

    noFill();
    stroke(0);
    translate(-this.maxX / 2, 0, -this.maxY / 2);
  }

  drawDeltaPrinter() {
    orbitControl(2, 2, 0.1);

    // draw print bed
    translate(-this.radius, 0, -this.radius);
    rotateY(PI);
    scale(-1, 1);
    push();
    translate(this.radius, 0, this.radius);
    rotateY(PI / 12);
    rotateX(PI / 12);
    fill(254, 249, 152);
    push();
    translate(0, 2.5, 0);
    cylinder(this.radius + 1, 5); // build plate
    pop();

    push();
    noFill();
    translate(0, -this.maxZ / 2 + 1, 0);
    stroke(220, 50, 32);
    box((2 * this.radius) / sqrt(2), this.maxZ, (2 * this.radius) / sqrt(2)); // work envolope
    pop();

    // not sure if needed
    noFill();
    stroke(0);
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
    cmd = `M190 S${tBed}`;
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
    this.commandStream.unshift(cmd);
  }

  configure(config) {
    this.coordinateSystem = config.coordinateSystem;
    this.radius = config.radius;
    this.nozzleR = config.nozzleDiameter / 2;
    this.filamentR = config.filamentDiameter / 2;
    this.baudRate = config.baudRate;
    this.autoConnect = config.autoConnect;
    this.maxZ = config.maxZ;
    if (config.coordinateSystem == "delta") {
      this.maxX = (2 * config.radius) / sqrt(2);
      this.maxY = this.maxX;
      this.centerX = 0;
      this.centerY = 0;
    } else {
      this.maxX = config.maxX;
      this.maxY = config.maxY;
      this.centerX = config.maxX / 2;
      this.centerY = config.maxY / 2;
    }
  }

  stopPrint() {
    this.commandStream = []; // clear commands
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
    if (this.coordinateSystem != "delta") {
      this.move(0.1, 20, z, 85);
      this.moveExtrude(0.1, 200, z, 25);
      this.addComment("intro");
      this.move(0.4, 200.0, z, 85);
      this.moveExtrude(0.4, 20.0, z, 25);
      this.addComment("intro");
    } else {
      for (let angle = 0; angle <= TWO_PI / 3; angle += TWO_PI / 50) {
        let x = 90 * cos(angle);
        let y = 90 * sin(angle);
        if (angle == 0) {
          fab.moveRetract(this.centerX + x, this.centerY + y, z, 30);
        } else {
          fab.moveExtrude(this.centerX + x, this.centerY + y, z, 5);
        }
      }
    }
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
    var cmd = `G92 X${this.x} Y${this.y} Z${this.z} E${this.e}`;
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

  // moveExtrude(x, y, z, v = 25, e = this.makeE(x, y, z)) {
  moveExtrude(x, y, z, v = 25, e = null, multiplier = false) {
    // this if statement was added
    if (e == null) {
      this.e = this.makeE(x, y, z);
    } else if (multiplier) {
      this.e = e * this.makeE(x, y, z);
    } else {
      this.e = e;
    }

    this.x = parseFloat(x).toFixed(2);
    this.y = parseFloat(y).toFixed(2);
    this.z = parseFloat(z).toFixed(2);
    v = this.mm_sec_to_mm_min(v);
    this.v = parseFloat(v).toFixed(2);

    // this.e = e; // this assignment was removed
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
    return v * 60.0; // convert from mm/sec to mm/min
  }

  addComment(c) {
    _fab.commands[_fab.commands.length - 1] += ` ;${c}`;
    _fab.commandStream[_fab.commands.length - 1] += ` ;${c}`;
  }

  printGCode() {
    console.log("Printing all G-code commands:");
    this.commands.forEach((cmd, index) => {
      console.log(`${index + 1}: ${cmd}`);
    });
  }

  exportGCode() {
    let gcode = "";
    this.commands.forEach((cmd) => {
      gcode += cmd + "\n";
    });

    let blob = new Blob([gcode], { type: "text/plain" });
    let url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }


  /**
   * Generates a random point within the specified range.
   * If x, y, or z are not provided, random values within the maximum range will be generated.
   * @param {number} [x] - The x-coordinate of the point.
   * @param {number} [y] - The y-coordinate of the point.
   * @param {number} [z] - The z-coordinate of the point.
   * @returns {number[]} - An array containing the random x, y, and z coordinates.
   */
  randomPoint(x, y, z) {
    let randX = x ? x : random(0, this.maxX);
    let randY = y ? y : random(0, this.maxY);
    let randZ = z ? z : random(0, this.maxZ);
    // parse float to 2 decimal places
    randX = parseFloat(randX.toFixed(2));
    randY = parseFloat(randY.toFixed(2));
    randZ = parseFloat(randZ.toFixed(2));
    // console.log(randX, randY, randZ);
    return [randX, randY, randZ];
  }
}

function windowResized() {
  _camPos = _fab.cameraPosition;
  _camOrientation = _fab.cameraOrientation;
  _recoverCameraPosition = true;
  resizeCanvas(windowWidth, windowHeight);
}
