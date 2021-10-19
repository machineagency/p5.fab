let fab;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    fab = createFab();
  
    let connectButton = createButton('connect!');
    connectButton.position(20, 20);
    connectButton.mousePressed(function() {
      fab.serial.requestPort(); // choose the serial port to connect to
    });

    let printButton = createButton('print!');
    printButton.position(20, 60);
    printButton.mousePressed(function() {
      fab.print(); // start streaming the commands to printer
    });

    let stopButton = createButton('stop!');
    stopButton.position(20, 100);
    stopButton.mousePressed(function() {
      fab.stopPrint(); // stop streaming the commands to printer
    });
}

function fabDraw() {
  // setup!
  fab.setAbsolutePosition(); 
  fab.setERelative(); 
  fab.autoHome();
  fab.setTemps(205, 60); // (nozzle, bed)
  fab.introLine();

  // make a spiral!
  let r = 80; // outer radius
  let numSpirals = 8; // how many concentric spirals to make
  let center = createVector(fab.maxX/2, fab.maxY/2); // center the spiral on the print bed
  let z = 0.2;
  let step = TWO_PI/100;
  let speed = 500; // move slowly for adhesion


  for (let angle = 0; angle <= numSpirals * TWO_PI; angle += step) {
    let x = r * cos(angle); 
    let y = r * sin(angle); 

    if (angle == 0) {
      fab.moveRetract(center.x + x, center.y + y, z, 3 * speed);
    }

    else {
      fab.moveExtrude(center.x + x, center.y + y, z, speed);
    }

    r -= 0.1; 
  }
  fab.presentPart();
}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  fab.render();
}