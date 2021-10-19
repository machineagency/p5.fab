let fab;
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

  fab = createFab();

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
  fab.serialResp += fab.serial.readString();

  if (fab.serialResp.slice(-1) == '\n') {
    console.log(fab.serialResp);
    if (fab.serialResp.search('ok') > -1) {
      fab.emit("ok", fab);
    }
    fab.serialResp = '';
  }
}

async function connectToPrinter() {
    fab.commands = [];
    await fab.serial.requestPort();
}

function heatNozzle() {
  fab.autoHome();
  fab.move(100, 100, 100, 3000);
  fab.setNozzleTemp(200);
  fab.print();
}

function coolPrinter() {
  fab.setNozzleTemp(0);
  fab.autoHome();
  
  fab.print();
}

function paperTestCycle() {
  let p = positions[testState];
  fab.up(3);
  fab.move(p[0], p[1], p[2], p[3], p[4]);
  fab.print();
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
  // fab.commands = [];
  fab.setERelative();
  fab.autoHome();
  fab.setNozzleTemp(210);
  fab.setBedTemp(60);
  fab.introLine();
  fab.move(30,30,0.5);
  let o = 10;
  let s = 1000;
  let lx = 0;
  let ly = 0;
  let count = 0;
  for (let i = 0; i < 9; i++){
    fab.moveExtrude(200-lx, 30+ly, 0.3);
    console.log([200-lx, 30+ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
    fab.moveExtrude(200-lx, 200-ly, 0.3);
    console.log([200-lx, 200-ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
    fab.moveExtrude(30+lx, 200-ly, 0.3);
    console.log([30+lx, 200-ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
    fab.moveExtrude(30 +lx, 30+ly, 0.3);
    console.log([30+lx, 30+ly]);
    [count, lx, ly] = checkCount(count, lx, ly);
  }

  fab.up(10);

  // fab.move(30, 50, 0.2);
  // fab.moveExtrude(200, 50, 0.6);

  fab.presentPart();
  fab.print();
}

function checkCount(count, lx, ly) {
  count++;
  ly = (count+1) % 4 == 0 ? ly+10 : ly;
  lx = (count>0 && (count+1) % 4 == 1) ? lx+10 : lx;

  return [count, lx, ly]
}