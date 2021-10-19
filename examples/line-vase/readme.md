# Line Vase
Direct G-Code manipulation lets us print structures that might be quite difficult from a CAD environment. This sketch prints a series of delicate dots & lines, emulating the effect achieved by [LIA's *Filament Sculptures*](https://www.liaworks.com/theprojects/filament-sculptures/).

The exact values used below might need to be tuned depending on your machine & filament. 

![vase](./assets/vase.png)

```javascript
let fab;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  fab = createFab();

  // add a buttons to connect to the printer & to print!
  let connectButton = createButton('connect!');
  connectButton.position(20, 20);
  connectButton.mousePressed(function() {
    fab.serial.requestPort();
  });

  let printButton = createButton('print!');
  printButton.position(20, 60);
  printButton.mousePressed(function() {
    fab.print();
  });
}


function fabDraw() {
  // setup printing variables
  // this is a standard setup block:
  fab.setERelative();
  fab.fanOff();
  fab.autoHome();
  fab.setNozzleTemp(205); // wait for nozzle to heat up
  fab.setBedTemp(70); // wait for bed to heat up
  fab.introLine(); // line back and forth to clean nozzle
    
  /* design your artifact here!
   *  here's a vase line vase, based on LIA's 'Filament Sculptures' 
   * https://www.liaworks.com/theprojects/filament-sculptures/
   */

  let startHeight = 0.2;
  let o = 2;
  let s = 2500;
  let x = 100;
  let y = 100;
  let sf = 0;
  let maxL = 40;
  let l = 40;
  for (let h = startHeight; h <= 40+startHeight; h += o) { 
    // lines
    fab.moveExtrude(x + l, y+sf, h, s);
    fab.moveExtrude(x + l - sf, y + l, h, s);
    fab.moveExtrude(x, y + l - sf, h, s);
    fab.moveExtrude(x + sf, y, h, s);

    // dots
    fab.moveExtrude(x, y, h + o, 25, 5); // move slowly and extrude lots of filament on the dots
    fab.moveRetract(x + l, y, h, 3 * s); // move quickly from point to point to reduce stringing
    fab.moveExtrude(x + l, y, h + o, 25, 5);
    fab.moveRetract(x + l - sf, y + l, h, 3 * s);
    fab.moveExtrude(x + l - sf, y + l, h + o, 25, 5);
    fab.moveRetract(x, y + l - sf, h, 3 * s);
    fab.moveExtrude(x, y + l - sf, h + o, 25, 5);
    fab.move(x + sf, y, h + o, s);
  }
  // end artifact

  fab.presentPart(); // pop the bed out. 
}

function draw() {

}
```