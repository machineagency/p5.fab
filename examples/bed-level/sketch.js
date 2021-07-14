let gcoder;
let buttons;
let testState = 0;
let acceptCount = 0;
let positions = { 
  0:[30, 30, 0, 5000], 
  1:[200, 200, 0, 5000], 
  2:[30, 200, 0, 5000], 
  3:[200, 30, 0, 5000], 
  4:[115, 115, 0, 5000]
};
  
function setup() {
  // createCanvas(400, 400, WEBGL);

  gcoder = new GCoder();
  gcoder.on("ok", gcoder.serial_ok);

  gcoder.serial.on("noport", function () {
      console.log('noport');
    // we don't have access to any ports yet, so we need to request them.
    // add an event listener for a user clicking on the page
    document.addEventListener(
      "click",
      function () {
          console.log('click');
        gcoder.serial.requestPort();
      },
      { once: true }
    );

    //UI
    button = createButton('connect to printer', 0, 0);
  });

  gcoder.serial.on("portavailable", function () {
    // we have a serial port; ender wants to talk at 115200
  gcoder.serial.open({ baudRate: "115200" });
  });

  gcoder.serial.on("requesterror", function () {
    console.log("error!");
  });

  gcoder.serial.on("open", gcodeDraw);
  gcoder.serial.on("data", onData);

  // UI things
  let buttonConnect = createButton('connect to printer');
  buttonConnect.parent('bConnect');
  buttonConnect.mousePressed(connectToPrinter);

  let buttonHeat = createButton('heat nozzle');
  buttonHeat.parent('bHeat');
  buttonHeat.mousePressed(heatNozzle);

  let buttonCool = createButton('cool down');
  buttonCool.parent('bCool');
  buttonCool.mousePressed(coolPrinter);

  let buttonPaperAdjust = createButton('adjusted');
  buttonPaperAdjust.parent('bPaper');
  buttonPaperAdjust.mousePressed(paperTestAdjusted);
  let buttonPaperAccept = createButton('accepted');
  buttonPaperAccept.parent('bPaper');
  buttonPaperAccept.mousePressed(paperTestAccepted);

  let buttonTest = createButton('run test print');
  buttonTest.parent('bTest');
  buttonTest.mousePressed(testPrint);
}

function draw() {
  // orbitControl(2, 2, 0.001);
  // background(0);
  fill(0);

}

function gcodeDraw() {
}

function onData() {
  gcoder.serialResp += gcoder.serial.readString();

  if (gcoder.serialResp.slice(-1) == '\n') {
    console.log(gcoder.serialResp);
    if (gcoder.serialResp.search('ok') > -1) {
      gcoder.emit("ok", gcoder);
    }
    gcoder.serialResp = '';
  }
}

async function connectToPrinter() {
    gcoder.commands = [];
    await gcoder.serial.requestPort();
}

function heatNozzle() {
  gcoder.autoHome();
  gcoder.move(100, 100, 100, 3000);
  gcoder.setNozzleTemp(200);
  gcoder.print();
}

function coolPrinter() {
  gcoder.autoHome();
  gcoder.setNozzleTemp(0);
  gcoder.setNozzleTemp(0);
  gcoder.print();
}

function paperTestCycle() {
  let p = positions[testState];
  gcoder.up(3);
  gcoder.move(p[0], p[1], p[2], p[3], p[4]);
  gcoder.print();
}

function paperTestAdjusted() {
  paperTestCycle(testState);
  testState++;
  acceptCount = 0;
  if (testState > 4) {
    testState = 0;
  }
}

function paperTestAccepted() {
  paperTestCycle(testState);
  testState++;
  if (testState > 4) {
    testState = 0;
  }
  acceptCount++;
  if (acceptCount == 5) {
    alert('done!');
  }
}

function testPrint() {
  // gcoder.commands = [];
  gcoder.setERelative();
  gcoder.autoHome();
  gcoder.setNozzleTemp(200);
  gcoder.setBedTemp(60);
  gcoder.introLine();
  gcoder.move(30,30,0.5);
  let o = 10;
  let s = 1000;
  let lx = 0;
  let ly = 0;
  let count = 0;
  for (let i = 0; i < 9; i++){
    gcoder.moveExtrude(200-lx, 30+ly, 0.3);
    console.log([200-lx, 30+ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
    gcoder.moveExtrude(200-lx, 200-ly, 0.3);
    console.log([200-lx, 200-ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
    gcoder.moveExtrude(30+lx, 200-ly, 0.3);
    console.log([30+lx, 200-ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
    gcoder.moveExtrude(30 +lx, 30+ly, 0.3);
    console.log([30+lx, 30+ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
  }

  gcoder.up(10);

  // gcoder.move(30, 50, 0.2);
  // gcoder.moveExtrude(200, 50, 0.6);

  gcoder.presentPart();
  gcoder.print();
}

function checkCount(count, lx, ly) {
  count++;
  ly = (count+1) % 4 == 0 ? ly+10 : ly;
  lx = (count>0 && (count+1) % 4 == 1) ? lx+10 : lx;

  return [count, lx, ly]
}