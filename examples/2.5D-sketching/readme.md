# 2.5D Sketching

We can print lines of one layer height to quickly make tactile 2.5D drawings. Here's an example where we draw a spiral.

Since this drawing is _all_ on the first layer, bed adhesion and bed leveling can make the print difficult to take off the print bed. One option is to print directly onto a piece of paper by taping or fastening the paper to the print bed. The z height should be changed accordingly through a bed leveling process or by measuring the paper thickness.

When making other sketches like this one, keep in mind that unless your retraction settings are _juuuust_ right, there will likely be either some unintended oozing of filament or light lines as the filament starts flowing (you can see this in the far left of the example image below).

![spiral](./assets/spiral.png)

```javascript
let fab;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  fab = createFab();

  let connectButton = createButton("connect!");
  connectButton.position(20, 20);
  connectButton.mousePressed(function () {
    fab.serial.requestPort(); // choose the serial port to connect to
  });

  let printButton = createButton("print!");
  printButton.position(20, 60);
  printButton.mousePressed(function () {
    fab.print(); // start streaming the commands to printer
  });

  let stopButton = createButton("stop!");
  stopButton.position(20, 100);
  stopButton.mousePressed(function () {
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
  let center = createVector(fab.centerX, fab.centerY); // center the spiral on the print bed
  let z = 0.2;
  let step = TWO_PI / 100;
  let speed = 500; // move slowly for adhesion

  for (let angle = 0; angle <= numSpirals * TWO_PI; angle += step) {
    let x = r * cos(angle);
    let y = r * sin(angle);

    angle == 0
      ? fab.moveRetract(center.x + x, center.y + y, z, 3 * speed)
      : fab.moveExtrude(center.x + x, center.y + y, z, speed);

    r -= 0.1;
  }
  fab.presentPart();
}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  fab.render();
}
```
