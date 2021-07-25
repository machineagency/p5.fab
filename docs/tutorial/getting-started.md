# Getting Started
This page has info on how to start using the p5.dicer library in p5.js with high level info on how the library works.

**Note 1:** This library relies on WebSerial support, and therefore is only supported on Chrome at this time. More options are in progress, but for now, *use Chrome!* 
**Note 2:** If you're running p5 locally, you'll need to launch [local server](https://github.com/processing/p5.js/wiki/Local-server) as well. Since we have to use Chrome already,
[Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb) is a good option to do this easily. If this sounds unfamiliar to you,
see my step-by-step guide [here](./local-server.md).

***

## Physical Setup
p5.dicer talks to your printer over serial communication. Turn your printer on and connect your Ender to your computer using a microUSB cable next to the input next to the SD card. Since we are streaming the print from the computer, the print will stop if your computer loses power or goes to sleep. I recommend turning your computer's sleep timer off, and keeping your computer powered if running a long print.

## p5 Setup
First, set up a Dicer object. It can optionally take several parameters to accomodate different 3D printers, but the default settings are for an Ender 3 Pro or V2. The WebSerial library requires user input to connect to a serial port, so we also set up UI elements to connect to the printer and start prints.

```
let dicer

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    dicer = createDicer();

    connectButton = createButton('connect!');
    connectButton.position(20, 20);
    connectButton.mousePressed(function() {
    dicer.serial.requestPort();
  });

    printButton = createButton('print!');
    printButton.position(20, 60);
    printButton.mousePressed(function() {
    dicer.print();
  });
}
```



