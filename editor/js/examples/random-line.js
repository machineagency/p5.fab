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
    
    // print a line between two points
    fab.moveExtrude(0, 0, 0, 25);
    fab.moveExtrude(100, 100, 0, 25);

    // randomly generate two points and print a line between them
    let p1 = createVector(0, 0, 0);
    let p2 = createVector(0, 0, 0);
    p1 = fab.randomPoint(z=0);
    p2 = fab.randomPoint(z=0);    

    // move to the first point
    fab.move(p1[0], p1[1], p1[2]);

    // extrude to the second point
    fab.moveExtrude(p2[0], p2[1], p2[2], 25);

    fab.printGCode(); // print the gcode to the console
    // fab.exportGCode() // download the gcode file
}

function draw() {
    background(255);
    fab.render();
}