class GCoder {
  constructor() {
    this.serial = new p5.WebSerial();
    this.gcode = "";
    this.printer = "Ender3";
    this.x = 0;
    this.y = 0;
    this.v = 0;
    this.e = 0;
    this.speed = 0;
    this.nozzleT = 0;
    this.nozzleR = 0.4 / 2; //mm
    this.filamentR = 1.75 / 2;
    this.commands = [];
    
    this.vertices = [];
    this.model = '';

    this.callbacks = {};
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

  render() {
    gcoder.commands.forEach((cmd) => {
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
    this.model = new p5.Geometry(100, 140);
    this.model.vertices = this.vertices.slice(1); // remove origin
    this.model.computeFaces();
    this.model.computeNormals();
  }

  // setup commands
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

  introLine() {
    // cleaning lines, as in e.g. Cura
    // this.up(2.0);
    this.move(0.1, 20, 0.3, 5000);
    this.moveExtrude(0.1, 200, 0.3, 1500, 15);
    this.move(0.4, 200.0, 0.3, 5000.0);
    this.moveExtrude(0.4, 20.0, 0.3, 1500, 30);
  }

  presentPart() {
    var cmd = "G1 X0 Y180 F9000";
    this.add(cmd);
  }

  waitCommand() {
    var cmd = "M400";
    this.add(cmd);
  }

  // path commands
  move(x, y, z, v) {
    this.x = parseFloat(x).toFixed(2);
    this.y = parseFloat(y).toFixed(2);
    this.z = parseFloat(z).toFixed(2);
    this.v = parseFloat(v).toFixed(2);

    var cmd = `G0 X${this.x} Y${this.y} Z${this.z} F${this.v}`;
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

  moveRetract(x, y, z, v = 1500, e = -0.5 * this.makeE(x, y, z)) {
    this.x = parseFloat(x).toFixed(2);
    this.y = parseFloat(y).toFixed(2);
    this.z = parseFloat(z).toFixed(2);
    this.v = parseFloat(v).toFixed(2);
    this.e = e;
    var cmd = `G1 F${this.v} E${this.e}`;
    this.add(cmd);
    this.move(x, y, z, v);

    return cmd;
  }

  makeE(x, y, z) {
    return (
      dist(this.x, this.y, x, y) *
      (this.nozzleR / this.filamentR) ** 2
    ).toFixed(2);
  }
}
