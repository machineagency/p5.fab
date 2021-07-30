let _dicer;

/*****
 * Prototype functions make library method calls more like p5
 */

p5.prototype.createDicer = function() {
  _dicer = new Dicer();
  return _dicer;
};

p5.prototype.getSerial = function() {
  return _dicer.serial;
};

p5.prototype.printOnOpen = function() {
  _dicer.serial.on('open', () => _dicer.print() );
};

/*
call dicerDraw once, immediately after setup and before first draw()
pre is called before every draw, so we wrap predraw in a closure to run only once
*/

p5.prototype.predraw = (function() {
    var once = false;
    return function() {
      if (!once) {
        once = true;
        if (typeof dicerDraw === "function") {
          dicerDraw();
        }
      }
    };
})();

p5.prototype.registerMethod('pre', p5.prototype.predraw);


/*****
 * Dicer 
 * currenlty defaults to Ender values
 * could load in from config file if/when extending to other printers
 */
class Dicer {
  constructor({baudRate = 115200, nozzleRadius = 0.4 / 2, filamentRadius = 1.75 / 2, maxX = 220, maxY = 220, autoConnect=true}={}) {
    // set up all the Serial Things
    this.serial = new p5.WebSerial();
    this.serial.setLineEnding('\n');
    this.baudRate = baudRate; 
    this.serialResp = "";
    this.callbacks = {};
    
    this.serial.on("portavailable", function () {
      _dicer.serial.open({ baudRate: _dicer.baudRate });
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
    this.reportedPos = "no pos yet";

    // rendering info
    this.vertices = [];
    this.model = '';
  }

  add(cmd) {
    this.commands.push(cmd);
  }

  print() {
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
    _dicer.serialResp += _dicer.serial.readString();
  
    if (_dicer.serialResp.slice(-1) == '\n') {
      console.log(_dicer.serialResp);
      if (_dicer.serialResp.search('ok') > -1) {
        _dicer.emit("ok", _dicer);
      }
  
      if (_dicer.serialResp.search(" Count ") > -1) { //this is the keyword hosts like e.g. pronterface search for M114 respos (https://github.com/kliment/Printrun/issues/1103)
        _dicer.reportedPos = _dicer.serialResp.split(' Count ')[0].trim();
      }
      _dicer.serialResp = '';
    }
  }

  render() {
    _dicer.commands.forEach((cmd) => {
      cmd = cmd.trim().split(" ");
      var code = cmd[0].substring(0, 2);
      if (code !== "G1") {
        //G1 are extrusion commands. assume never extrude on G0
        return;
      }

      var newV = new p5.Vector();
      cmd.forEach((c) => {
        switch (c.charAt(0)) {
          case "X":
            newV.x = c.substring(1);
            break;
          case "Y":
            newV.z = c.substring(1); // switch z-x
            break;
          case "Z":
            newV.y = c.substring(1); // switch z-x
            break;
          case "E":
            if (c.substring(1) < 0) {
              return;
            }
        }
      });
      this.vertices.push(newV);
      
    });
    // finalize the geometry
    console.log(this.vertices.length);
    // const [detailX, detailY] = this.calculateDetails(this.vertices.length);
    // this.model = new p5.Geometry(600, 5);
    // this.model.vertices = this.vertices;
    // this.model.computeFaces();
    beginShape();
      for (var v in vertices) {
        vertex(this.vertices[v].x, this.vertices[v].y, thisvertices[v].z);
      }
    endShape();
    // this.model.computeNormals();
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

  setNozzleTemp(t) {
    var cmd = `M109 S${t}`;
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

  stopPrint(t = null) {
    var cmd = t ? `M1 S${t}` : "M1 S10 this is a pause";
    this.commands.unshift(cmd);
  }

  introLine(z = 0.3) {
    this.move(0.1, 20, z, 5000);
    this.moveExtrude(0.1, 200, z, 1500);
    this.move(0.4, 200.0, z, 5000.0);
    this.moveExtrude(0.4, 20.0, z, 1500);
    // adding stuff from cura intro]
    this.add("G92 E0");
    this.add("Z2.0 F3000"); 
    this.add("G1 X5 Y20 Z0.3 F5000.0");
    this.add("G92 E0");
  }

  presentPart() {
    var retractCmd = "G1 E-5.0 F6000";
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
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 X${this.x} Y${this.y} Z${this.z} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveX(x, v = 1000) {
    this.x = parseFloat(x).toFixed(2);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 X${this.x} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveY(y, v = 1000) {
    this.y = parseFloat(y).toFixed(2);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 Y${this.y} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveZ(z, v = 1000) {
    this.z = parseFloat(z).toFixed(2);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 Z${this.z} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  up(z, v = 3000) {
    this.z = parseFloat(z).toFixed(2);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 Z${this.z} F${this.v}`;
    this.add(cmd);

    return cmd;
  }

  moveExtrude(x, y, z, v = 1500, e = this.makeE(x, y, z)) {
    this.x = parseFloat(x).toFixed(2);
    this.y = parseFloat(y).toFixed(2);
    this.z = parseFloat(z).toFixed(2);
    this.v = parseFloat(v).toFixed(2);
    this.e = e;
    var cmd = `G1 X${this.x} Y${this.y} Z${this.z} F${this.v} E${this.e}`;
    this.add(cmd);

    return cmd;
  }

  moveRetract(x, y, z, v = 1500, e = -0.1 * this.makeE(x, y, z)) {
    // first retract a bit
    var retractCmd = "G1 E-8.0 F4500";
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
    this.v = parseFloat(v).toFixed(2);
    this.e = e;
    var cmd = `G0 X${this.x} Y${this.y} Z${this.z} F${this.v}`;
    this.add(cmd);

    // prime the nozzle
    var primeCmd = "G1 E8.0 F4500";
    this.add(primeCmd);

    return cmd;
  }

  makeE(x, y, z) {
    return (
      dist(this.x, this.y, x, y) *
      (this.nozzleR / this.filamentR) ** 2
    ).toFixed(2);
  }
}

function keyPressed() {
  if (key === 's') {
    console.log('s press');
    _dicer.serial.requestPort();
  } 
}
