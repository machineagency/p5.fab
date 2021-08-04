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

    let stopButton = createButton('stop!');
    stopButton.position(20, 100);
    stopButton.mousePressed(function() {
      dicer.stopPrint(); // stop streaming the commands to printer.
    });

}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  dicer.render();
}

function dicerDraw() {
  // setup!
  dicer.setAbsolutePosition(); // set the coordinate system mode
  dicer.setERelative(); // it's easier to work with the extruder axis in relative positioning
  
  dicer.autoHome(); // establish a (0,0,0) 

  // dicer.setTemps(205, 60); // (bedTemp, nozzleTemp). hot!

  // dicer.introLine(); // clean the nozzle

  // dicer.moveRetract(100, 100, 0.2); // 0.2 is a usual start height

  // dicer.moveExtrude(150, 100, 0.2);
  // dicer.moveExtrude(150, 150, 0.2, 300); // sloow
  // dicer.moveExtrude(100, 150, 0.2, 900); // ~ 'normal'
  // dicer.moveExtrude(100, 100, 0.2, 2700); // fast!

  // dicer.presentPart();


}

