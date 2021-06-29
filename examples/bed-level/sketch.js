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
  let lineFeedChar = 10;
  let incomingChar = gcoder.serial.readBytes();
  let resp = "";
  if (incomingChar[incomingChar.length - 1] == lineFeedChar) {
    for (let i = 0; i < incomingChar.length; i++) {
      resp += String.fromCharCode(incomingChar[i]);
    }
  }

  console.log("The response is: " + incomingChar);
  if (resp.search("k") > -1 || resp == "\n") {  // eek... sometimes o and k come in different packets!
    gcoder.emit("ok", gcoder);
  } else {
    console.log("waiting...");
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
  gcoder.commands = [];
  gcoder.autoHome();
  gcoder.setNozzleTemp(200);
  gcoder.setBedTemp(65);
  gcoder.move(30,30,0.5);
  let o = 10;
  let s = 1000;
  gcoder.moveExtrude(30,100, 0.5, s);
  gcoder.moveExtrude(100,100,0.5,s);
  gcoder.moveExtrude(100,30,0.5, s);
  gcoder.moveExtrude(30,30,0.5, s);
  // for (let l = 170; l > 10; l-=2*o) {
  //   gcoder.moveExtrude(30+l,30,0);
  //   gcoder.moveExtrude(30+l, 30+l-o,0);
  //   gcoder.moveExtrude(30+o, 30+l-o, 0);
  //   gcoder.moveExtrude(30+0, 30+0, 0);
  // }

  
  gcoder.print();
}