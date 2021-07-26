let dicer;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    dicer = createDicer();
  
    let connectButton = createButton('connect!');
    connectButton.position(20, 20);
    connectButton.mousePressed(function() {
      dicer.serial.requestPort(); // choose the serial port to connect to
    });

    let printButton = createButton('print!');
    printButton.position(20, 60);
    printButton.mousePressed(function() {
      dicer.print(); // start streaming the commands to printer
    });
}

function dicerDraw() {
  // setup!
  dicer.setAbsolutePosition(); // set all axes (x.y/z/extruder) to absolute
  dicer.setERelative(); // put extruder in relative mode, independent of other axes
  dicer.autoHome();
  dicer.setNozzleTemp(205); // °C - you should use a temperature best suited for your filament!
  dicer.setBedTemp(60); // °C - best temperature for good adhesion/no curling will vary based on filament used!
  dicer.introLine(); // draw to lines on the left side of the print bed
  
  // variables for our hollow cube!
  let sideLength = 20; //mm
  let x = 100; 
  let y = 100;
  let speed = 300; // mm/min
  let layerHeight = 0.2; // mm

  // design our hollow cube!
  dicer.moveRetract(x, y, layerHeight); // move to the start (x,y,z) position without extruding

  for (let z = layerHeight; z <= sideLength; z += layerHeight) { 
    if (z == layerHeight) { // if it's the first layer
    speed = 300; // slow print speeed down for the first layer
    }
    else {
      speed = 1000;
    }
    dicer.moveExtrude(x + sideLength, y, z, speed); // move along the bottom side while extruding filament
    dicer.moveExtrude(x + sideLength, y + sideLength, z, speed); // right side
    dicer.moveExtrude(x, y + sideLength, z, speed); // top side
    dicer.moveExtrude(x, y, z, speed); //left side
  }

  dicer.presentPart();
}

function draw() {
  
}