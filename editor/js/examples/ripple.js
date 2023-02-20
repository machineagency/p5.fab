function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  fab = createFab();
}

function fabDraw() {
  fab.setAbsolutePosition(); // set all axes (x.y/z/extruder) to absolute
  fab.setERelative(); // put extruder in relative mode, independent of other axes
  fab.autoHome();
  fab.setTemps(205, 60); // (nozzle, bed) °C - you should use a temperature best suited for your filament!
  fab.introLine(0.2); // draw to lines on the left side of the print bed

  let r = 25;
  let startHeight = 0.4;
  let layerHeight = 0.5;
  let h = 20;
  let s = 25;
  let center = new p5.Vector(fab.centerX, fab.centerY);
  let sideLength = 20;
  let x = center.x - sideLength / 2;
  let y = center.y - sideLength / 2;
  fab.moveRetract(x, y, layerHeight, 40);

  let amplitude = 0.5;
  let numOscillations = 25;
  let idx = 0;
  let phaseOffset = 0;
  for (let z = startHeight; z <= h; z += layerHeight) {
    //     let phaseOffset = (idx % 2 == 0) ? 0 : PI / 2;
    console.log(phaseOffset);
    idx += 1;
    // front
    for (let i = x; i <= x + sideLength; i += 1) {
      let t = map(i, x, x + sideLength, 0, numOscillations * PI);
      fab.moveExtrude(i, y + amplitude * sin(t + phaseOffset), z, 5, 5, true);
    }

    // right
    for (let i = y; i <= y + sideLength; i += 1) {
      let t = map(i, y, y + sideLength, 0, numOscillations * PI);
      fab.moveExtrude(
        x + sideLength + amplitude * sin(t + phaseOffset),
        i,
        z,
        5,
        5,
        true
      );
    }

    // back
    for (let i = x + sideLength; i >= x; i -= 1) {
      let t = map(i, x, x + sideLength, 0, numOscillations * PI);
      fab.moveExtrude(
        i,
        y + sideLength + amplitude * sin(t + phaseOffset),
        z,
        5,
        5,
        true
      );
    }

    // left
    for (let i = y + sideLength; i >= y; i -= 1) {
      let t = map(i, y, y + sideLength, 0, numOscillations * PI);
      fab.moveExtrude(x + amplitude * sin(t + phaseOffset), i, z, 5, 5, true);
    }
    phaseOffset += PI / 4;
  }

  fab.presentPart();
}

function draw() {
  background(255);
  fab.render();
}
