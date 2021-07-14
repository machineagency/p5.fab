let gcoder;
let font;


function preload() {
  font = loadFont('assets/sans_serif.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  //Controls UI
  textFont(font);
  textSize(36);
  textAlign(CENTER, CENTER);
  let h = createElement('h2', 'position');
  h.position(20, 5);
  inputX = createInput();
  inputX.position(20, 65);
  buttonX = createButton('x');
  buttonX.position(inputX.x + inputX.width, 65);
  buttonX.mousePressed(sendX);
  inputY = createInput();
  inputY.position(20, 105);
  buttonY = createButton('y');
  buttonY.position(inputY.x + inputY.width, 105);
  buttonY.mousePressed(sendY);
  inputZ = createInput();
  inputZ.position(20, 145);
  buttonZ = createButton('z');
  buttonZ.position(inputZ.x + inputZ.width, 145);
  buttonZ.mousePressed(sendZ);

  buttonStop = createButton('stop');
  buttonStop.position(inputX.x, 185);
  buttonStop.mousePressed(sendStop);

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
  // orbitControl(2, 2, 0.001);
  // background(255);
  // normalMaterial();
  // lights();
  // if (gcoder.model) {
  //   model(gcoder.model);
  // }
  // stroke(0);
  // fill(255);
  // textFont(font);
  // text(gcoder.reportedPos, 0,0)

}

function gcodeDraw() {
  // setup printing variables
  // this is a standard setup block:
  let s = 500; // speed, mm/min
  let r = 48.9;
  let step = TWO_PI / 100;
  gcoder.setERelative();
  gcoder.fanOff();
  // gcoder.autoHome(); 
  // gcoder.setNozzleTemp(200); // wait for nozzle to heat up
  // gcoder.setBedTemp(70); // wait for bed to heat up
  // gcoder.introLine(); // line back and forth to clean nozzle
  gcoder.getPos();
  // test vals
  // gcoder.move(200, 32, 76.3);
  // gcoder.move(160, 32, 69.4);
  // gcoder.move(170, 32, 71.125);
  // gcoder.move(190, 32, 74.575);

  // custom intro line to avoid collision
  // gcoder.move(200, 35, 76.6); //p1
  // gcoder.move(160, 35, 70); //p2
  // gcoder.move(170, 35, 71.575);
  // gcoder.move(190, 35, 74.725);
  // gcoder.move(200, 35, 76.6); //p1
  gcoder.move(220, 199, 100, s);
  gcoder.setNozzleTemp(200);
  // gcoder.move(220, 199, 1.2);
  gcoder.moveExtrude(30, 200, 2);
  gcoder.moveExtrude(30, 199, 2);
  gcoder.moveExtrude(220, 199, 2);
  gcoder.moveExtrude(220, 198, 2);
  gcoder.moveExtrude(30, 198, 2);
  gcoder.moveExtrude(30, 197, 2);
  gcoder.moveExtrude(220, 197, 2);
  gcoder.move(220, 197, 100); //pop up to avoid collisions

  // // // mug handle
  gcoder.move(200, 35, 76.6, 1000); //p1
  gcoder.moveExtrude(160, 35, 70, 100); //p2
  let startx = 160;
  let endx = 200;
  for (let o = 0.2; o<20; o+=0.2) {
    gcoder.move(startx, 35, 70+o, s);
    gcoder.moveExtrude(endx, 35, 76.6+o, s);
    o+=0.2;
    startx += 0.5;
    endx -= 0.5;
    gcoder.move(endx, 35, 76.6+o, s);
    gcoder.moveExtrude(startx, 35, 70+o, s);
  }

  // for (let o = 0.2; o<=5; o+=0.2) {
  //   gcoder.moveExtrude(160, 35, 70+o);
  //   gcoder.moveExtrude(200, 35, 76.6+o, s);
  //   o += 0.2;
  //   gcoder.moveExtrude(200, 35, 76.6+o, s);
  //   gcoder.moveExtrude(160, 35, 70+o, s);
  // }
  // for (o=5.2; o<=10; o+=0.2) {
  //   gcoder.move(160, 35, 70+o, s);
  //   gcoder.moveExtrude(170, 35, 71.575+o, s);
  //   gcoder.move(190, 35, 74.725+o, s);
  //   gcoder.moveExtrude(200, 35, 76.6+o, s);
  //   o += 0.2;
  //   gcoder.moveExtrude(200, 35, 76.6+o, s);
  //   gcoder.moveExtrude(190, 35, 74.725+o, s);
  //   gcoder.move(170, 35, 71.575+o, s);
  //   gcoder.moveExtrude(160, 35, 70+o, s);
  // }
  // for (o = 10.2; o<=15; o+=0.2) {
  //   gcoder.moveExtrude(160, 35, 70+o, s);
  //   o += 0.2
  //   gcoder.moveExtrude(200, 35, 76.3+o, s);
  // }






  // gcoder.move(224, 40, 94);

  //custom intro line to avoid collision
  // gcoder.move(220, 200, 100, s);
  // gcoder.move(220, 200, 1.2);
  // gcoder.moveExtrude(30, 200, 1.2);
  // gcoder.moveExtrude(30, 199, 1.2);
  // gcoder.moveExtrude(220, 199, 1.2);
  // gcoder.moveExtrude(220, 198, 1.2);
  // gcoder.moveExtrude(30, 198, 1.2);
  // gcoder.moveExtrude(30, 197, 1.2);
  // gcoder.moveExtrude(220, 197, 1.2);
  // gcoder.move(220, 199, 100);
  // gcoder.move(228, 27, 100);
  // let t = 0;
  // for (let o = 0; o<10; o+=0.4) {
  //   for (t = HALF_PI - PI/8; t < HALF_PI + PI/8; t+=step) {
  //     let y = r * cos(t) + 40;
  //     let z = r * sin(t) + 45.1;
  //     gcoder.moveExtrude(224, y, z+o, 300);
  //   }
  //   o += 0.2;
  //   for (t = HALF_PI + PI/8; t > HALF_PI- PI/8; t-=step) {
  //     let y = r * cos(t) + 40;
  //     let z = r * sin(t) + 45.1;
  //     gcoder.moveExtrude(224, y, z+o, 300);
  //   }
  // }
  gcoder.getPos();
  // design your artifact here!
  // here's a vase example
  // let r = 10;
  // let step = TWO_PI / 100;
  // let startHeight = 0.2;
  // let maxHeight = 150;
  // let layerHeight = 0.2;
  // let rb = 50;
  // let amp = 5;
  // // vase
  // for (let z = startHeight; z < maxHeight; z += layerHeight) {
  //   let a = map(z, startHeight, maxHeight, 0, 4 * TWO_PI);
  //   r = map(
  //     cos(map(z / maxHeight, 0, 1, 2, 0.5) * a),
  //     -1,
  //     1,
  //     rb - 5 * cos(a) * (1 - z / maxHeight),
  //     rb + 5 * cos(a) * (1 - z / maxHeight)
  //   );

  //   console.log(rb - (1 - z / maxHeight));
  //   for (let t = 0; t < TWO_PI; t += step) {
  //     let x = r * cos(t) + 100;
  //     let y = r * sin(t) + 100;
  //     gcoder.moveExtrude(x, y, z, s);
  //   }
  // }
  // // // end artifact

  gcoder.render(); // if you want to visualize it
  // gcoder.presentPart(); // pop the bed out. 
  gcoder.print(); //print it!
}

function onData() {
  gcoder.serialResp += gcoder.serial.readString();

  if (gcoder.serialResp.slice(-1) == '\n') {
    console.log(gcoder.serialResp);
    if (gcoder.serialResp.search('ok') > -1) {
      gcoder.emit("ok", gcoder);
    }

    if (gcoder.serialResp.search(" Count ") > -1) { //this is the keyword hosts like e.g. pronterface search for M114 respos (https://github.com/kliment/Printrun/issues/1103)
      gcoder.reportedPos = gcoder.serialResp.split(' Count ')[0].trim();
    }
    gcoder.serialResp = '';
  }
}

// saveStrings(gcoder.commands, 'cmds.txt');
function changeBG() {
    let val = random(255);
    gcoder.serial.requestPort();
  }

function sendX() {
  const x = inputX.value();
  inputX.value('');

  gcoder.moveX(x);
  gcoder.print();
}

function sendY() {
  const y = inputY.value();
  inputY.value('');

  gcoder.moveY(y);
  gcoder.print();
}

function sendZ() {
  const z = inputZ.value();
  inputX.value('');

  gcoder.moveZ(z);
  gcoder.print();
}

function sendStop() {
  gcoder.stopPrint();
  gcoder.print();
}