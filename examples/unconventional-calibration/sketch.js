let dicer;
let bStep, absX, absY, absZ, curPos;

let p1 = new p5.Vector();
let p2 = new p5.Vector(50, 0, -)

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL).position(0,250);
  setupUI();

  dicer = createDicer(); 
}

function dicerDraw() {
  dicer.commands = [];
  dicer.setAbsolutePosition();
  dicer.setERelative();

  // custom intro line along the back of build plate
  dicer.moveRetract(50, 200, 100, 1500);
  dicer.setNozzleTemp(205);
  dicer.moveRetract(50, 200, 1); // new clips can raise the build plate, so lift up to avoid scratching
  dicer.moveExtrude(220, 200, 1);
  dicer.moveExtrude(220, 199, 1);
  dicer.moveExtrude(50, 199, 1);
  dicer.moveRetract(50, 200, 100); //pop up to avoid collisions
  
  
    // handle
  let y = p1.y;
  let s = 300;
  let layerHeight = 0.25;
  
  const [m,b] = slope(x1, z1, x2, z2);

  dicer.moveRetract(x1, y, z1);

  // print a few base layers 
  for (let h = 0; h < 2; h += layerHeight) {
    dicer.moveExtrude(p1.x, y, p1.z + h, s);
    dicer.moveExtrude(p2.x, y, p2.z + h, s);
    h += layerHeight;
    dicer.moveExtrude(p2.x, y,p2.z + h, s);
    dicer.moveExtrude(p1.x, y, p1.z + h, s);
  }

  // hand hole
  // get new points on the surface 
  // assumes p1.x < p2.x (i.e. p1 is to the left of p2)
  let x1_ = p1.x + 10; 
  let z1_ = m * x1_ + b;

  let x2_ = p2.x - 10;
  let z2_ = m * x2_ + b;

  for (h = 2; h < 5; h += layerHeight) {
    dicer.moveExtrude(p1.x, y, p1.z + h, s);
    dicer.moveExtrude(x1_, y, z1_ + h, s);
    dicer.moveRetract(x2_, y, z2_ + h); // hole
    dicer.moveExtrude(p2.x, y, p2.z + h, s);
    h += layerHeight;
    dicer.moveExtrude(p2.x, y, p2.z + h, s);
    dicer.moveExtrude(x2_, y, z2_ + h, s); 
    dicer.moveRetract(x1_, y, z1_ + h); // hole
    dicer.moveExtrude(p1.x, y, p1.z + h, s);
  }

  // top of handle
  for (h = 5; h <= 7; h += layerHeight) {
    s = (h < 6) ? 1000 : 300; // move quickly over initial gap to avoid sagging
    dicer.moveExtrude(p1.x, y, p1.z + h, s);
    dicer.moveExtrude(p2.x, y, p2.z + h, s);
    h += layerHeight;
    dicer.moveExtrude(p2.x, y, p2.z + h, s);
    dicer.moveExtrude(p1.x, y, p1.z + h, s);
  }
  
    dicer.moveRetract(200, 50, 100);
}

function slope(x1, z1, x2, z2) {
  let m = (z2 - z1) / (x2 - x1);
  let b = z1 - (m*x1);

  return [m,b];
}
function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  dicer.render();
  
  curPos.html("Current Position: " + dicer.reportedPos);

}


/*********************************************************
 * UI Setup
 */

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setupUI() {
  // ************** CONTROLS UI ************** //
  let l = 50; // p5 doesn't grab updated width from css class

  // make buttons & inputs
  let hXY = createElement('h2', 'XY'); // header XY
  let hZ = createElement('h2', 'Z');
  let blx = createButton('👈'); // button-left-x⬆⬆⬇⬇⬅➡⬅➡
  let brx = createButton('👉');
  let bly = createButton('☝️');
  let bry = createButton('👇');
  let buz = createButton('☝️');
  let bdz = createButton('👇');
  let bXYhome = createButton('🏠');
  let bZhome = createButton('🏠');

  // style the buttons
  let buttons = [blx, brx, bly, bry, buz, bdz, bXYhome, bZhome];
  for (const b of buttons) {
    b.addClass('controls');
  }

  // position buttons
  hXY.position(windowWidth/3 + 13, windowHeight/6 - 25);
  bXYhome.position(windowWidth/3, windowHeight/4);
  blx.position(windowWidth/3 - 5*l/4, windowHeight/4);
  brx.position(windowWidth/3 + 5*l/4, windowHeight/4);
  bly.position(windowWidth/3, windowHeight/4 - 5*l/4);
  bry.position(windowWidth/3, windowHeight/4 + 5*l/4);

  hZ.position(windowWidth/2 + 20, windowHeight/6 - 25);
  bZhome.position(windowWidth/2, windowHeight/4);
  buz.position(windowWidth/2, windowHeight/4 - 5*l/4);
  bdz.position(windowWidth/2, windowHeight/4 + 5*l/4);

  // left-side panel
  bStep  = createInput('1');
  bStep.attribute('type', 'number');
  bStep.attribute('step', '0.1');
  bStep.attribute('min', '0');
  let bStepLabel = createElement('label', 'step size (mm)');
  
  bStep.position(windowWidth/7, windowHeight/8);
  bStep.size(40);
  bStepLabel.position(25, windowHeight/8);

  absX = createInput('0');
  absY = createInput('0');
  absZ = createInput('0');
  let bAbsX = createButton('➡️');
  let bAbsY = createButton('➡️');
  let bAbsZ = createButton('➡️');
  let absButtons = [bAbsX, bAbsY, bAbsZ];
  let absPos = [absX, absY, absZ];
  let absLabels = [createElement('label', 'X (mm)'), createElement('label', 'Y (mm)'), createElement('label', 'Z (mm)')];
  // let xLabel = createElement('label', 'X (mm)');

  for (const i of absPos) {
    let idx = absPos.indexOf(i);
    i.attribute('type', 'number');
    i.attribute('step', '10');
    i.attribute('min', '0');
    i.size(40);
    i.position(windowWidth/7, windowHeight/8 + 40*(idx+1));
    absLabels[idx].position(25, windowHeight/8 +40*(idx+1));
    absButtons[idx].addClass('go-button');
    absButtons[idx].position(windowWidth/7 + i.width, windowHeight/8 + 40*(idx) + 20);
  }


  let bConnectPrinter = createButton('Connect!');
  bConnectPrinter.position(20, windowHeight/3 - 20);
  bConnectPrinter.addClass('heat-button');
  bConnectPrinter.mousePressed(connectPrinter);

  let bHeatNozzle = createButton('Heat Nozzle');
  bHeatNozzle.position(20, windowHeight/3 + 30);
  bHeatNozzle.addClass('heat-button');
  bHeatNozzle.mousePressed(heatNozzle);
  
  let bCoolNozzle = createButton('Cool Nozzle');
  bCoolNozzle.position(150, windowHeight/3 + 30);
  bCoolNozzle.addClass('heat-button');
  bCoolNozzle.mousePressed(coolNozzle);

  let bPrint = createButton('Print!');
  bPrint.addClass('heat-button');
  bPrint.position(150, windowHeight/3 - 20);
  bPrint.mousePressed(function() {
    dicerDraw();
    dicer.print();
  });

  let bSetP1 = createButton('Set Point 1');
  bSetP1.addClass('heat-button');
  bSetP1.position(20, windowHeight/3 + 80);
  bSetP1.mousePressed(function() {setPoint('p1')});

  let bSetP2 = createButton('Set Point 2');
  bSetP2.addClass('heat-button');
  bSetP2.position(150, windowHeight/3 + 80);
  bSetP2.mousePressed(function() {setPoint('p2')});


  curPos = createElement('text', 'Current Position: N/A');
  curPos.position(25, 6*windowHeight/8);
  // end left-side panel

  // add button events
  blx.mousePressed(function() { bSend('xl');});
  brx.mousePressed(function() { bSend('xr');});
  bly.mousePressed(function() { bSend('yl');});
  bry.mousePressed(function() { bSend('yr');});
  buz.mousePressed(function() { bSend('u');});
  bdz.mousePressed(function() { bSend('d');});
  bXYhome.mousePressed(function() { bSend('h');});
  bZhome.mousePressed(function() { bSend('h');});
  bAbsX.mousePressed(function() { bSend('x');});
  bAbsY.mousePressed(function() { bSend('y');});
  bAbsZ.mousePressed(function() { bSend('z');});
}


function connectPrinter() {
    dicer.serial.requestPort();
  }

function bSend(dir) {
  dicer.commands = [];
  let u = bStep.value();
  dicer.setRelativePosition();
  switch(dir) {
    case 'xl':
      dicer.moveX(-1*u);
      dicer.print();
      break;

    case 'xr':
      dicer.moveX(u);
      break;

    case 'yl':
      dicer.moveY(-1*u);
      break;
    
    case 'yr':
      dicer.moveY(u);
      break;

    case 'u':
      dicer.moveZ(u);
      break;

    case 'd':
      dicer.moveZ(-1*u);
      break;

    case 'h':
      dicer.autoHome();
      break;

    case 'x':
      u = absX.value();
      dicer.setAbsolutePosition();
      dicer.setERelative();
      dicer.moveX(u);
      break;
    
    case 'y':
      u = absY.value();
      dicer.setAbsolutePosition();
      dicer.setERelative();
      dicer.moveY(u);
      break;

    case 'z':
      u  = absZ.value();
      dicer.setAbsolutePosition();
      dicer.setERelative();
      dicer.moveZ(u);
      break;
    }
      
  dicer.getPos();
  dicer.print();

 curPos.html(dicer.reportedPos); 
}

function heatNozzle() {
  dicer.commands = [];
  dicer.setNozzleTemp(200);
  dicer.print();
}

function coolNozzle() {
  dicer.commands = [];
  dicer.setNozzleTemp(0);
  dicer.print();
}

function sendStop() {
  dicer.stopPrint();
  dicer.print();
}

function setPoint(p) {
  let pos = curPos.html();
  pos = pos.trim().split(/[\s:]/);

  if (p == 'p1') {
    p1 = new p5.Vector(parseInt(pos[4]), parseInt(pos[6]), parseInt(pos[8]));
  }
  else if (p == 'p2') {
    console.log('p2');
    p2 = new p5.Vector(parseInt(pos[4]), parseInt(pos[6]), parseInt(pos[8]));
  }
  
  let b = dicer.isPrinting;
  dicer.isPrinting = false;
  dicerDraw();
  dicer.parseGcode();
  dicer.isPrinting = b;
}