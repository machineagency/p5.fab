function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    fab = createFab();
}

function fabDraw() {
    fab.setERelative();
    fab.fanOff();
    fab.autoHome();
    fab.setTemps(205, 55); // wait for nozzle & bed to heat up
    fab.introLine(); // line back and forth to clean nozzle
    // your artifact here!
    
}

function draw() {
    background(255);
    fab.render();
}