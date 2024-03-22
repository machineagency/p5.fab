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

  // variables for our hollow cube!
  let sideLength = 25; //mm
  let center = new p5.Vector(fab.maxX / 2, fab.maxY / 2);
  let speed = 10; // mm/sec
  let layerHeight = 0.5; // mm
  let r = 15;
  let height = 10;

  for (let z = layerHeight; z <= height; z += layerHeight) {
    for (let theta = 0; theta <= TWO_PI; theta += PI / 100) {
      let x = r * cos(theta) + center.x;
      let y = r * sin(theta) + center.y;
      if (z == layerHeight && theta == 0) {
        fab.moveRetract(x, y, z, speed)
      }
      else {
        fab.moveExtrude(x, y, z, speed)
      }
    }
  }
  fab.moveRetract(100, 100, 100); // pop up when finished
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
    midiController.speed = midiData.mapVelocity(100, 1000); // values in mm/min
  }

  if (midiData.note == 20) {
    midiController.extrusionMultiplier = midiData.mapVelocity(0.5, 3);
  }

  if (midiData.note == 24) {
    midiController.zOff = midiData.mapVelocity(0.5, 8);
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
    moveCommand.e *= midiController.extrusionMultiplier;
  }

  if (midiController.zOff) {
    moveCommand.z += midiController.zOff;
  }

  return moveCommand; // be sure to return your modified moveCommand!
}