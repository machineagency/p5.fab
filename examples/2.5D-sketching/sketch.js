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
  dicer.setAbsolutePosition(); 
  dicer.setERelative(); 
  dicer.autoHome();
  dicer.setNozzleTemp(205); 
  dicer.setBedTemp(60); 
  // dicer.introLine(0.3);
  
  // make a spiral!
  let r = 80; // outer radius
  let numSpirals = 8; // how many concentric spirals to make
  let center = createVector(dicer.maxX/2, dicer.maxY/2); // center the spiral on the print bed
  let z = 0.3;
  let speed = 300; // move slowly for adhesion


  for (let angle = 0; angle <= numSpirals * TWO_PI; angle += TWO_PI/100) {
    let x = r * cos(angle); 
    let y = r * sin(angle); 

    (angle == 0) ? dicer.moveRetract(center.x + x, center.y + y, z, 3 * speed) : dicer.moveExtrude(center.x + x, center.y + y, z, speed);

    r -= 0.1; 
  }
  dicer.presentPart();
}

function draw() {
  
}