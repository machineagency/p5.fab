let fab;
let midiController;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  let printerSettings = defaultPrinterSettings;
  printerSettings.fabscribe = true;
  fab = createFab(printerSettings);

  midiMode()
  midiController = createMidiController();


  let connectButton = createButton('connect!');
  connectButton.position(20, 20);
  connectButton.mousePressed(function () {
    fab.serial.requestPort(); // choose the serial port to connect to
  });

  let printButton = createButton('print!');
  printButton.position(20, 60);
  printButton.mousePressed(function () {
    fab.print(); // start streaming the commands to printer
  });

  let stopButton = createButton('stop!');
  stopButton.position(20, 100);
  stopButton.mousePressed(function () {
    fab.stopPrint(); // stop streaming the commands to printer
  });

  let selectCamera = createSelect();
  selectCamera.option('Select Camera!');
  selectCamera.selected('Select Camera!');
  selectCamera.position(100, 142);
  let cameraButton = createButton('camera!');
  cameraButton.position(20, 140);
  cameraButton.mousePressed(async function () {
    fab.videoStream = await navigator.mediaDevices.getUserMedia({ video: { mimeType: 'video/webm', deviceId: selectCamera.selected() } });
    let video = document.querySelector("#video");
    video.srcObject = fab.videoStream;
  });

  function gotDevices(mediaDevices) {
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        selectCamera.option(mediaDevice.deviceId);
      }
    });
  }
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
  console.log(selectCamera.selected());

}

function fabDraw() {
  // setup!
  fab.setAbsolutePosition(); // set all axes (x.y/z/extruder) to absolute
  fab.setERelative(); // put extruder in relative mode, independent of other axes
  fab.autoHome();
  // fab.setNozzleTemp(205); // °C - you should use a temperature best suited for your filament!
  // fab.setBedTemp(60); // °C - best temperature for good adhesion/no curling will vary based on filament used!
  // fab.introLine(0.2); // draw to lines on the left side of the print bed

  // variables for our hollow cube!
  let sideLength = 5; //mm
  let x = 100;
  let y = 100;
  let speed = 10; // mm/sec
  let layerHeight = 0.2; // mm

  // design our hollow cube!
  fab.moveRetract(x, y, layerHeight); // move to the start (x,y,z) position without extruding

  for (let z = layerHeight; z <= sideLength; z += layerHeight) {
    if (z == layerHeight) { // if it's the first layer
      speed = 10; // slow print speeed down for the first layer
    }
    else {
      speed = 25;
    }
    fab.moveExtrude(x + sideLength, y, z, speed); // move along the bottom side while extruding filament
    fab.moveExtrude(x + sideLength, y + sideLength, z, speed); // right side
    fab.moveExtrude(x, y + sideLength, z, speed); // top side
    fab.moveExtrude(x, y, z, speed); //left side
  }

  fab.presentPart();
  fab.render();
}

function draw() {
  orbitControl(2, 2, 0.1);
  background(255);
  fab.render();
}

function midiSetup(midiData) {
  // in midiSetup, we can specify the actions we want to happen on incoming note values
  // to figure out notes for your midi controller, use debug=true in createMidiController
  if (midiData.note == 1 && midiData.type == MidiTypes.NOTEON) {
    fab.print();
  }

  if (midiData.note == 16) {
    // for any incoming value, we can name the property we want to cahnge in midiDraw
    midiController.speed = midiData.mapVelocity(600, 3000); // values in mm/min
  }

  if (midiData.note == 20) {
    midiController.extrusionMultiplier = midiData.mapVelocity(0.5, 5);
  }

  if (midiData.note == 24) {
    midiController.zOff = midiData.mapVelocity(0.5, 5);
  }
}

function midiDraw(moveCommand) {
  // in midiDraw, we can modify commands as they're sent to the printer
  // moveCommand has x, y, z, e, and f properties (f is speed)
  // we can modify them with any midiController property that we defined in midiSetup
  if (midiController.speed) {
    moveCommand.f = midiController.speed;
  }

  if (midiController.extrusionMultiplier) {
    moveCommand.e = midiController.extrusionMultiplier;
  }

  if (midiController.zOff) {
    moveCommand.z += midiController.zOff;
  }

  return moveCommand; // be sure to return your modified moveCommand!
}