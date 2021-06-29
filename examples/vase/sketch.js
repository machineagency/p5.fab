let gcoder;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  gcoder = new GCoder();
  gcoder.on("ok", gcoder.serial_ok);
  button = createButton('click me');
  button.position(0, 0);
  button.mousePressed(changeBG);
  gcoder.serial.on("noport", function () {
      console.log('noport');
    // we don't have access to any ports yet, so we need to request them.
    // add an event listener for a user clicking on the page
    document.addEventListener(
      "click",
      function () {
          console.log('click');
        gcoder.serial.requestPort();
      },
      { once: true }
    );
  });

    gcoder.serial.on("portavailable", function () {
    // we have a serial port; ender wants to talk at 115200
    gcoder.serial.open({ baudRate: "115200" });
  });

  gcoder.serial.on("requesterror", function () {
    console.log("error!");
  });

  gcoder.serial.on("open", gcodeDraw);
  gcoder.serial.on("data", onData);
}

function draw() {
  orbitControl(2, 2, 0.001);
  background(0);
  normalMaterial();
  lights();
  if (gcoder.model) {
    model(gcoder.model);
  }
}

function gcodeDraw() {
  // setup printing variables
  // this is a standard setup block:
  let s = 1000; // speed, mm/min
  gcoder.setERelative();
  gcoder.fanOn();
  gcoder.autoHome(); // 
  gcoder.setNozzleTemp(200); // wait for nozzle to heat up
  gcoder.setBedTemp(70); // wait for bed to heat up
  gcoder.introLine(); // line back and forth to clean nozzle

  // design your artifact here!
  // here's a vase example
  let r = 10;
  let step = TWO_PI / 100;
  let startHeight = 0.2;
  let maxHeight = 150;
  let layerHeight = 1;
  let rb = 50;
  let amp = 5;
  // vase
  for (let z = startHeight; z < maxHeight; z += layerHeight) {
    let a = map(z, startHeight, maxHeight, 0, 4 * TWO_PI);
    r = map(
      cos(map(z / maxHeight, 0, 1, 2, 0.5) * a),
      -1,
      1,
      rb - 5 * cos(a) * (1 - z / maxHeight),
      rb + 5 * cos(a) * (1 - z / maxHeight)
    );

    console.log(rb - (1 - z / maxHeight));
    for (let t = 0; t < TWO_PI; t += step) {
      let x = r * cos(t) + 100;
      let y = r * sin(t) + 100;
      gcoder.moveExtrude(x, y, z, s);
    }
  }
  // end artifact

  gcoder.render(); // if you want to visualize it
  gcoder.presentPart(); // pop the bed out. 
  gcoder.print(); //print it!
}

function onData() {
  let lineFeedChar = 10;
  let incomingChar = gcoder.serial.readBytes();
  let resp = "";
  if (incomingChar[incomingChar.length - 1] == lineFeedChar) {
    for (let i = 0; i < incomingChar.length; i++) {
      resp += String.fromCharCode(incomingChar[i]);
    }
  }

  console.log("The response is: " + incomingChar);
  if (resp.search("k") > -1 || resp == "\n") {  // eek... sometimes o and k come in different packets!
    gcoder.emit("ok", gcoder);
  } else {
    console.log("waiting...");
  }
}

// saveStrings(gcoder.commands, 'cmds.txt');
function changeBG() {
    let val = random(255);
    gcoder.serial.requestPort();
  }