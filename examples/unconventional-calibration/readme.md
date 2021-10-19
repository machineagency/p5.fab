# Unconventional Calibration
We can use a [control panel](../control-panel) to help us print on top of another object. The calibration routine is based off of the process for normal [bed leveling](../bed-level), where you adjust the knobs of the printer bed such that the four corners of the bed are a paper's width (~0.2mm) from the nozzle. We can use this routine to accomplish tasks that might be difficult using traditional CAD & slicers, like print a handle on a cup. 

![handle](./assets/handle.jpg)

## Steps:
- Design your handle. You can also run through this process without change the code, which will produce the handle in the picture above!

- Home the printer

- Bring the hotend up from the bed and clean the nozzle. This might involve heating up the nozzle to wipe away bits hardened filament- you don't wan't that molten filament skewing the calibration.

- Using a clip or other adhesive, attach the cup to the printer bed. Note that adding another clip might raise other parts of the bed, so be careful of scratching the bed with the nozzle. On the Ender, fasten the cup on the opposite side from the LCD screen to avoid collisions with the clip.

![clipped-cup](./assets/clipped-cup.png)

- Now we can pick two end points points on the cup for the handle. Make sure the nozzle is cooled down & clean. Using the control panel, line the nozzle up with the center of the cup in the y-direction. Bring the nozzle down until it's close (but not touching) to the cup. Then, holding a piece of paper between the cup and the nozzle, use a lower step value (~0.1mm) to lower the nozzle until it just barely scratches the paper. Click 'Set Point 1' when complete. You should see the rendering update to reflect your chosen point.

- Use the control panel to pick another point, to the right of the first point. Be careful to avoid collisions with the cup.

- Repeat the paper-calibration process for your second point, and click 'Set Point 2' when complete.

- Verify that the rendering looks reasonable, and press print!

Other notes: Careful of collisions! The standard intro line won't work depending on where you attach your cup. In the sketch below, we manually draw our cleaning lines in the back of the build plate. 





```javascript
let fab;
let bStep, absX, absY, absZ, curPos;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setupUI();

  fab = createFab(); 
}

function draw() {
  orbitControl(2, 2, 0.001);
  background(255);
  normalMaterial();
  lights();
  if (fab.model) {
    model(fab.model);
  }

}

function fabDraw() {
  // custom intro line along the back of build plate
  fab.setAbsolutePosition();
  fab.setAbsolutePosition();
  fab.setERelative();
  fab.move(50, 200, 100, 1500);
  fab.setNozzleTemp(210);
  fab.move(50, 200, 1); // new clips can raise the build plate, so lift up to avoid scratching
  fab.moveExtrude(220, 200, 1.2);
  fab.moveExtrude(220, 199, 1.2);
  fab.moveExtrude(50, 199, 1.2);
  fab.move(50, 200, 100); //pop up to avoid collisions
  
  // handle
 let y = 40;
 let x1 = 35;
 let z1 = 70.2;
 let x2 = 75;
 let z2 = 64.5;
 let s = 300;
 let layerHeight = 0.25;
 const [m,b] = slope(x1, z1, x2, z2);

 fab.move(x1, y, z1);

// print a few layers 
for (let h = 0; h < 2; h += layerHeight) {
  fab.moveExtrude(x1, y, z1 + h, s);
  fab.moveExtrude(x2, y, z2 + h, s);
  h += layerHeight;
  fab.moveExtrude(x2, y, z2 + h, s);
  fab.moveExtrude(x1, y, z1 + h, s);
}

// hand hole
// get new points on the surface 
let x1_ = x1 + 10; 
let z1_ = m * x1_ + b;

let x2_ = x2 - 10;
let z2_ = m * x2_ + b;

for (h = 2; h < 10; h += layerHeight) {
  fab.moveExtrude(x1, y, z1 + h, s);
  fab.moveExtrude(x1_, y, z1_ + h, s);
  fab.moveRetract(x2_, y, z2_ + h); // hand hole
  fab.moveExtrude(x2, y, z2 + h, s);
  h += layerHeight;
  fab.moveExtrude(x2, y, z2 + h, s);
  fab.moveExtrude(x2_, y, z2_ + h, s); 
  fab.moveRetract(x1_, y, z1_ + h); // hand hole
  fab.moveExtrude(x1, y, z1 + h, s);
}

// top of handle
for (h = 10; h <= 15; h += layerHeight) {
  s = (h < 11) ? 1500 : 300; // move quickly over initial gap to avoid sagging
  fab.moveExtrude(x1, y, z1 + h, s);
  fab.moveExtrude(x2, y, z2 + h, s);
  h += layerHeight;
  fab.moveExtrude(x2, y, z2 + h, s);
  fab.moveExtrude(x1, y, z1 + h, s);
}

 
  fab.moveRetract(200, 50, 100);
  fab.print();
}

function slope(x1, z1, x2, z2) {
  let m = (z2 - z1) / (x2 - x1);
  let b = z1 - (m*x1);

  return [m,b];
}

function connectPrinter() {
    fab.serial.requestPort();
  }

function bSend(dir) {
  fab.commands = [];
  let u = bStep.value();
  fab.setRelativePosition();
  switch(dir) {
    case 'xl':
      fab.moveX(-1*u);
      fab.print();
      break;

    case 'xr':
      fab.moveX(u);
      break;

    case 'yl':
      fab.moveY(-1*u);
      break;
    
    case 'yr':
      fab.moveY(u);
      break;

    case 'u':
      fab.moveZ(u);
      break;

    case 'd':
      fab.moveZ(-1*u);
      break;

    case 'h':
      fab.autoHome();
      break;

    case 'x':
      u = absX.value();
      fab.setAbsolutePosition();
      fab.setERelative();
      fab.moveX(u);
      break;
    
    case 'y':
      u = absY.value();
      fab.setAbsolutePosition();
      fab.setERelative();
      fab.moveY(u);
      break;

    case 'z':
      u  = absZ.value();
      fab.setAbsolutePosition();
      fab.setERelative();
      fab.moveZ(u);
      break;
    }
      
  fab.getPos();
  fab.print();

 curPos.html(fab.reportedPos); 
}

function heatNozzle() {
  fab.commands = [];
  fab.setNozzleTemp(200);
  fab.print();
}

function coolNozzle() {
  fab.commands = [];
  fab.setNozzleTemp(0);
  fab.print();
}

function sendStop() {
  fab.stopPrint();
  fab.print();
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

  hZ.position(2*windowWidth/3 + 20, windowHeight/6 - 25);
  bZhome.position(2 * windowWidth/3, windowHeight/4);
  buz.position(2*windowWidth/3, windowHeight/4 - 5*l/4);
  bdz.position(2*windowWidth/3, windowHeight/4 + 5*l/4);

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
  bConnectPrinter.position(80, windowHeight/3 - 20);
  bConnectPrinter.addClass('heat-button');
  bConnectPrinter.mousePressed(connectPrinter);

  let bHeatNozzle = createButton('Heat Nozzle');
  bHeatNozzle.position(20, windowHeight/3 + 30);
  bHeatNozzle.addClass('heat-button');
  bHeatNozzle.mousePressed(heatNozzle);
  

  let bCoolNozzle = createButton('Cool Nozzle');
  bCoolNozzle.position(windowWidth/7 - 30, windowHeight/3 + 30);
  bCoolNozzle.addClass('heat-button');
  bCoolNozzle.mousePressed(coolNozzle);

  let bPrint = createButton('Print!');
  bPrint.addClass('heat-button');
  bPrint.position(80, windowHeight/3 + 80);
  bPrint.mousePressed(fabDraw);


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
```
