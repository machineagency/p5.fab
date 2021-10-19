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
      fab.stopPrint(); // stop streaming the commands to printer.
    });

}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  fab.render();
}

function fabDraw() {
  // setup!
  fab.setAbsolutePosition(); // set the coordinate system mode
  fab.setERelative(); // it's easier to work with the extruder axis in relative positioning
  
  fab.autoHome(); // establish a (0,0,0) 

  // fab.setTemps(205, 60); // (bedTemp, nozzleTemp). hot!

  // fab.introLine(); // clean the nozzle

  // fab.moveRetract(100, 100, 0.2); // 0.2 is a usual start height

  // fab.moveExtrude(150, 100, 0.2);
  // fab.moveExtrude(150, 150, 0.2, 300); // sloow
  // fab.moveExtrude(100, 150, 0.2, 900); // ~ 'normal'
  // fab.moveExtrude(100, 100, 0.2, 2700); // fast!

  // fab.presentPart();


}

